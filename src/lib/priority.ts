/**
 * The short list to study when time is short: definitions, things to know, and
 * examples. Each entry is the exact `Q:` text of a card in `exam-1.md`;
 * `tests/priority.test.ts` fails if a card is renamed out from under this list.
 */
export interface PriorityGroup {
  /** Card-face label while studying the Priority deck. */
  label: string;
  questions: readonly string[];
}

export const PRIORITY_GROUPS: readonly PriorityGroup[] = [
  {
    label: 'Definition',
    questions: [
      'Name the five parts of a DFA.',
      'How is the NFA 5-tuple different from the DFA 5-tuple?',
      'What are the six parts of the pushdown automaton she will ask about?',
      'Read the PDA label 1, A → B. What does each part mean, and what is X?',
      'What is a regular language?',
      'What is an NFA?',
      'What are the regular operations on languages?',
      'What does closed under an operation mean?',
      'What is a perfect shuffle of two languages?',
      'What are the three different empty things?',
    ],
  },
  {
    label: 'Know this',
    questions: [
      'What is the shape of Exam 1?',
      'How do you classify a language on this exam?',
      'State the three regular pumping rules.',
      'What are the steps of a regular pumping proof?',
      'How do you prove the regular pumping lemma at class level?',
      'What are the two directions of the pumping lemma?',
      'How do you build an NFA for the union of two NFAs?',
      'How do you build an NFA for the concatenation of two NFAs?',
      'How do you build an NFA for the star of an NFA?',
      'How do you prove a string is accepted, using the definition of computation?',
      'What is the trick for writing any 5-tuple?',
      'In the perfect shuffle machine, what does the extra third part of each state remember?',
    ],
  },
  {
    label: 'Example',
    questions: [
      'Write the 5-tuple of the DFA that simulates an NFA (Q, Σ, δ, q0, F).',
      'Classify {0^n 1^n} and prove both halves.',
      'PDA for {0^n 1^n}, the class machine.',
      'DFA for strings that start and end with the same symbol.',
      'Write the 5-tuple for the perfect shuffle DFA.',
      'If a DROP-style question shows up, what earns the points?',
      'Show {a^(2^n) : n ≥ 0} is not regular.',
      "Show the one-a language is not regular: a's, then b's, then c's, where exactly one a forces equal b's and c's.",
      'Prove A − B is regular when A and B are, using DFAs only.',
      'For regular L and a fixed symbol a, show L/a = {w : wa ∈ L} is regular. What about L/B?',
      'If L sits inside a regular language, must L be regular?',
    ],
  },
];

const RANK = new Map<string, number>(PRIORITY_GROUPS.flatMap((group) => group.questions).map((q, index) => [q, index]));

/** Position in the priority order, or undefined for a card outside the list. */
export function priorityRank(term: string): number | undefined {
  return RANK.get(term);
}

export function priorityGroup(term: string): PriorityGroup | undefined {
  return PRIORITY_GROUPS.find((group) => group.questions.includes(term));
}
