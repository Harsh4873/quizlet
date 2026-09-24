import { describe, expect, it } from 'vitest';
import { inDeck } from '../src/lib/card-kinds';
import { extractStudyMaterial } from '../src/lib/extract';
import { PRIORITY_GROUPS, priorityGroup, priorityRank } from '../src/lib/priority';
import { EXAM_MARKDOWN } from '../src/lib/sample';

const all = PRIORITY_GROUPS.flatMap((group) => group.questions);

describe('priority deck', () => {
  it('is ten definitions, ten things to know, and ten examples, with no repeats', () => {
    expect(PRIORITY_GROUPS.map((group) => group.questions.length)).toEqual([10, 10, 10]);
    expect(new Set(all).size).toBe(30);
  });

  it('names only cards that exist in the Exam 1 deck', () => {
    const { terms } = extractStudyMaterial(EXAM_MARKDOWN);
    const prompts = new Set(terms.map((term) => term.term));
    for (const question of all) expect(prompts.has(question), question).toBe(true);
    expect(terms.filter((term) => inDeck(term, 'priority'))).toHaveLength(30);
  });

  it('keeps the list order and labels each card by its group', () => {
    expect(priorityRank(all[0])).toBe(0);
    expect(priorityRank(all[29])).toBe(29);
    expect(priorityRank('What is an alphabet?')).toBeUndefined();
    expect(priorityGroup(all[0])?.label).toBe('Definition');
    expect(priorityGroup(all[29])?.label).toBe('Example');
  });
});
