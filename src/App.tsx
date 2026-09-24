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
  defaultData,
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
import {
  clearSetTombstone,
  ensureQuizletLibrary,
  libraryAfterRejectedAccount,
  libraryOnOpen,
} from './lib/quizlet-library';
import {
  OWNER_BASIL_CS_STATS_ID,
  OWNER_BASIL_CS_STATS_TITLE,
  createOwnerBasilCsStatsSet,
  isOwnerSetId,
} from './lib/owner-set';
import { Library, type ImportItem } from './components/Library';
import { CardsHome } from './components/CardsHome';
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
  | { view: 'home' }
  | { view: 'cards' }
  | { view: 'set'; setId: string; mode: Mode; card: number };

function parseHash(): Route {
  const parts = window.location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  if (parts[0] === 'set' && parts[1]) {
    const mode = (MODES as readonly string[]).includes(parts[2]) ? (parts[2] as Mode) : 'cards';
    const card = Number(parts[3]);
    return {
      view: 'set',
      setId: parts[1],
      mode,
      card: Number.isFinite(card) ? card : 0,
    };
  }
  if (parts[0] === 'cards') return { view: 'cards' };
  return { view: 'home' };
}

function navigate(hash: string) {
  window.location.hash = hash;
}

function openHome() {
  navigate('/home');
}

function openCards() {
  navigate('/cards');
}

function openSetCards(setId: string, index = 0) {
  navigate(`/set/${setId}/cards/${index}`);
}

export default function App() {
  const activeAccountRef = useRef<string | null>(readActiveAccountId());
  const ownerReadyRef = useRef(false);
  const [ownerReady, setOwnerReady] = useState(false);
  const [data, setData] = useState<AppData>(() => libraryOnOpen(
    activeAccountRef.current,
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
        ownerReadyRef.current = true;
        setOwnerReady(true);

        if (previousUid === vaultId) {
          const next = ensureQuizletLibrary(dataRef.current);
          dataRef.current = next;
          setData(next);
          return next;
        }

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
    ownerReadyRef.current = false;
    setOwnerReady(false);
    setSyncFlag(false);
    setSyncStatus({ state: 'off' });
    await cloudRef.current?.signOut();
    setData((current) => libraryAfterRejectedAccount(current));
  };

  useEffect(() => {
    const onHash = () => setRoute(parseHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    if (syncStatus.wrongAccount) {
      ownerReadyRef.current = false;
      setOwnerReady(false);
      setData((current) => {
        const cleared = libraryAfterRejectedAccount(current);
        return cleared.sets.length === current.sets.length && current.sets.length === 0 ? current : cleared;
      });
    }
  }, [syncStatus.wrongAccount]);

  useEffect(() => {
    if (!ownerReadyRef.current) {
      if (!activeAccountRef.current) saveData({ ...defaultData(), theme: data.theme });
      return;
    }
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
    if (!ownerReadyRef.current) {
      setNotice('Sign in with Sync before adding cards.');
      return;
    }
    const errors: string[] = [];
    let next = data;
    let importedId: string | null = null;
    let importedTitle = EXAM_SET_TITLE;
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
        const targetId = item.setId === OWNER_BASIL_CS_STATS_ID ? OWNER_BASIL_CS_STATS_ID : EXAM_SET_ID;
        const fallbackTitle = targetId === OWNER_BASIL_CS_STATS_ID ? OWNER_BASIL_CS_STATS_TITLE : EXAM_SET_TITLE;
        const stamp = nextDataTimestamp(next);
        const existing = next.sets.find((set) => set.id === targetId);
        const set: StudySet = {
          id: targetId,
          title: (title || docTitle || fallbackTitle).trim() || fallbackTitle,
          markdown,
          createdAt: existing?.createdAt ?? stamp,
          updatedAt: stamp,
        };
        next = clearSetTombstone(upsertSet(next, set), targetId);
        importedId = targetId;
        importedTitle = set.title;
      } catch {
        errors.push(item.title ? `“${item.title}” is not a valid export.` : 'That JSON is not a valid export.');
      }
    }
    setData(ensureQuizletLibrary(next));
    if (errors.length > 0) setNotice(errors[0]);
    else if (importedId) {
      setNotice(importedId === EXAM_SET_ID ? 'Updated Exam 1.' : `Updated ${importedTitle}.`);
      if (importedId === EXAM_SET_ID) openCards();
      else openSetCards(importedId);
    }
  };

  const addOwnerBasilSet = () => {
    const existing = data.sets.find((set) => set.id === OWNER_BASIL_CS_STATS_ID);
    if (existing) {
      openSetCards(OWNER_BASIL_CS_STATS_ID);
      return;
    }
    const stamp = nextDataTimestamp(data);
    const next = clearSetTombstone(upsertSet(data, createOwnerBasilCsStatsSet(stamp)), OWNER_BASIL_CS_STATS_ID);
    setData(ensureQuizletLibrary(next));
    setNotice('Private Basil set added. Paste markdown to fill it.');
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
    openCards();
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

  const flashcardSets = data.sets
    .filter((set) => !isPaperSet(set.id))
    .sort((a, b) => {
      if (a.id === EXAM_SET_ID) return -1;
      if (b.id === EXAM_SET_ID) return 1;
      return a.title.localeCompare(b.title);
    });
  const activeSet = route.view === 'set' ? data.sets.find((s) => s.id === route.setId) : undefined;
  const examSet = data.sets.find((s) => s.id === EXAM_SET_ID);
  const allowOwnerSets =
    syncStatus.state === 'synced'
    || syncStatus.state === 'syncing'
    || data.sets.some((set) => isOwnerSetId(set.id));

  useEffect(() => {
    if (route.view === 'set' && !activeSet) openCards();
  }, [route, activeSet]);

  const themeIcon = data.theme === 'light' ? <Sun size={16} aria-hidden /> : data.theme === 'dark' ? <Moon size={16} aria-hidden /> : <Monitor size={16} aria-hidden />;

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-inner">
          <button type="button" className="brand" onClick={openHome}>
            <span className="brand-badge">
              <GraduationCap size={18} aria-hidden />
            </span>
            Quizlet
          </button>
          <nav className="header-nav" aria-label="Sections">
            <button
              type="button"
              className={`header-tab header-tab-study ${route.view === 'home' ? 'header-tab-active' : ''}`}
              onClick={openHome}
            >
              Home
            </button>
            <button
              type="button"
              className={`header-tab header-tab-study ${route.view === 'cards' || route.view === 'set' ? 'header-tab-active' : ''}`}
              onClick={openCards}
            >
              Cards
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
            startIndex={route.card}
            onNavigate={(mode) => navigate(`/set/${activeSet.id}/${mode}`)}
            onBack={openCards}
            backLabel="Cards"
            canDelete={activeSet.id !== EXAM_SET_ID}
            onAnswer={answerFor(activeSet.id)}
            onToggleStar={starFor(activeSet.id)}
            onBestTime={bestTimeFor(activeSet.id)}
            onSaveMarkdown={saveMarkdown(activeSet)}
            onAddNote={appendNote(activeSet)}
            onDelete={() => removeSet(activeSet)}
            onExport={() => exportSet(activeSet)}
          />
        ) : route.view === 'cards' && flashcardSets.length > 0 ? (
          <CardsHome
            sets={flashcardSets.map((set) => ({ set, material: materialFor(set) }))}
            onStudy={openSetCards}
          />
        ) : (
          <Library
            data={{ ...data, sets: flashcardSets }}
            materialFor={materialFor}
            allowOwnerSets={allowOwnerSets}
            canImport={ownerReady}
            onImport={importItems}
            onAddOwnerBasilSet={addOwnerBasilSet}
            onLoadSample={() => {
              if (!examSet) return;
              openSetCards(EXAM_SET_ID);
            }}
            onDelete={removeSet}
            onExport={exportSet}
            onOpen={(set) => openSetCards(set.id)}
          />
        )}
      </main>

      <footer className="app-footer">
        Flashcards stay on this device. Turn on Sync only if you want them on your other devices.
      </footer>
    </div>
  );
}
