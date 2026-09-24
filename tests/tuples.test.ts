import { describe, expect, it } from 'vitest';
import { inDeck } from '../src/lib/card-kinds';
import { extractStudyMaterial } from '../src/lib/extract';
import { EXAM_MARKDOWN } from '../src/lib/sample';
import { TUPLE_ENTRIES, TUPLE_PAIRS, tupleLabel, tupleRank } from '../src/lib/tuples';

describe('5-tuples deck', () => {
  const { terms } = extractStudyMaterial(EXAM_MARKDOWN);
  const byPrompt = new Map(terms.map((term) => [term.term, term]));

  it('names only cards that exist, each once', () => {
    for (const entry of TUPLE_ENTRIES) expect(byPrompt.has(entry.question), entry.question).toBe(true);
    expect(new Set(TUPLE_ENTRIES.map((entry) => entry.question)).size).toBe(TUPLE_ENTRIES.length);
    expect(terms.filter((term) => inDeck(term, 'tuples'))).toHaveLength(TUPLE_ENTRIES.length);
  });

  it('shows every tuple card with a part-by-part tuple sheet', () => {
    for (const [, tuple] of TUPLE_PAIRS) {
      expect(byPrompt.get(tuple)?.figure, tuple).toMatch(/^tuple-/);
    }
  });

  it('puts each construction right before its tuple', () => {
    for (const [what, tuple] of TUPLE_PAIRS) {
      expect(tupleRank(tuple)).toBe((tupleRank(what) ?? -2) + 1);
      expect(tupleLabel(what)).toBe('What it is');
      expect(tupleLabel(tuple)).toBe('Its tuple');
    }
  });
});
