import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import type { StudyMaterial, StudySet } from '../model';
import { DECK_INFO, type DeckFilter, inDeck, kindOf } from '../lib/card-kinds';
import { EXAM_SET_ID } from '../lib/sample';
import { isOwnerSetId } from '../lib/owner-set';

interface CardsHomeProps {
  sets: Array<{ set: StudySet; material: StudyMaterial }>;
  onStudy: (setId: string, index?: number, deck?: DeckFilter) => void;
}

const HOME_DECKS: readonly DeckFilter[] = ['priority', 'tuples', 'gym', 'term', 'rule', 'theorem', 'example'];

export function CardsHome({ sets, onStudy }: CardsHomeProps) {
  const [query, setQuery] = useState('');
  const indexSet = sets.length === 1
    ? sets[0]
    : sets.find((entry) => entry.set.id === EXAM_SET_ID);
  const hasKinds = useMemo(
    () => Boolean(indexSet && indexSet.material.terms.some((card) => kindOf(card))),
    [indexSet],
  );
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

  return (
    <div className="cards-home fade-in">
      <h1 className="hero-title">Cards</h1>
      <div className={sets.length > 1 ? 'deck-set-list' : undefined}>
        {sets.map(({ set, material }) => (
          <button
            key={set.id}
            type="button"
            className="deck-row"
            onClick={() => onStudy(set.id, 0, 'all')}
          >
            <span className="deck-row-title">
              {set.title}
              {isOwnerSetId(set.id) ? <span className="deck-row-private">Private</span> : null}
            </span>
            <span className="deck-row-meta">{material.terms.length} cards</span>
          </button>
        ))}
      </div>

      {indexSet && hasKinds && (
        <section className="kind-rows" aria-label="Study by card type">
          <h2 className="kind-rows-title">Pick by where you are</h2>
          <div className="kind-grid">
            {HOME_DECKS.map((deck) => {
              const info = DECK_INFO[deck];
              return (
                <button
                  key={deck}
                  type="button"
                  className={`kind-row ${deck === 'priority' || deck === 'tuples' || deck === 'gym' ? 'kind-row-wide' : ''} ${deck === 'priority' || deck === 'tuples' ? 'kind-row-priority' : ''}`}
                  onClick={() => onStudy(indexSet.set.id, 0, deck)}
                >
                  <span className="kind-row-top">
                    <span className="kind-row-name">{info.label}</span>
                    {info.place ? (
                      <span className={`place-tag place-${info.place}`}>{info.place === 'gym' ? 'Gym' : 'Desk'}</span>
                    ) : null}
                  </span>
                  <span className="kind-row-hint">{info.short}</span>
                  <span className="kind-row-count">
                    {indexSet.material.terms.filter((card) => inDeck(card, deck)).length} cards
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}

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
                  <button type="button" className="card-index-item" onClick={() => onStudy(indexSet.set.id, index, 'all')}>
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
