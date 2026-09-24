import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import type { StudyMaterial, StudySet } from '../model';
import { kindOf } from '../lib/card-kinds';
import { EXAM_SET_ID } from '../lib/sample';
import { isOwnerSetId } from '../lib/owner-set';

interface CardsHomeProps {
  sets: Array<{ set: StudySet; material: StudyMaterial }>;
  onStudy: (setId: string, index?: number) => void;
}

export function CardsHome({ sets, onStudy }: CardsHomeProps) {
  const [query, setQuery] = useState('');
  const indexSet = sets.length === 1
    ? sets[0]
    : sets.find((entry) => entry.set.id === EXAM_SET_ID);
  const terms = useMemo(() => {
    if (!indexSet || sets.length > 1) return [];
    const needle = query.trim().toLowerCase();
    return indexSet.material.terms
      .map((term, index) => ({ term, index }))
      .filter(({ term }) => {
        if (!needle) return true;
        return `${term.term} ${term.definition}`.toLowerCase().includes(needle);
      });
  }, [indexSet, query, sets.length]);

  const folders = [
    { title: 'CSCE 627', entries: sets.filter((entry) => entry.set.id === EXAM_SET_ID) },
    { title: 'Research', entries: sets.filter((entry) => isOwnerSetId(entry.set.id)) },
  ].filter((folder) => folder.entries.length > 0);

  return (
    <div className="cards-home fade-in">
      <h1 className="hero-title">Cards</h1>
      {folders.map((folder) => (
        <section key={folder.title} className="deck-set-list" aria-label={folder.title}>
          <h2 className="section-title">{folder.title}</h2>
          {folder.entries.map(({ set, material }) => (
            <button
              key={set.id}
              type="button"
              className="deck-row"
              onClick={() => onStudy(set.id, 0)}
            >
              <span className="deck-row-title">{set.title}</span>
              <span className="deck-row-meta">{material.terms.length} cards</span>
            </button>
          ))}
        </section>
      ))}

      {sets.length === 1 && indexSet && (
        <>
          <label className="card-search">
            <Search size={16} aria-hidden />
            <input
              className="input"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search a card"
              aria-label="Search cards"
              spellCheck={false}
            />
          </label>

          <ul className="card-index">
            {terms.map(({ term, index }) => {
              const kind = kindOf(term);
              return (
                <li key={term.id}>
                  <button type="button" className="card-index-item" onClick={() => onStudy(indexSet.set.id, index)}>
                    <span className="card-index-num">{index + 1}</span>
                    <span className="card-index-term">{term.term}</span>
                    {kind ? <span className={`card-index-kind place-${kind.place}`}>{kind.label}</span> : null}
                  </button>
                </li>
              );
            })}
          </ul>
          {terms.length === 0 && <p className="drop-hint">No card matches that search.</p>}
        </>
      )}
    </div>
  );
}
