import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { extractStudyMaterial } from '../src/lib/extract';
import {
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

  it('creates an empty owner-basil-cs-stats shell with the stable id and title', () => {
    const set = createOwnerBasilCsStatsSet(42);
    expect(set.id).toBe(OWNER_BASIL_CS_STATS_ID);
    expect(set.title).toBe(OWNER_BASIL_CS_STATS_TITLE);
    expect(set.markdown).toBe('');
    expect(set.createdAt).toBe(42);
  });

  it('does not ship private basil card bodies in source', () => {
    const src = readFileSync(new URL('../src/lib/owner-set.ts', import.meta.url), 'utf8');
    expect(src).not.toMatch(/^Q:/m);
    expect(src).not.toMatch(/^A:/m);
    expect(src).toContain(OWNER_BASIL_CS_STATS_ID);
    expect(src).toContain(OWNER_BASIL_CS_STATS_TITLE);
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

  it('creates exam-1-627 with the bundled markdown and no private owner set', () => {
    const next = ensureQuizletLibrary(defaultData(), 1000);
    const exam = next.sets.find((set) => set.id === EXAM_SET_ID);
    expect(exam?.title).toBe(EXAM_SET_TITLE);
    expect(exam?.markdown).toBe(EXAM_MARKDOWN);
    expect(next.sets.map((set) => set.id)).toEqual([EXAM_SET_ID]);
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

  it('does not overwrite owner-* markdown from a bundle', () => {
    const data = upsertSet(defaultData(), {
      id: OWNER_BASIL_CS_STATS_ID,
      title: 'Custom title',
      markdown: '',
      createdAt: 2,
      updatedAt: 2,
    });
    const next = ensureQuizletLibrary(data, 9000);
    const owner = next.sets.find((set) => set.id === OWNER_BASIL_CS_STATS_ID);
    expect(owner?.title).toBe('Custom title');
    expect(owner?.markdown).toBe('');
    expect(owner?.updatedAt).toBe(2);
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
