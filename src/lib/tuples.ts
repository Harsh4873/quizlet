/**
 * The 5-tuples deck: each construction twice, what it is and then its tuple part
 * by part. Entries are exact `Q:` text from `exam-1.md`; `tests/tuples.test.ts`
 * fails if a card is renamed out from under this list.
 */
export interface TupleEntry {
  question: string;
  /** Card-face label while studying this deck. */
  label: string;
}

const START = 'What is the trick for writing any 5-tuple?';

export const TUPLE_PAIRS: readonly [string, string][] = [
  ['Name the five parts of a DFA.', 'Write the 5-tuple of the even-number-of-1s DFA, part by part.'],
  [
    'What does the NFA-to-DFA theorem say, and how is the DFA built?',
    'Write the 5-tuple of the DFA that simulates an NFA (Q, Σ, δ, q0, F).',
  ],
  ['What is a product machine?', 'Write the 5-tuple of the product DFA for union, intersection, and A − B.'],
  ['How do you build an NFA for the union of two NFAs?', 'Write the 5-tuple of the union NFA.'],
  ['How do you build an NFA for the concatenation of two NFAs?', 'Write the 5-tuple of the concatenation NFA.'],
  ['How do you build an NFA for the star of an NFA?', 'Write the 5-tuple of the star NFA.'],
  ['What is a perfect shuffle of two languages?', 'Write the 5-tuple for the perfect shuffle DFA.'],
  ['If a DROP-style question shows up, what earns the points?', 'Write the 5-tuple of the DROP NFA.'],
  ['What are the six parts of the pushdown automaton she will ask about?', 'Write the 6-tuple of the {0^n 1^n} PDA, part by part.'],
];

export const TUPLE_ENTRIES: readonly TupleEntry[] = [
  { question: START, label: 'Start here' },
  ...TUPLE_PAIRS.flatMap(([what, tuple]) => [
    { question: what, label: 'What it is' },
    { question: tuple, label: 'Its tuple' },
  ]),
];

const RANK = new Map(TUPLE_ENTRIES.map((entry, index) => [entry.question, index]));

export function tupleRank(term: string): number | undefined {
  return RANK.get(term);
}

export function tupleLabel(term: string): string | undefined {
  return TUPLE_ENTRIES.find((entry) => entry.question === term)?.label;
}
