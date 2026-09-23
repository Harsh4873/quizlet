import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import type { StudyMaterial, StudySet } from '../model';
import { DECK_INFO, type DeckFilter, inDeck, kindOf } from '../lib/card-kinds';

interface CardsHomeProps {
  set: StudySet;
  material: StudyMaterial;
  onStudy: (index: number, deck: DeckFilter) => void;
}

const HOME_DECKS: readonly DeckFilter[] = ['gym', 'term', 'rule', 'theorem', 'example'];

export function CardsHome({ set, material, onStudy }: CardsHomeProps) {
  const [query, setQuery] = useState('');
  const hasKinds = useMemo(() => material.terms.some((card) => kindOf(card)), [material]);
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
      <button type="button" className="deck-row" onClick={() => onStudy(0, 'all')}>
        <span className="deck-row-title">{set.title}</span>
        <span className="deck-row-meta">{material.terms.length} cards</span>
      </button>

      {hasKinds && (
        <section className="kind-rows" aria-label="Study by card type">
          <h2 className="kind-rows-title">Pick by where you are</h2>
          <div className="kind-grid">
            {HOME_DECKS.map((deck) => {
              const info = DECK_INFO[deck];
              return (
                <button
                  key={deck}
                  type="button"
                  className={`kind-row ${deck === 'gym' ? 'kind-row-wide' : ''}`}
                  onClick={() => onStudy(0, deck)}
                >
                  <span className="kind-row-top">
                    <span className="kind-row-name">{info.label}</span>
                    {info.place ? (
                      <span className={`place-tag place-${info.place}`}>{info.place === 'gym' ? 'Gym' : 'Desk'}</span>
                    ) : null}
                  </span>
                  <span className="kind-row-hint">{info.short}</span>
                  <span className="kind-row-count">
                    {material.terms.filter((card) => inDeck(card, deck)).length} cards
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}

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
              <button type="button" className="card-index-item" onClick={() => onStudy(index, 'all')}>
                <span className="card-index-num">{index + 1}</span>
                <span className="card-index-term">{term.term}</span>
                {kind ? <span className={`card-index-kind place-${kind.place}`}>{kind.label}</span> : null}
              </button>
            </li>
          );
        })}
      </ul>
      {terms.length === 0 && <p className="drop-hint">No card matches that search.</p>}
    </div>
  );
}
