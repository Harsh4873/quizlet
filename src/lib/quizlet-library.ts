import type { AppData, StudySet } from '../model';
import {
  BASIL_MARKDOWN,
  OWNER_BASIL_CS_STATS_ID,
  OWNER_BASIL_CS_STATS_TITLE,
  createOwnerBasilCsStatsSet,
  isOwnerSetId,
} from './owner-set';
import { PAPER_PREFIX } from './paper-set';
import { EXAM_MARKDOWN, EXAM_SET_ID, EXAM_SET_TITLE } from './sample';
import { defaultData, deleteSet, nextDataTimestamp, upsertSet } from './store';

function isPaperSetId(setId: string): boolean {
  return setId.startsWith(PAPER_PREFIX);
}

/** Exam 1 (public bundle), Research papers, and private owner-vault decks. */
export function isKeptQuizletSetId(setId: string): boolean {
  return setId === EXAM_SET_ID || isPaperSetId(setId) || isOwnerSetId(setId);
}

/** Signed-out open: theme only. Decks arrive from the owner vault after Sync. */
export function libraryOnOpen(accountId: string | null, saved: AppData): AppData {
  if (accountId) return saved;
  return { ...defaultData(), theme: saved.theme };
}

/** A Google account outside the owner vault sees no cards. */
export function libraryAfterRejectedAccount(data: AppData): AppData {
  return { ...defaultData(), theme: data.theme };
}

export function clearSetTombstone(data: AppData, setId: string): AppData {
  if (data.tombstones[setId] === undefined) return data;
  const { [setId]: _removed, ...tombstones } = data.tombstones;
  return { ...data, tombstones };
}

/**
 * Fill a missing or empty Basil set with the bundled cards.
 * A deleted set stays deleted. A set that already has cards is left alone.
 */
function ensureBasilDeck(data: AppData, now: number): AppData {
  const existing = data.sets.find((set) => set.id === OWNER_BASIL_CS_STATS_ID);
  if (!existing) {
    if (data.tombstones[OWNER_BASIL_CS_STATS_ID]) return data;
    const stamp = nextDataTimestamp(data, now);
    return clearSetTombstone(upsertSet(data, createOwnerBasilCsStatsSet(stamp)), OWNER_BASIL_CS_STATS_ID);
  }
  if (existing.markdown.trim()) return data;
  return upsertSet(data, {
    ...existing,
    title: existing.title.trim() || OWNER_BASIL_CS_STATS_TITLE,
    markdown: BASIL_MARKDOWN,
    updatedAt: nextDataTimestamp(data, now),
  });
}

/**
 * Quizlet ships Exam 1 and Basil CS/stats. Leave `paper-*` (Research) and
 * other `owner-*` sets alone, including their markdown. Tombstone every other
 * flashcard set so old decks disappear on sync.
 */
export function ensureQuizletLibrary(data: AppData, now = Date.now()): AppData {
  let next = data;

  for (const set of data.sets) {
    if (isKeptQuizletSetId(set.id)) continue;
    next = deleteSet(next, set.id, nextDataTimestamp(next, now));
  }

  for (const set of next.sets) {
    if (isOwnerSetId(set.id)) next = clearSetTombstone(next, set.id);
  }

  const existing = next.sets.find((set) => set.id === EXAM_SET_ID);
  if (existing && (existing.markdown !== EXAM_MARKDOWN || existing.title !== EXAM_SET_TITLE)) {
    next = upsertSet(next, {
      ...existing,
      title: EXAM_SET_TITLE,
      markdown: EXAM_MARKDOWN,
      updatedAt: nextDataTimestamp(next, now),
    });
    return ensureBasilDeck(next, now);
  }
  if (!existing) {
    const stamp = nextDataTimestamp(next, now);
    const created: StudySet = {
      id: EXAM_SET_ID,
      title: EXAM_SET_TITLE,
      markdown: EXAM_MARKDOWN,
      createdAt: stamp,
      updatedAt: stamp,
    };
    return ensureBasilDeck(clearSetTombstone(upsertSet(next, created), EXAM_SET_ID), now);
  }

  if (!existing.markdown.trim()) {
    next = upsertSet(next, {
      ...existing,
      title: existing.title.trim() || EXAM_SET_TITLE,
      markdown: EXAM_MARKDOWN,
      updatedAt: nextDataTimestamp(next, now),
    });
  }

  return ensureBasilDeck(next, now);
}
