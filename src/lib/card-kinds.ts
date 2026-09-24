import type { TermCard } from '../model';
import { priorityRank } from './priority';

/** The four `##` sections of the Exam 1 deck. */
export type CardKind = 'term' | 'rule' | 'theorem' | 'example';

/** Gym cards are said out loud and flipped; desk cards need paper. */
export type StudyPlace = 'gym' | 'desk';

export type DeckFilter = 'priority' | 'all' | 'gym' | CardKind;

export interface KindInfo {
  kind: CardKind;
  /** Card-face label. */
  label: string;
  /** The `##` heading in the deck markdown. */
  heading: string;
  place: StudyPlace;
}

export const CARD_KINDS: readonly KindInfo[] = [
  { kind: 'term', label: 'Term', heading: 'Terms', place: 'gym' },
  { kind: 'rule', label: 'Rule', heading: 'Rules', place: 'gym' },
  { kind: 'theorem', label: 'Theorem', heading: 'Theorems', place: 'gym' },
  { kind: 'example', label: 'Example', heading: 'Examples', place: 'desk' },
];

interface DeckInfo {
  label: string;
  /** One line under the chips while studying. */
  hint: string;
  /** Shorter line on the Cards home rows. */
  short: string;
  place?: StudyPlace;
}

export const DECK_INFO: Record<DeckFilter, DeckInfo> = {
  priority: {
    label: 'Priority',
    hint: 'Short on time? Start here: definitions, then things to know, then examples.',
    short: 'Short on time? Start here: definitions, things to know, examples.',
  },
  gym: {
    label: 'Gym',
    hint: 'Terms, rules, and theorems. Say the answer out loud, then flip.',
    short: 'Terms, rules, and theorems. No paper needed.',
    place: 'gym',
  },
  term: {
    label: 'Terms',
    hint: 'Definitions. Say it out loud, then flip.',
    short: 'Definitions and vocabulary.',
    place: 'gym',
  },
  rule: {
    label: 'Rules',
    hint: 'How the machines and proofs behave. Say the rule, then flip.',
    short: 'How machines and proofs behave.',
    place: 'gym',
  },
  theorem: {
    label: 'Theorems',
    hint: 'Say the statement and the one-line reason, then flip.',
    short: 'Statements plus the one-line reason.',
    place: 'gym',
  },
  example: {
    label: 'Examples',
    hint: 'Machines, pumping proofs, and 5-tuples. Work it on paper, then flip.',
    short: 'Machines, pumping, 5-tuples. Use paper.',
    place: 'desk',
  },
  all: {
    label: 'Everything',
    hint: 'Every card. Terms, rules, and theorems work at the gym. Examples need paper.',
    short: 'Every card in the deck.',
  },
};

/** Chip order: the short list first, then the gym mix, the whole deck last. */
export const DECK_FILTERS: readonly DeckFilter[] = ['priority', 'gym', 'term', 'rule', 'theorem', 'example', 'all'];

export function kindOf(card: Pick<TermCard, 'section'>): KindInfo | undefined {
  const key = card.section.trim().toLowerCase();
  return CARD_KINDS.find((info) => info.heading.toLowerCase() === key || info.label.toLowerCase() === key);
}

export function inDeck(card: Pick<TermCard, 'section'> & { term?: string }, filter: DeckFilter): boolean {
  if (filter === 'all') return true;
  if (filter === 'priority') return card.term !== undefined && priorityRank(card.term) !== undefined;
  const info = kindOf(card);
  if (!info) return false;
  return filter === 'gym' ? info.place === 'gym' : info.kind === filter;
}

export function parseDeckFilter(value: unknown): DeckFilter | undefined {
  return typeof value === 'string' && (DECK_FILTERS as readonly string[]).includes(value)
    ? (value as DeckFilter)
    : undefined;
}

const SAVED_DECK_KEY = 'quizlet.deck';

export function loadSavedDeck(): DeckFilter | undefined {
  try {
    return parseDeckFilter(localStorage.getItem(SAVED_DECK_KEY));
  } catch {
    return undefined;
  }
}

export function saveDeck(filter: DeckFilter): void {
  try {
    localStorage.setItem(SAVED_DECK_KEY, filter);
  } catch {
    /* storage blocked */
  }
}
