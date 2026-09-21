import type { AppData, StudySet } from '../model';
import { EXAM_MARKDOWN, EXAM_SET_ID, EXAM_SET_TITLE } from './sample';
import { deleteSet, nextDataTimestamp, upsertSet } from './store';
import { PAPER_PREFIX } from './paper-set';

function isPaperSetId(setId: string): boolean {
  return setId.startsWith(PAPER_PREFIX);
}

/**
 * Quizlet owns one flashcard deck. Keep `exam-1-627`, leave `paper-*` sets alone
 * (shared vault / Research), and tombstone every other flashcard set so old decks
 * disappear on sync.
 */
export function ensureQuizletLibrary(data: AppData, now = Date.now()): AppData {
  let next = data;

  for (const set of data.sets) {
    if (set.id === EXAM_SET_ID || isPaperSetId(set.id)) continue;
    next = deleteSet(next, set.id, nextDataTimestamp(next, now));
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
    next = upsertSet(next, created);
    if (next.tombstones[EXAM_SET_ID]) {
      const { [EXAM_SET_ID]: _removed, ...tombstones } = next.tombstones;
      next = { ...next, tombstones };
    }
    return next;
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
