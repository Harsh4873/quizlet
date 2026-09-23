import { describe, expect, it } from 'vitest';
import { CARD_KINDS, DECK_FILTERS, inDeck, kindOf, parseDeckFilter } from '../src/lib/card-kinds';
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

  it('puts terms, rules, and theorems in the gym mix and keeps examples out', () => {
    for (const info of CARD_KINDS) {
      expect(inDeck({ section: info.heading }, 'gym')).toBe(info.place === 'gym');
      expect(inDeck({ section: info.heading }, info.kind)).toBe(true);
      expect(inDeck({ section: info.heading }, 'all')).toBe(true);
    }
    expect(inDeck({ section: 'Examples' }, 'gym')).toBe(false);
    expect(inDeck({ section: 'Exam 1' }, 'gym')).toBe(false);
    expect(inDeck({ section: 'Exam 1' }, 'all')).toBe(true);
  });

  it('only accepts known deck names from the URL', () => {
    for (const filter of DECK_FILTERS) expect(parseDeckFilter(filter)).toBe(filter);
    expect(parseDeckFilter('papers')).toBeUndefined();
    expect(parseDeckFilter(undefined)).toBeUndefined();
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

  it('makes the gym mix exactly the non-example cards', () => {
    const gym = terms.filter((card) => inDeck(card, 'gym'));
    const examples = terms.filter((card) => inDeck(card, 'example'));
    expect(gym.length + examples.length).toBe(terms.length);
    expect(examples.length).toBeGreaterThan(0);
  });
});
