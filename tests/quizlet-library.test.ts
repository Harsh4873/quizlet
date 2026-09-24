import { describe, expect, it } from 'vitest';
import { extractStudyMaterial } from '../src/lib/extract';
import {
  BASIL_MARKDOWN,
  OWNER_BASIL_CS_STATS_ID,
  OWNER_BASIL_CS_STATS_TITLE,
  OWNER_SET_PREFIX,
  createOwnerBasilCsStatsSet,
  isOwnerSetId,
} from '../src/lib/owner-set';
import { ensureQuizletLibrary, isKeptQuizletSetId } from '../src/lib/quizlet-library';
import { EXAM_MARKDOWN, EXAM_SET_ID, EXAM_SET_TITLE } from '../src/lib/sample';
import { defaultData, upsertSet } from '../src/lib/store';

describe('quizlet set allowlist', () => {
  it('keeps Exam 1, paper-* Research sets, and owner-* private vault sets', () => {
    expect(isKeptQuizletSetId(EXAM_SET_ID)).toBe(true);
    expect(isKeptQuizletSetId('paper-abc')).toBe(true);
    expect(isKeptQuizletSetId(OWNER_BASIL_CS_STATS_ID)).toBe(true);
    expect(isOwnerSetId(OWNER_BASIL_CS_STATS_ID)).toBe(true);
    expect(OWNER_BASIL_CS_STATS_ID.startsWith(OWNER_SET_PREFIX)).toBe(true);
    expect(OWNER_BASIL_CS_STATS_TITLE).toBe('Basil CS/stats — Ioerger Sep 2026');
    expect(isKeptQuizletSetId('old-deck')).toBe(false);
    expect(isOwnerSetId(EXAM_SET_ID)).toBe(false);
  });

  it('creates the bundled Basil deck', () => {
    const set = createOwnerBasilCsStatsSet(42);
    expect(set.id).toBe(OWNER_BASIL_CS_STATS_ID);
    expect(set.title).toBe(OWNER_BASIL_CS_STATS_TITLE);
    expect(set.markdown).toBe(BASIL_MARKDOWN);
    expect(set.createdAt).toBe(42);
    const { terms } = extractStudyMaterial(BASIL_MARKDOWN);
    const questions = BASIL_MARKDOWN.match(/^Q: .+$/gm) ?? [];
    expect(questions.length).toBe(41);
    expect(terms).toHaveLength(questions.length);
    expect(terms.every((term) => term.source === 'qa')).toBe(true);
    expect(BASIL_MARKDOWN).not.toMatch(/Harsh/i);
  });
});

describe('ensureQuizletLibrary', () => {
  it('does not recreate a deleted owner set from constants', () => {
    const data = {
      ...defaultData(),
      tombstones: { [OWNER_BASIL_CS_STATS_ID]: 50 },
    };
    const next = ensureQuizletLibrary(data, 60);
    expect(next.sets.some((set) => set.id === OWNER_BASIL_CS_STATS_ID)).toBe(false);
    expect(next.tombstones[OWNER_BASIL_CS_STATS_ID]).toBe(50);
  });

  it('creates exam-1-627 and the bundled Basil deck', () => {
    const next = ensureQuizletLibrary(defaultData(), 1000);
    const exam = next.sets.find((set) => set.id === EXAM_SET_ID);
    const basil = next.sets.find((set) => set.id === OWNER_BASIL_CS_STATS_ID);
    expect(exam?.title).toBe(EXAM_SET_TITLE);
    expect(exam?.markdown).toBe(EXAM_MARKDOWN);
    expect(basil?.title).toBe(OWNER_BASIL_CS_STATS_TITLE);
    expect(basil?.markdown).toBe(BASIL_MARKDOWN);
    expect(next.sets.map((set) => set.id).sort()).toEqual([EXAM_SET_ID, OWNER_BASIL_CS_STATS_ID]);
  });

  it('tombstones stray flashcard decks and keeps paper and owner sets', () => {
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
      id: OWNER_BASIL_CS_STATS_ID,
      title: OWNER_BASIL_CS_STATS_TITLE,
      markdown: '# Private\n\nQ: Keep this?\nA: Yes, vault only.\n',
      createdAt: 3,
      updatedAt: 3,
    });
    data = upsertSet(data, {
      id: EXAM_SET_ID,
      title: EXAM_SET_TITLE,
      markdown: EXAM_MARKDOWN,
      createdAt: 4,
      updatedAt: 4,
    });

    const next = ensureQuizletLibrary(data, 5000);
    expect(next.sets.map((set) => set.id).sort()).toEqual([
      EXAM_SET_ID,
      OWNER_BASIL_CS_STATS_ID,
      'paper-abc',
    ]);
    expect(next.tombstones['old-deck']).toBeGreaterThan(0);
    expect(next.tombstones['paper-abc']).toBeUndefined();
    expect(next.tombstones[OWNER_BASIL_CS_STATS_ID]).toBeUndefined();
    const owner = next.sets.find((set) => set.id === OWNER_BASIL_CS_STATS_ID);
    expect(owner?.title).toBe(OWNER_BASIL_CS_STATS_TITLE);
    expect(owner?.markdown).toContain('Q: Keep this?');
  });

  it('fills an empty Basil set with the bundled cards and leaves a filled set alone', () => {
    const empty = upsertSet(defaultData(), {
      id: OWNER_BASIL_CS_STATS_ID,
      title: 'Custom title',
      markdown: '',
      createdAt: 2,
      updatedAt: 2,
    });
    const filledEmpty = ensureQuizletLibrary(empty, 9000);
    const owner = filledEmpty.sets.find((set) => set.id === OWNER_BASIL_CS_STATS_ID);
    expect(owner?.title).toBe('Custom title');
    expect(owner?.markdown).toBe(BASIL_MARKDOWN);
    expect(owner?.updatedAt).toBeGreaterThan(2);

    const custom = upsertSet(defaultData(), {
      id: OWNER_BASIL_CS_STATS_ID,
      title: 'Custom title',
      markdown: 'Q: Keep this?\nA: Yes, vault only.\n',
      createdAt: 2,
      updatedAt: 2,
    });
    const kept = ensureQuizletLibrary(custom, 9000);
    const customOwner = kept.sets.find((set) => set.id === OWNER_BASIL_CS_STATS_ID);
    expect(customOwner?.markdown).toContain('Q: Keep this?');
    expect(customOwner?.updatedAt).toBe(2);
  });

  it('clears a leftover tombstone for a live owner set so sync cannot wipe it', () => {
    let data = upsertSet(defaultData(), {
      id: OWNER_BASIL_CS_STATS_ID,
      title: OWNER_BASIL_CS_STATS_TITLE,
      markdown: 'Q: Live?\nA: Yes.\n',
      createdAt: 2,
      updatedAt: 2,
    });
    data = { ...data, tombstones: { [OWNER_BASIL_CS_STATS_ID]: 99 } };
    const next = ensureQuizletLibrary(data, 12_000);
    expect(next.sets.some((set) => set.id === OWNER_BASIL_CS_STATS_ID)).toBe(true);
    expect(next.tombstones[OWNER_BASIL_CS_STATS_ID]).toBeUndefined();
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
