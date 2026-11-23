import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { CardsHome } from '../src/components/CardsHome';
import { Library } from '../src/components/Library';
import { extractStudyMaterial } from '../src/lib/extract';
import { ensureQuizletLibrary, markExamImport } from '../src/lib/quizlet-library';
import { EXAM_2_SET_ID, EXAM_3_MARKDOWN, EXAM_3_SET_ID, EXAM_3_SET_TITLE } from '../src/lib/sample';
import { defaultData, upsertSet } from '../src/lib/store';

describe('Exam 3', () => {
  it('adds the bundled deck to an existing library and preserves either exam when customized', () => {
    const imported = { id: EXAM_2_SET_ID, title: 'My notes', markdown: markExamImport('Q: Keep?\nA: Keep this.'), createdAt: 1, updatedAt: 2 };
    const updated = ensureQuizletLibrary(upsertSet(defaultData(), imported), 100);
    expect(updated.sets.find(set => set.id === EXAM_2_SET_ID)).toEqual(imported);
    expect(updated.sets.find(set => set.id === EXAM_3_SET_ID)).toMatchObject({ title: EXAM_3_SET_TITLE, markdown: EXAM_3_MARKDOWN });
    const custom = { ...imported, id: EXAM_3_SET_ID, updatedAt: 200 };
    const reloaded = ensureQuizletLibrary(upsertSet(updated, custom), 201);
    expect(reloaded.sets.find(set => set.id === EXAM_3_SET_ID)).toEqual(custom);
  });

  it('delivers every authored flashcard with its full answer', () => {
    const fronts = [...EXAM_3_MARKDOWN.matchAll(/^Q: (.+)$/gm)].map(match => match[1]);
    const backs = [...EXAM_3_MARKDOWN.matchAll(/^A: (.+)$/gm)].map(match =>
      match[1].replace(/\[\[fig:[a-z0-9-]+\]\]/g, ' ').replace(/\s+/g, ' ').trim());
    const { terms } = extractStudyMaterial(EXAM_3_MARKDOWN);
    expect(fronts.length).toBeGreaterThan(0);
    expect(terms.map(term => term.definition)).toEqual(backs);
    expect(terms).toHaveLength(fronts.length);
    for (const [index, term] of terms.entries()) {
      expect(term.source).toBe('qa');
      expect([fronts[index], `${fronts[index]}?`]).toContain(term.term);
    }
  });

  it('lists Exam 3 on Cards and offers it as a Library shortcut and import destination', () => {
    const data = ensureQuizletLibrary(defaultData(), 100);
    const materialFor = (set: { markdown: string }) => extractStudyMaterial(set.markdown);
    const sets = data.sets.map(set => ({ set, material: materialFor(set) }));
    const cards = renderToStaticMarkup(createElement(CardsHome, { sets, onStudy: () => {} }));
    expect(cards).toContain(EXAM_3_SET_TITLE);
    const library = renderToStaticMarkup(createElement(Library, {
      data, materialFor, onImport: () => {}, onOpen: () => {}, onDelete: () => {},
      onExport: () => {}, allowOwnerSets: true, canImport: true,
    }));
    expect(library).toContain('Open Exam 3');
    expect(library).toMatch(/<input[^>]*name="import-target"[^>]*\/>Exam 3<\/label>/);
    expect(library).not.toContain('Remove Exam 3');
  });
});
