import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, RotateCcw, Search, Shuffle, Star, X } from 'lucide-react';
import type { SetProgress, StudyMaterial, TermCard } from '../model';
import { mulberry32, shuffle } from '../lib/questions';
import {
  DECK_FILTERS,
  DECK_INFO,
  type DeckFilter,
  inDeck,
  kindOf,
  loadSavedDeck,
  saveDeck,
} from '../lib/card-kinds';
import { ExamFigure } from './Machine';

type Filter = 'all' | 'weak' | 'starred';

interface FlashcardsProps {
  material: StudyMaterial;
  progress: SetProgress;
  onAnswer: (cardId: string, correct: boolean) => void;
  onToggleStar: (cardId: string) => void;
  startIndex?: number;
  /** Card type to open with. An index without a type means the whole deck. */
  startDeck?: DeckFilter;
}

function textSizeClass(text: string): string {
  if (text.length > 240) return 'face-text-xlong';
  if (text.length > 120) return 'face-text-long';
  return '';
}

export function Flashcards({ material, progress, onAnswer, onToggleStar, startIndex = 0, startDeck }: FlashcardsProps) {
  const hasKinds = useMemo(() => material.terms.some((card) => kindOf(card)), [material]);
  const [deckFilter, setDeckFilter] = useState<DeckFilter>(() => {
    if (!hasKinds) return 'all';
    if (startDeck) return startDeck;
    return startIndex > 0 ? 'all' : (loadSavedDeck() ?? 'all');
  });
  const [filter, setFilter] = useState<Filter>('all');
  const [termFirst, setTermFirst] = useState(true);
  const [seed, setSeed] = useState(0);
  const [roundKey, setRoundKey] = useState(0);
  const [index, setIndex] = useState(startIndex);
  const [flipped, setFlipped] = useState(false);
  const [tally, setTally] = useState({ got: 0, missed: 0 });
  const [done, setDone] = useState(false);
  const [listQuery, setListQuery] = useState('');
  const [offset, setOffset] = useState(0);
  const drag = useRef({ x: 0, y: 0, pointing: false });
  // Once the learner changes the deck, the start card from the URL no longer applies.
  const startConsumed = useRef(false);

  const counts = useMemo(() => {
    const result = {} as Record<DeckFilter, number>;
    for (const f of DECK_FILTERS) result[f] = material.terms.filter((card) => inDeck(card, f)).length;
    return result;
  }, [material]);

  // The deck is frozen for the round: progress changes mid-round must not reorder it.
  const deck: TermCard[] = useMemo(() => {
    const source = material.terms.filter((card) => {
      if (!inDeck(card, deckFilter)) return false;
      if (filter === 'weak') return (progress.cards[card.id]?.box ?? 0) < 3;
      if (filter === 'starred') return progress.cards[card.id]?.starred === true;
      return true;
    });
    return seed === 0 ? source : shuffle(source, mulberry32(seed));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [material, filter, deckFilter, seed, roundKey]);

  const restart = (nextFilter?: Filter) => {
    if (nextFilter) setFilter(nextFilter);
    startConsumed.current = true;
    setRoundKey((k) => k + 1);
    setIndex(0);
    setFlipped(false);
    setTally({ got: 0, missed: 0 });
    setDone(false);
  };

  const chooseDeck = (next: DeckFilter) => {
    setDeckFilter(next);
    saveDeck(next);
    restart();
  };

  useEffect(() => {
    startConsumed.current = false;
    if (startDeck && hasKinds) setDeckFilter(startDeck);
  }, [startIndex, startDeck, hasKinds]);

  useEffect(() => {
    if (seed !== 0 || startConsumed.current) return;
    const next = Math.min(Math.max(0, startIndex), Math.max(0, deck.length - 1));
    setIndex(next);
    setFlipped(false);
    setDone(false);
  }, [startIndex, deck.length, seed]);

  const card = deck[index];

  const advance = () => {
    setFlipped(false);
    if (index + 1 >= deck.length) setDone(true);
    else setIndex(index + 1);
  };

  const grade = (correct: boolean) => {
    if (!card) return;
    onAnswer(card.id, correct);
    setTally((t) => ({ got: t.got + (correct ? 1 : 0), missed: t.missed + (correct ? 0 : 1) }));
    advance();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
      if (done || !card) return;
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (e.key === 'ArrowRight') {
        advance();
      } else if (e.key === 'ArrowLeft' && index > 0) {
        setFlipped(false);
        setIndex(index - 1);
      } else if (e.key === '1' && flipped) {
        grade(false);
      } else if (e.key === '2' && flipped) {
        grade(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (material.terms.length === 0) {
    return <EmptyModeNote text="No term cards were found in this set. Add lines like “**Term**: definition” to your notes." />;
  }

  const deckPicker = hasKinds ? (
    <div className="deck-picker">
      <div className="deck-chips" role="group" aria-label="Card type">
        {DECK_FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            className={`chip deck-chip ${deckFilter === f ? 'chip-active' : ''}`}
            aria-pressed={deckFilter === f}
            onClick={() => chooseDeck(f)}
          >
            {DECK_INFO[f].label}
            <span className="deck-chip-count">{counts[f]}</span>
          </button>
        ))}
      </div>
      <p className="deck-hint">
        {DECK_INFO[deckFilter].place ? (
          <span className={`place-tag place-${DECK_INFO[deckFilter].place}`}>
            {DECK_INFO[deckFilter].place === 'gym' ? 'Gym' : 'Desk'}
          </span>
        ) : null}
        {DECK_INFO[deckFilter].hint}
      </p>
    </div>
  ) : null;

  if (deck.length === 0) {
    return (
      <div className="flashcards fade-in">
        {deckPicker}
        <div className="mode-empty">
          <p>
            {filter === 'weak'
              ? 'Nothing left to review here. Every card is mastered.'
              : filter === 'starred'
                ? 'No starred cards here yet. Star cards while you study.'
                : 'No cards of this type in the deck.'}
          </p>
          <button type="button" className="btn" onClick={() => restart('all')}>
            Study all of these
          </button>
        </div>
      </div>
    );
  }

  if (done) {
    const total = tally.got + tally.missed;
    return (
      <div className="round-summary fade-in">
        <h2>Round complete</h2>
        <p className="round-score">
          {tally.got} of {total} right{total > 0 && tally.missed === 0 ? '. Perfect.' : ''}
        </p>
        <div className="round-actions">
          <button type="button" className="btn btn-primary" onClick={() => restart()}>
            <RotateCcw size={16} aria-hidden /> Study again
          </button>
          <button type="button" className="btn" onClick={() => restart('weak')}>
            Review weak cards
          </button>
        </div>
      </div>
    );
  }

  const starred = card ? progress.cards[card.id]?.starred === true : false;
  const info = card ? kindOf(card) : undefined;
  const questionCard = card?.source === 'section';
  const promptLabel = info ? info.label : questionCard ? 'Question' : 'Term';
  const answerLabel = info || questionCard ? 'Answer' : 'Definition';
  const frontLabel = termFirst ? promptLabel : answerLabel;
  const backLabel = termFirst ? answerLabel : promptLabel;
  const frontText = card ? (termFirst ? card.term : card.definition) : '';
  const backText = card ? (termFirst ? card.definition : card.term) : '';
  const deckIds = new Set(deck.map((item) => item.id));

  return (
    <div className="flashcards fade-in">
      {deckPicker}
      <div className="mode-toolbar">
        <div className="toolbar-group" role="group" aria-label="Card filter">
          {(['all', 'weak', 'starred'] as const).map((f) => (
            <button
              key={f}
              type="button"
              className={`chip ${filter === f ? 'chip-active' : ''}`}
              onClick={() => restart(f)}
            >
              {f === 'all' ? `All (${counts[deckFilter]})` : f === 'weak' ? 'Weak' : 'Starred'}
            </button>
          ))}
        </div>
        <div className="toolbar-group">
          <button type="button" className="chip" onClick={() => { setTermFirst((v) => !v); setFlipped(false); }}>
            Front: {termFirst ? 'prompt' : 'answer'}
          </button>
          <button
            type="button"
            className="chip"
            onClick={() => {
              setSeed((Date.now() % 2147483647) || 1);
              restart();
            }}
          >
            <Shuffle size={14} aria-hidden /> Shuffle
          </button>
        </div>
      </div>

      <div className="progress-track" aria-hidden>
        <div className="progress-fill" style={{ width: `${(index / deck.length) * 100}%` }} />
      </div>
      <div className="card-counter">
        {index + 1} / {deck.length}
      </div>

      {card && (
        <button
          type="button"
          className={`flashcard ${flipped ? 'is-flipped' : ''} ${card.figure ? 'has-figure' : ''} ${offset !== 0 ? 'is-dragging' : ''}`}
          style={{ transform: offset === 0 ? undefined : `translateX(${offset}px) rotate(${offset / 18}deg)` }}
          onPointerDown={(event) => {
            if (event.button !== 0) return;
            drag.current = { x: event.clientX, y: event.clientY, pointing: true };
          }}
          onPointerMove={(event) => {
            if (!drag.current.pointing) return;
            const dx = event.clientX - drag.current.x;
            const dy = event.clientY - drag.current.y;
            if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(dy)) return;
            setOffset(dx);
          }}
          onPointerUp={(event) => {
            if (!drag.current.pointing) return;
            const dx = event.clientX - drag.current.x;
            const dy = event.clientY - drag.current.y;
            drag.current.pointing = false;
            if (Math.abs(dx) > 72 && Math.abs(dx) > Math.abs(dy)) {
              setOffset(0);
              grade(dx > 0);
              return;
            }
            setOffset(0);
            if (Math.hypot(dx, dy) < 8) setFlipped((value) => !value);
          }}
          onPointerCancel={() => {
            drag.current.pointing = false;
            setOffset(0);
          }}
        >
          {offset > 28 ? <span className="swipe-stamp swipe-yes">Got it</span> : null}
          {offset < -28 ? <span className="swipe-stamp swipe-no">Still learning</span> : null}
          <span className="flashcard-inner">
            <span className="flashcard-face flashcard-front">
              <span className="face-label">{frontLabel}</span>
              <span className={`face-text ${textSizeClass(frontText)}`}>{frontText}</span>
              <span className="face-hint">Tap to flip</span>
            </span>
            <span className="flashcard-face flashcard-back">
              <span className="face-label">{backLabel}</span>
              <span className={`face-text ${card.figure ? 'face-text-with-figure' : textSizeClass(backText)}`}>{backText}</span>
              {card.figure ? <ExamFigure id={card.figure} /> : null}
              <span className="face-section">
                {info ? `${info.heading} · ${info.place === 'gym' ? 'gym' : 'desk'}` : card.section}
              </span>
            </span>
          </span>
        </button>
      )}

      <div className="card-controls">
        <button
          type="button"
          className="icon-btn"
          disabled={index === 0}
          onClick={() => {
            setFlipped(false);
            setIndex(index - 1);
          }}
          aria-label="Previous card"
        >
          <ArrowLeft size={18} aria-hidden />
        </button>

        {flipped ? (
          <div className="grade-row">
            <button type="button" className="btn btn-danger" onClick={() => grade(false)}>
              <X size={16} aria-hidden /> Still learning
            </button>
            <button type="button" className="btn btn-success" onClick={() => grade(true)}>
              <Check size={16} aria-hidden /> Got it
            </button>
          </div>
        ) : (
          <button
            type="button"
            className={`icon-btn ${starred ? 'icon-btn-active' : ''}`}
            onClick={() => card && onToggleStar(card.id)}
            aria-label={starred ? 'Unstar card' : 'Star card'}
          >
            <Star size={18} aria-hidden fill={starred ? 'currentColor' : 'none'} />
          </button>
        )}

        <button type="button" className="icon-btn" onClick={advance} aria-label="Next card">
          <ArrowRight size={18} aria-hidden />
        </button>
      </div>

      <label className="card-search">
        <Search size={16} aria-hidden />
        <input
          className="input"
          value={listQuery}
          onChange={(event) => setListQuery(event.target.value)}
          placeholder="Find a card"
          aria-label="Find a card"
          spellCheck={false}
        />
      </label>
      <ul className="card-index card-index-study">
        {material.terms
          .filter((term) => {
            if (!deckIds.has(term.id)) return false;
            const needle = listQuery.trim().toLowerCase();
            if (!needle) return true;
            return `${term.term} ${term.definition}`.toLowerCase().includes(needle);
          })
          .map((term) => (
            <li key={term.id}>
              <button
                type="button"
                className={`card-index-item ${term.id === card?.id ? 'card-index-item-active' : ''}`}
                onClick={() => {
                  const at = deck.findIndex((item) => item.id === term.id);
                  if (at < 0) return;
                  setDone(false);
                  setFlipped(false);
                  setIndex(at);
                }}
              >
                <span className="card-index-term">{term.term}</span>
              </button>
            </li>
          ))}
      </ul>

      <p className="kbd-hint">Swipe right if you know it. Swipe left if you do not. Tap to flip.</p>
    </div>
  );
}

export function EmptyModeNote({ text }: { text: string }) {
  return (
    <div className="mode-empty">
      <p>{text}</p>
    </div>
  );
}
