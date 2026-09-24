import { useMemo, useRef, useState, type DragEvent } from 'react';
import { ClipboardPaste, Download, FilePlus2, Search, Sparkles, Trash2, Upload, X } from 'lucide-react';
import type { AppData, StudyMaterial, StudySet } from '../model';
import { masteryPercent } from '../lib/store';
import { EXAM_SET_ID } from '../lib/sample';
import { OWNER_BASIL_CS_STATS_ID, isOwnerSetId } from '../lib/owner-set';

export interface ImportItem {
  title?: string;
  markdown?: string;
  json?: string;
  error?: string;
  setId?: string;
}

interface LibraryProps {
  data: AppData;
  materialFor: (set: StudySet) => StudyMaterial;
  onImport: (items: ImportItem[]) => void;
  onLoadSample: () => void;
  onDelete: (set: StudySet) => void;
  onExport: (set: StudySet) => void;
  onOpen: (set: StudySet) => void;
  allowOwnerSets?: boolean;
  onAddOwnerBasilSet?: () => void;
}

export function Library({
  data,
  materialFor,
  onImport,
  onLoadSample,
  onDelete,
  onExport,
  onOpen,
  allowOwnerSets = false,
  onAddOwnerBasilSet,
}: LibraryProps) {
  const [pasteOpen, setPasteOpen] = useState(data.sets.length === 0);
  const [pasteTitle, setPasteTitle] = useState('');
  const [pasteBody, setPasteBody] = useState('');
  const [importTarget, setImportTarget] = useState(EXAM_SET_ID);
  const [dragOver, setDragOver] = useState(false);
  const [filter, setFilter] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);
  const targetId = allowOwnerSets && importTarget === OWNER_BASIL_CS_STATS_ID
    ? OWNER_BASIL_CS_STATS_ID
    : EXAM_SET_ID;
  const hasOwnerBasilSet = data.sets.some((set) => set.id === OWNER_BASIL_CS_STATS_ID);

  const visible = useMemo(() => {
    const fold = (text: string) =>
      text
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '');
    const tokens = fold(filter)
      .split(/[\s,;]+/)
      .map((token) => token.trim())
      .filter((token) => token.length > 1);
    if (tokens.length === 0) return data.sets;
    return data.sets.filter((set) => {
      const title = fold(set.title);
      const hay = `${title}\n${fold(set.markdown)}`;
      const words = title.split(/[^a-z0-9]+/).filter((word) => word.length > 1);
      return tokens.every((token) => hay.includes(token) || words.some((word) => word.startsWith(token)));
    });
  }, [data.sets, filter]);

  const submitPaste = () => {
    if (!pasteBody.trim()) return;
    onImport([{ title: pasteTitle.trim() || undefined, markdown: pasteBody, setId: targetId }]);
    setPasteTitle('');
    setPasteBody('');
  };

  const handleFiles = async (files: FileList | File[]) => {
    const items: ImportItem[] = [];
    for (const file of Array.from(files)) {
      const name = file.name.replace(/\.(md|markdown|txt|json)$/i, '');
      try {
        const text = await file.text();
        if (/\.json$/i.test(file.name)) items.push({ title: name, json: text, setId: targetId });
        else items.push({ title: name, markdown: text, setId: targetId });
      } catch {
        items.push({ error: `Could not read ${file.name}` });
      }
    }
    if (items.length > 0) onImport(items);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) void handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="library fade-in">
      {data.sets.length === 0 && (
        <section className="hero">
          <h1 className="hero-title">Exam 1 flashcards</h1>
          <p className="hero-sub">
            One study set: flashcards, quiz, blanks, and match. Import replaces Exam 1.
          </p>
        </section>
      )}

      <section
        className={`import-panel ${dragOver ? 'import-dragover' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        aria-label="Import notes"
      >
        <div className="import-actions">
          <button type="button" className="btn btn-primary" onClick={() => setPasteOpen((v) => !v)}>
            <ClipboardPaste size={16} aria-hidden /> Paste markdown
          </button>
          <button type="button" className="btn" onClick={() => fileInput.current?.click()}>
            <Upload size={16} aria-hidden /> Upload files
          </button>
          <button type="button" className="btn btn-ghost" onClick={onLoadSample}>
            <Sparkles size={16} aria-hidden /> Open Exam 1
          </button>
          {allowOwnerSets && !hasOwnerBasilSet && onAddOwnerBasilSet && (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                onAddOwnerBasilSet();
                setImportTarget(OWNER_BASIL_CS_STATS_ID);
                setPasteOpen(true);
              }}
            >
              <FilePlus2 size={16} aria-hidden /> Add Basil CS/stats
            </button>
          )}
          <input
            ref={fileInput}
            type="file"
            accept=".md,.markdown,.txt,.json,text/markdown,text/plain,application/json"
            multiple
            hidden
            onChange={(e) => {
              if (e.target.files) void handleFiles(e.target.files);
              e.target.value = '';
            }}
          />
        </div>
        {allowOwnerSets && (
          <fieldset className="import-target">
            <legend className="import-target-label">Import into</legend>
            <label className="import-target-option">
              <input
                type="radio"
                name="import-target"
                checked={targetId === EXAM_SET_ID}
                onChange={() => setImportTarget(EXAM_SET_ID)}
              />
              Exam 1
            </label>
            <label className="import-target-option">
              <input
                type="radio"
                name="import-target"
                checked={targetId === OWNER_BASIL_CS_STATS_ID}
                onChange={() => setImportTarget(OWNER_BASIL_CS_STATS_ID)}
              />
              Basil CS/stats (private)
            </label>
          </fieldset>
        )}
        <p className="drop-hint">
          {targetId === OWNER_BASIL_CS_STATS_ID
            ? <>…or drop a <code>.md</code> or export <code>.json</code> into the private Basil set.</>
            : <>…or drop a <code>.md</code> or export <code>.json</code> to replace Exam 1.</>}
        </p>

        {pasteOpen && (
          <div className="paste-form fade-in">
            <input
              className="input"
              placeholder="Set title (optional — taken from the first heading if empty)"
              value={pasteTitle}
              onChange={(e) => setPasteTitle(e.target.value)}
            />
            <textarea
              className="textarea"
              rows={10}
              placeholder={'# Topic\n\n- **Term**: definition\n- Another term: what it means\n\nProse with **key phrases** in bold becomes fill-in-the-blank cards.'}
              value={pasteBody}
              onChange={(e) => setPasteBody(e.target.value)}
            />
            <div className="paste-form-actions">
              <button type="button" className="btn btn-primary" disabled={!pasteBody.trim()} onClick={submitPaste}>
                <FilePlus2 size={16} aria-hidden /> {targetId === OWNER_BASIL_CS_STATS_ID ? 'Save Basil CS/stats' : 'Replace Exam 1'}
              </button>
            </div>
          </div>
        )}
      </section>

      {data.sets.length > 0 && (
        <section className="sets-section" aria-label="Your study sets">
          <div className="library-head">
            <h2 className="section-title">Your sets</h2>
            {data.sets.length > 0 && (
              <div className="review-search-field library-filter">
                <Search size={16} aria-hidden />
                <input
                  className="input"
                  value={filter}
                  onChange={(event) => setFilter(event.target.value)}
                  placeholder="Search title, notes…"
                  aria-label="Search your sets"
                  spellCheck={false}
                />
                {filter && (
                  <button type="button" className="find-clear" onClick={() => setFilter('')} aria-label="Clear search">
                    <X size={15} aria-hidden />
                  </button>
                )}
              </div>
            )}
            {filter.trim() && (
              <p className="find-count">
                {visible.length} of {data.sets.length} {data.sets.length === 1 ? 'set' : 'sets'}
              </p>
            )}
          </div>
          {visible.length === 0 ? (
            <div className="mode-empty">
              <p>Nothing in your sets matches “{filter.trim()}”.</p>
            </div>
          ) : (
          <div className="sets-grid">
            {visible.map((set) => {
              const material = materialFor(set);
              const progress = data.progress[set.id] ?? { cards: {} };
              const ids = [...material.terms.map((t) => t.id), ...material.clozes.map((c) => c.id)];
              const mastery = masteryPercent(progress, ids);
              return (
                <div key={set.id} className="set-card">
                  <button type="button" className="set-card-main" onClick={() => onOpen(set)}>
                    <div className="set-card-title">{set.title}</div>
                    <div className="set-card-meta">
                      {isOwnerSetId(set.id) && <span className="meta-chip">Private</span>}
                      <span className="meta-chip">{material.stats.terms} terms</span>
                      <span className="meta-chip">{material.stats.clozes} blanks</span>
                      <span className="meta-chip">{material.stats.readingMinutes} min</span>
                    </div>
                    <div className="mastery-row">
                      <div className="mastery-bar">
                        <div className="mastery-fill" style={{ width: `${mastery}%` }} />
                      </div>
                      <span className="mastery-num">{mastery}%</span>
                    </div>
                  </button>
                  <div className="set-card-actions">
                    <button type="button" className="icon-btn" onClick={() => onExport(set)} aria-label={`Export ${set.title}`} title="Export as JSON">
                      <Download size={16} aria-hidden />
                    </button>
                    <button type="button" className="icon-btn icon-btn-danger" onClick={() => onDelete(set)} aria-label={`Remove ${set.title}`} title="Remove set">
                      <Trash2 size={16} aria-hidden />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          )}
        </section>
      )}
    </div>
  );
}
