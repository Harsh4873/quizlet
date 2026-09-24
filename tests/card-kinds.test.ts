import { describe, expect, it } from 'vitest';
import { CARD_KINDS, kindOf } from '../src/lib/card-kinds';
import { extractStudyMaterial } from '../src/lib/extract';
import { EXAM_MARKDOWN } from '../src/lib/sample';

describe('card kinds', () => {
  it('maps each deck heading to its kind and place', () => {
    expect(kindOf({ section: 'Terms' })?.kind).toBe('term');
    expect(kindOf({ section: 'Rules' })?.kind).toBe('rule');
    expect(kindOf({ section: 'Theorems' })?.kind).toBe('theorem');
    expect(kindOf({ section: 'Examples' })?.place).toBe('desk');
    expect(kindOf({ section: 'Exam 1' })).toBeUndefined();
  });
});

describe('Exam 1 deck by kind', () => {
  const { terms } = extractStudyMaterial(EXAM_MARKDOWN);

  it('gives every card a kind, and every kind some cards', () => {
    expect(terms.every((card) => kindOf(card))).toBe(true);
    for (const info of CARD_KINDS) {
      expect(terms.some((card) => kindOf(card)?.kind === info.kind)).toBe(true);
    }
  });

  it('marks examples as desk work and the rest as gym', () => {
    const gym = terms.filter((card) => kindOf(card)?.place === 'gym');
    const examples = terms.filter((card) => kindOf(card)?.kind === 'example');
    expect(gym.length + examples.length).toBe(terms.length);
    expect(examples.length).toBeGreaterThan(0);
  });
});
