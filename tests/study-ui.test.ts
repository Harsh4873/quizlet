import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { emptyDeckKeepsPlace, Flashcards } from '../src/components/Flashcards';
import { Library } from '../src/components/Library';
import { MatchView } from '../src/components/MatchView';
import { extractStudyMaterial } from '../src/lib/extract';
import { OWNER_BASIL_CS_STATS_ID, OWNER_BASIL_CS_STATS_TITLE } from '../src/lib/owner-set';
import { EXAM_MARKDOWN, EXAM_SET_ID, EXAM_SET_TITLE } from '../src/lib/sample';
import { defaultData, upsertSet } from '../src/lib/store';
import type { StudyMaterial, StudySet } from '../src/model';

function studySet(id: string, title: string, markdown: string): StudySet {
  return { id, title, markdown, createdAt: 1, updatedAt: 1 };
}

const emptyMaterial: StudyMaterial = {
  doc: { blocks: [] },
  terms: [],
  clozes: [],
  outline: [],
  stats: { words: 0, readingMinutes: 0, sections: 0, terms: 0, clozes: 0 },
};

describe('home remove button', () => {
  it('hides Remove on Exam 1 and keeps it on other sets', () => {
    const data = upsertSet(
      upsertSet(defaultData(), studySet(EXAM_SET_ID, EXAM_SET_TITLE, 'Q: One?\nA: Yes.\n')),
      studySet(OWNER_BASIL_CS_STATS_ID, OWNER_BASIL_CS_STATS_TITLE, '## Basil\n\nA private note.\n'),
    );
    const html = renderToStaticMarkup(createElement(Library, {
      data,
      materialFor: () => emptyMaterial,
      onImport: () => {},
      onLoadSample: () => {},
      onDelete: () => {},
      onExport: () => {},
      onOpen: () => {},
    }));
    expect(html).toContain(`Export ${EXAM_SET_TITLE}`);
    expect(html).not.toContain(`Remove ${EXAM_SET_TITLE}`);
    expect(html).toContain(`Remove ${OWNER_BASIL_CS_STATS_TITLE}`);
  });
});

describe('match tiles', () => {
  it('shows a long definition in full', () => {
    const definition = `distinct answer ${'x'.repeat(160)}`;
    const material: StudyMaterial = {
      ...emptyMaterial,
      terms: [1, 2, 3].map((n) => ({
        id: `t${n}`,
        term: `Term ${n}`,
        definition: n === 1 ? definition : `Definition ${n} is long enough to pair`,
        section: 'Terms',
        source: 'bold' as const,
      })),
      stats: { ...emptyMaterial.stats, terms: 3 },
    };
    const html = renderToStaticMarkup(createElement(MatchView, {
      material,
      progress: { cards: {} },
      onAnswer: () => {},
      onBestTime: () => {},
    }));
    expect(html).toContain(definition);
  });
});

describe('flashcard places', () => {
  it('offers gym and example filters and names the place on the card', () => {
    const material = extractStudyMaterial(EXAM_MARKDOWN);
    const html = renderToStaticMarkup(createElement(Flashcards, {
      material,
      progress: { cards: {} },
      onAnswer: () => {},
      onToggleStar: () => {},
    }));
    expect(html).toContain('All places');
    expect(html).toContain('aria-pressed="true">All places');
    expect(html).toContain('Gym (');
    expect(html).toContain('Examples (');
    expect(html).toContain('· gym');
  });

  it('keeps the place when a weak or starred slice of that place is empty', () => {
    expect(emptyDeckKeepsPlace('weak', true)).toBe(true);
    expect(emptyDeckKeepsPlace('starred', true)).toBe(true);
    expect(emptyDeckKeepsPlace('weak', false)).toBe(false);
    expect(emptyDeckKeepsPlace('all', false)).toBe(false);
  });
});
