import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { CardsHome } from '../src/components/CardsHome';
import { Library } from '../src/components/Library';
import { kindOf } from '../src/lib/card-kinds';
import { extractStudyMaterial } from '../src/lib/extract';
import { ensureQuizletLibrary, markExamImport } from '../src/lib/quizlet-library';
import { EXAM_2_MARKDOWN, EXAM_2_SET_ID, EXAM_2_SET_TITLE, EXAM_SET_ID } from '../src/lib/sample';
import { defaultData, upsertSet } from '../src/lib/store';

const questions = EXAM_2_MARKDOWN.match(/^Q: .+$/gm) ?? [];
const answers = EXAM_2_MARKDOWN.match(/^A: .+$/gm) ?? [];

describe('Exam 2 publishing', () => {
  it('delivers every card untruncated, without hidden duplicates or extra definition cards', () => {
    const material = extractStudyMaterial(EXAM_2_MARKDOWN);
    expect(questions).toHaveLength(47);
    expect(questions.length).toBeLessThan(50);
    expect(answers).toHaveLength(questions.length);
    expect(material.terms).toHaveLength(questions.length);
    material.terms.forEach((term, index) => {
      expect(term.source).toBe('qa');
      expect([questions[index].slice(3), `${questions[index].slice(3)}?`]).toContain(term.term);
      const plain = answers[index].slice(3).replace(/\[\[fig:[a-z0-9-]+\]\]/g, ' ').replace(/\s+/g, ' ').trim();
      expect(term.definition).toBe(plain);
      expect(answers[index].slice(3).length).toBeLessThanOrEqual(420);
      expect(kindOf(term)).toBeDefined();
      expect(kindOf(term)?.kind).not.toBe('term');
    });
    expect(EXAM_2_MARKDOWN).not.toContain('*');
  });

  it('adds Exam 2 to an existing account without replacing an imported Exam 1', () => {
    const imported = { id: EXAM_SET_ID, title: 'My existing notes', markdown: markExamImport('Q: Keep?\nA: Yes.'), createdAt: 1, updatedAt: 2 };
    const data = upsertSet(defaultData(), imported);
    const next = ensureQuizletLibrary(data, 100);
    expect(next.sets.find(s => s.id === EXAM_SET_ID)).toEqual(imported);
    expect(next.sets.find(s => s.id === EXAM_2_SET_ID)).toMatchObject({ title: EXAM_2_SET_TITLE, markdown: EXAM_2_MARKDOWN });
    expect(ensureQuizletLibrary(next, 101)).toBe(next);
  });

  it('refreshes an old bundled Exam 2 and revives its tombstone without losing progress', () => {
    const old = upsertSet(defaultData(), { id: EXAM_2_SET_ID, title: 'Old Exam 2', markdown: 'Q: Old?\nA: Old.', createdAt: 2, updatedAt: 3 });
    const data = { ...old, tombstones: { [EXAM_2_SET_ID]: 90 }, progress: { ...old.progress, [EXAM_2_SET_ID]: { cards: {} } } };
    const next = ensureQuizletLibrary(data, 100);
    expect(next.sets.find(s => s.id === EXAM_2_SET_ID)).toMatchObject({ createdAt: 2, title: EXAM_2_SET_TITLE, markdown: EXAM_2_MARKDOWN });
    expect(next.tombstones[EXAM_2_SET_ID]).toBeUndefined();
    expect(next.progress[EXAM_2_SET_ID]).toEqual(data.progress[EXAM_2_SET_ID]);
  });

  it('preserves a deliberately imported Exam 2 on reload', () => {
    const custom = { id: EXAM_2_SET_ID, title: 'My Exam 2', markdown: markExamImport('Q: Custom?\nA: Keep this.'), createdAt: 2, updatedAt: 3 };
    const next = ensureQuizletLibrary(upsertSet(defaultData(), custom), 100);
    expect(next.sets.find(s => s.id === EXAM_2_SET_ID)).toEqual(custom);
  });

  it('shows Exam 2 in the CSCE 627 Cards list and the library actions', () => {
    const data = ensureQuizletLibrary(defaultData(), 100);
    const materialFor = (set: { markdown: string }) => extractStudyMaterial(set.markdown);
    const cards = renderToStaticMarkup(createElement(CardsHome, { sets: data.sets.map(set => ({ set, material: materialFor(set) })), onStudy: () => {} }));
    expect(cards).toContain('Exam 2');
    expect(cards).toContain('47 cards');
    const library = renderToStaticMarkup(createElement(Library, { data, materialFor, onImport: () => {}, onLoadSample: () => {}, onDelete: () => {}, onExport: () => {}, onOpen: () => {}, allowOwnerSets: true, canImport: true }));
    expect(library).toContain('Open Exam 2');
    expect(library).toContain('Import into');
  });
});
