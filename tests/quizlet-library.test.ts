import { describe, expect, it } from 'vitest';
import { ensureQuizletLibrary } from '../src/lib/quizlet-library';
import { EXAM_MARKDOWN, EXAM_SET_ID, EXAM_SET_TITLE } from '../src/lib/sample';
import { defaultData, upsertSet } from '../src/lib/store';
import { extractStudyMaterial } from '../src/lib/extract';

describe('ensureQuizletLibrary', () => {
  it('creates exam-1-627 with the bundled markdown', () => {
    const next = ensureQuizletLibrary(defaultData(), 1000);
    const exam = next.sets.find((set) => set.id === EXAM_SET_ID);
    expect(exam?.title).toBe(EXAM_SET_TITLE);
    expect(exam?.markdown).toBe(EXAM_MARKDOWN);
  });

  it('tombstones non-paper flashcard decks and keeps paper sets', () => {
    let data = defaultData();
    data = upsertSet(data, {
      id: 'old-deck',
      title: 'Old',
      markdown: '# Old\n\nQ: a?\nA: b\n',
      createdAt: 1,
      updatedAt: 1,
    });
    data = upsertSet(data, {
      id: 'paper-abc',
      title: 'Paper',
      markdown: '# Paper\n',
      createdAt: 2,
      updatedAt: 2,
    });
    data = upsertSet(data, {
      id: EXAM_SET_ID,
      title: EXAM_SET_TITLE,
      markdown: EXAM_MARKDOWN,
      createdAt: 3,
      updatedAt: 3,
    });

    const next = ensureQuizletLibrary(data, 5000);
    expect(next.sets.map((set) => set.id).sort()).toEqual(['exam-1-627', 'paper-abc']);
    expect(next.tombstones['old-deck']).toBeGreaterThan(0);
    expect(next.tombstones['paper-abc']).toBeUndefined();
  });

  it('replaces a stale Exam 1 deck with the bundled markdown', () => {
    const data = upsertSet(defaultData(), {
      id: EXAM_SET_ID,
      title: 'Exam 1',
      markdown: 'Q: Old?\nA: Text only.\n',
      createdAt: 3,
      updatedAt: 3,
    });
    const next = ensureQuizletLibrary(data, 8000);
    const exam = next.sets.find((set) => set.id === EXAM_SET_ID);
    expect(exam?.markdown).toBe(EXAM_MARKDOWN);
    expect(exam?.updatedAt).toBeGreaterThan(3);
  });
});

describe('Exam 1 deck', () => {
  it('extracts Q/A terms under the MAX_TERMS cap', () => {
    const { terms } = extractStudyMaterial(EXAM_MARKDOWN);
    expect(terms.length).toBeGreaterThan(20);
    expect(terms.length).toBeLessThanOrEqual(140);
    expect(terms.every((term) => term.source === 'qa' || term.term.length > 0)).toBe(true);
    expect(terms.some((term) => term.source === 'qa')).toBe(true);
  });
});
