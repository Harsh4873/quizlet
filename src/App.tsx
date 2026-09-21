import { useEffect, useRef, useState } from 'react';
import { GraduationCap, Monitor, Moon, Sun } from 'lucide-react';
import type { AppData, Mode, StudyMaterial, StudySet, SyncStatus, Theme } from './model';
import { MODES } from './model';
import type { CloudEngine } from './lib/cloud';
import { extractStudyMaterial } from './lib/extract';
import { parseMarkdown } from './lib/markdown';
import { normalizeHtmlInMarkdown } from './lib/html-text';
import {
  deleteSet,
  exportSetJson,
  getProgress,
  loadAccountData,
  loadData,
  loadOrAdoptOwnerVaultData,
  nextDataTimestamp,
  parseSetExport,
  readActiveAccountId,
  recordAnswer,
  saveAccountData,
  saveData,
  toggleStar,
  upsertSet,
  withProgress,
  writeActiveAccountId,
} from './lib/store';
import { recordBestMatch } from './lib/sync-core';
import { EXAM_SET_ID, EXAM_SET_TITLE } from './lib/sample';
import { ensureQuizletLibrary } from './lib/quizlet-library';
import { Library, type ImportItem } from './components/Library';
import { SetShell } from './components/SetShell';
import { SyncMenu } from './components/SyncMenu';
import { isPaperSet } from './lib/paper-set';

const SYNC_FLAG_KEY = 'recall.sync.on';

function syncFlag(): boolean {
  try {
    return localStorage.getItem(SYNC_FLAG_KEY) === '1';
  } catch {
    return false;
  }
}

function setSyncFlag(on: boolean) {
  try {
    if (on) localStorage.setItem(SYNC_FLAG_KEY, '1');
    else localStorage.removeItem(SYNC_FLAG_KEY);
  } catch {
    /* storage blocked */
  }
}

type Route =
  | { view: 'library' }
  | { view: 'set'; setId: string; mode: Mode };

function parseHash(): Route {
  const parts = window.location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  if (parts[0] === 'set' && parts[1]) {
    const mode = (MODES as readonly string[]).includes(parts[2]) ? (parts[2] as Mode) : 'cards';
    return { view: 'set', setId: parts[1], mode };
  }
  if (parts[0] === 'library' || parts[0] === 'flashcards' || parts[0] === 'recall') {
    return { view: 'library' };
  }
  // Home and any papers/review leftover hashes open the Exam 1 cards.
  return { view: 'set', setId: EXAM_SET_ID, mode: 'cards' };
}

function navigate(hash: string) {
  window.location.hash = hash;
}

function openExamCards() {
  navigate(`/set/${EXAM_SET_ID}/cards`);
}

export default function App() {
  const activeAccountRef = useRef<string | null>(readActiveAccountId());
  const [data, setData] = useState<AppData>(() => ensureQuizletLibrary(
    activeAccountRef.current ? loadAccountData(activeAccountRef.current) : loadData(),
  ));
  const dataRef = useRef(data);
  dataRef.current = data;
  const [route, setRoute] = useState<Route>(parseHash);
  const [notice, setNotice] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({ state: 'off' });
  const cloudRef = useRef<CloudEngine | null>(null);

  const bootCloud = async (): Promise<CloudEngine> => {
    const { startCloud } = await import('./lib/cloud');
    const engine = startCloud({
      onStatus: setSyncStatus,
      onAccount: (vaultId, legacyUid) => {
        const previousUid = activeAccountRef.current;
        if (previousUid === vaultId) return dataRef.current;

        if (previousUid) {
          saveAccountData(previousUid, dataRef.current);
        }

        const next = ensureQuizletLibrary(loadOrAdoptOwnerVaultData(
          vaultId,
          legacyUid,
          previousUid,
          dataRef.current,
        ));
        activeAccountRef.current = vaultId;
        writeActiveAccountId(vaultId);
        dataRef.current = next;
        setData(next);
        return next;
      },
      onRemote: (fold) => setData((d) => ensureQuizletLibrary(fold(d))),
    });
    cloudRef.current = engine;
    return engine;
  };

  useEffect(() => {
    if (syncFlag()) void bootCloud();
  }, []);

  const enableSync = async () => {
    setSyncFlag(true);
    const engine = await bootCloud();
    await engine.signIn();
  };

  const switchSyncAccount = async () => {
    setSyncFlag(true);
    const engine = await bootCloud();
    await engine.switchAccount();
  };

  const disableSync = async () => {
    setSyncFlag(false);
    setSyncStatus({ state: 'off' });
    await cloudRef.current?.signOut();
  };

  useEffect(() => {
    const onHash = () => setRoute(parseHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    const uid = activeAccountRef.current;
    const curated = ensureQuizletLibrary(data);
    if (curated !== data) {
      setData(curated);
      return;
    }
    if (uid) saveAccountData(uid, curated);
    else saveData(curated);
    cloudRef.current?.push(curated);
  }, [data]);

  useEffect(() => {
    const root = document.documentElement;
    if (data.theme === 'auto') delete root.dataset.theme;
    else root.dataset.theme = data.theme;
  }, [data.theme]);

  useEffect(() => {
    if (!notice) return;
    const id = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(id);
  }, [notice]);

  const materialCache = useRef(new Map<string, StudyMaterial>());
  const materialFor = (set: StudySet): StudyMaterial => {
    const key = `${set.id}:${set.updatedAt}`;
    let material = materialCache.current.get(key);
    if (!material) {
      material = extractStudyMaterial(set.markdown);
      materialCache.current.set(key, material);
      if (materialCache.current.size > 50) {
        const first = materialCache.current.keys().next().value;
        if (first) materialCache.current.delete(first);
      }
    }
    return material;
  };

  const importItems = (items: ImportItem[]) => {
    const errors: string[] = [];
    let next = data;
    let imported = false;
    for (const item of items) {
      if (item.error) {
        errors.push(item.error);
        continue;
      }
      try {
        let markdown = item.markdown ?? '';
        let title = item.title;
        if (item.json !== undefined) {
          const parsed = parseSetExport(item.json);
          markdown = parsed.markdown;
          title = parsed.title;
        }
        if (!markdown.trim()) {
          errors.push('Nothing to import — the file was empty.');
          continue;
        }
        markdown = normalizeHtmlInMarkdown(markdown);
        const docTitle = parseMarkdown(markdown).title;
        const stamp = nextDataTimestamp(next);
        const existing = next.sets.find((set) => set.id === EXAM_SET_ID);
        const set: StudySet = {
          id: EXAM_SET_ID,
          title: (title || docTitle || EXAM_SET_TITLE).trim() || EXAM_SET_TITLE,
          markdown,
          createdAt: existing?.createdAt ?? stamp,
          updatedAt: stamp,
        };
        next = upsertSet(next, set);
        if (next.tombstones[EXAM_SET_ID]) {
          const { [EXAM_SET_ID]: _removed, ...tombstones } = next.tombstones;
          next = { ...next, tombstones };
        }
        imported = true;
      } catch {
        errors.push(item.title ? `“${item.title}” is not a valid export.` : 'That JSON is not a valid export.');
      }
    }
    setData(ensureQuizletLibrary(next));
    if (errors.length > 0) setNotice(errors[0]);
    else if (imported) {
      setNotice('Updated Exam 1.');
      navigate(`/set/${EXAM_SET_ID}/cards`);
    }
  };

  const removeSet = (set: StudySet) => {
    if (set.id === EXAM_SET_ID) {
      setNotice('Exam 1 cannot be removed.');
      return;
    }
    if (isPaperSet(set.id)) {
      setNotice('Paper sets stay in Research.');
      return;
    }
    if (!window.confirm(`Remove “${set.title}” and its progress? This also removes it from synced devices.`)) return;
    setData((d) => ensureQuizletLibrary(deleteSet(d, set.id, nextDataTimestamp(d))));
    openExamCards();
  };

  const exportSet = (set: StudySet) => {
    const blob = new Blob([exportSetJson(set)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${set.title.replace(/[^\w\d-]+/g, '-').replace(/^-+|-+$/g, '') || 'quizlet-set'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const answerFor = (setId: string) => (cardId: string, correct: boolean) => {
    setData((d) => withProgress(
      d,
      setId,
      recordAnswer(getProgress(d, setId), cardId, correct, nextDataTimestamp(d)),
    ));
  };

  const starFor = (setId: string) => (cardId: string) => {
    setData((d) => withProgress(
      d,
      setId,
      toggleStar(getProgress(d, setId), cardId, nextDataTimestamp(d)),
    ));
  };

  const bestTimeFor = (setId: string) => (ms: number) => {
    setData((d) => withProgress(
      d,
      setId,
      recordBestMatch(getProgress(d, setId), ms, nextDataTimestamp(d)),
    ));
  };

  const saveMarkdown = (set: StudySet) => (markdown: string) => {
    setData((d) => {
      const current = d.sets.find((candidate) => candidate.id === set.id) ?? set;
      return upsertSet(d, { ...current, markdown, updatedAt: nextDataTimestamp(d) });
    });
  };

  const appendNote = (set: StudySet) => (note: string) => {
    const heading = /(^|\n)## Added notes\s*(\n|$)/i.test(set.markdown) ? '' : '\n\n## Added notes';
    const markdown = `${set.markdown.trimEnd()}${heading}\n\n${note.trim()}\n`;
    setData((d) => {
      const current = d.sets.find((candidate) => candidate.id === set.id) ?? set;
      return upsertSet(d, { ...current, markdown, updatedAt: nextDataTimestamp(d) });
    });
    setNotice('Note added. Your study material has been refreshed.');
  };

  const cycleTheme = () => {
    const order: Theme[] = ['auto', 'light', 'dark'];
    setData((d) => ({ ...d, theme: order[(order.indexOf(d.theme) + 1) % order.length] }));
  };

  const flashcardSets = data.sets.filter((set) => !isPaperSet(set.id));
  const activeSet = route.view === 'set' ? data.sets.find((s) => s.id === route.setId) : undefined;
  const examSet = data.sets.find((s) => s.id === EXAM_SET_ID);

  useEffect(() => {
    if (route.view === 'set' && !activeSet) openExamCards();
  }, [route, activeSet]);

  useEffect(() => {
    if (!window.location.hash || window.location.hash === '#' || window.location.hash === '#/') {
      openExamCards();
    }
  }, []);

  const themeIcon = data.theme === 'light' ? <Sun size={16} aria-hidden /> : data.theme === 'dark' ? <Moon size={16} aria-hidden /> : <Monitor size={16} aria-hidden />;

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-inner">
          <button type="button" className="brand" onClick={openExamCards}>
            <span className="brand-badge">
              <GraduationCap size={18} aria-hidden />
            </span>
            Quizlet
          </button>
          <nav className="header-nav" aria-label="Sections">
            <button
              type="button"
              className={`header-tab header-tab-study ${route.view === 'set' ? 'header-tab-active' : ''}`}
              onClick={openExamCards}
            >
              Exam 1
            </button>
            <button
              type="button"
              className={`header-tab header-tab-study ${route.view === 'library' ? 'header-tab-active' : ''}`}
              onClick={() => navigate('/library')}
            >
              Import
            </button>
          </nav>
          <div className="header-actions">
            <SyncMenu
              status={syncStatus}
              onEnable={() => void enableSync()}
              onSignOut={() => void disableSync()}
              onSwitchAccount={() => void switchSyncAccount()}
            />
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={cycleTheme}
              title={`Theme: ${data.theme}`}
              aria-label={`Theme: ${data.theme}. Click to change.`}
            >
              {themeIcon} {data.theme === 'auto' ? 'Auto' : data.theme === 'light' ? 'Light' : 'Dark'}
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        {notice && (
          <div className="notice fade-in" role="status">
            {notice}
          </div>
        )}
        {route.view === 'set' && activeSet ? (
          <SetShell
            key={activeSet.id}
            set={activeSet}
            material={materialFor(activeSet)}
            progress={getProgress(data, activeSet.id)}
            mode={route.mode}
            onNavigate={(mode) => navigate(`/set/${activeSet.id}/${mode}`)}
            onBack={() => navigate('/library')}
            backLabel="Import"
            onAnswer={answerFor(activeSet.id)}
            onToggleStar={starFor(activeSet.id)}
            onBestTime={bestTimeFor(activeSet.id)}
            onSaveMarkdown={saveMarkdown(activeSet)}
            onAddNote={appendNote(activeSet)}
            onDelete={() => removeSet(activeSet)}
            onExport={() => exportSet(activeSet)}
          />
        ) : (
          <Library
            data={{ ...data, sets: flashcardSets }}
            materialFor={materialFor}
            onImport={importItems}
            onLoadSample={() => {
              if (!examSet) return;
              navigate(`/set/${EXAM_SET_ID}/cards`);
            }}
            onDelete={removeSet}
            onExport={exportSet}
            onOpen={(set) => navigate(`/set/${set.id}/cards`)}
          />
        )}
      </main>

      <footer className="app-footer">
        Flashcards stay on this device. Turn on Sync only if you want them on your other devices.
      </footer>
    </div>
  );
}
