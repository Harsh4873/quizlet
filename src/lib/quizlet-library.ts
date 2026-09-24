import type { AppData, StudySet } from '../model';
import { isOwnerSetId } from './owner-set';
import { PAPER_PREFIX } from './paper-set';
import { EXAM_MARKDOWN, EXAM_SET_ID, EXAM_SET_TITLE } from './sample';
import { deleteSet, nextDataTimestamp, upsertSet } from './store';

function isPaperSetId(setId: string): boolean {
  return setId.startsWith(PAPER_PREFIX);
}

/** Exam 1 (public bundle), Research papers, and private owner-vault decks. */
export function isKeptQuizletSetId(setId: string): boolean {
  return setId === EXAM_SET_ID || isPaperSetId(setId) || isOwnerSetId(setId);
}

export function clearSetTombstone(data: AppData, setId: string): AppData {
  if (data.tombstones[setId] === undefined) return data;
  const { [setId]: _removed, ...tombstones } = data.tombstones;
  return { ...data, tombstones };
}

/**
 * Quizlet ships the public Exam 1 deck. Leave `paper-*` (Research) and
 * `owner-*` (private vault) sets alone, including their remote/local
 * markdown. Tombstone every other flashcard set so old decks disappear
 * on sync. Never create or overwrite an `owner-*` set from a bundle.
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
    return next;
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
    return clearSetTombstone(upsertSet(next, created), EXAM_SET_ID);
  }

  if (!existing.markdown.trim()) {
    next = upsertSet(next, {
      ...existing,
      title: existing.title.trim() || EXAM_SET_TITLE,
      markdown: EXAM_MARKDOWN,
      updatedAt: nextDataTimestamp(next, now),
    });
  }

  return next;
}
