import type { TermCard } from '../model';

/** The four `##` sections of the Exam 1 deck. Labels only: study is the whole deck. */
export type CardKind = 'term' | 'rule' | 'theorem' | 'example';

/** Gym cards are said out loud and flipped; desk cards need paper. */
export type StudyPlace = 'gym' | 'desk';

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

export function kindOf(card: Pick<TermCard, 'section'>): KindInfo | undefined {
  const key = card.section.trim().toLowerCase();
  return CARD_KINDS.find((info) => info.heading.toLowerCase() === key || info.label.toLowerCase() === key);
}
