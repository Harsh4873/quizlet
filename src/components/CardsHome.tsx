import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import type { StudyMaterial, StudySet } from '../model';

interface CardsHomeProps {
  set: StudySet;
  material: StudyMaterial;
  onStudy: (index: number) => void;
}

export function CardsHome({ set, material, onStudy }: CardsHomeProps) {
  const [query, setQuery] = useState('');
  const terms = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return material.terms
      .map((term, index) => ({ term, index }))
      .filter(({ term }) => {
        if (!needle) return true;
        return `${term.term} ${term.definition}`.toLowerCase().includes(needle);
      });
  }, [material.terms, query]);

  return (
    <div className="cards-home fade-in">
      <h1 className="hero-title">Cards</h1>
      <button type="button" className="deck-row" onClick={() => onStudy(0)}>
        <span className="deck-row-title">{set.title}</span>
        <span className="deck-row-meta">{material.terms.length} cards</span>
      </button>

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
        {terms.map(({ term, index }) => (
          <li key={term.id}>
            <button type="button" className="card-index-item" onClick={() => onStudy(index)}>
              <span className="card-index-num">{index + 1}</span>
              <span className="card-index-term">{term.term}</span>
            </button>
          </li>
        ))}
      </ul>
      {terms.length === 0 && <p className="drop-hint">No card matches that search.</p>}
    </div>
  );
}
