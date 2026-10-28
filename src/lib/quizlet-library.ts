import type { AppData, StudySet } from '../model';
import {
  BASIL_MARKDOWN,
  OWNER_BASIL_CS_STATS_ID,
  OWNER_BASIL_CS_STATS_TITLE,
  createOwnerBasilCsStatsSet,
  isOwnerSetId,
} from './owner-set';
import { PAPER_PREFIX } from './paper-set';
import { EXAM_DECKS, isExamSetId } from './sample';
import { defaultData, deleteSet, nextDataTimestamp, upsertSet } from './store';

const IMPORT_MARKER = 'quizlet-import: user';

/** An explicit user import survives the bundled exam fallback on reload and sync. */
export function markExamImport(markdown: string): string {
  if (hasExamImportMarker(markdown)) return markdown;
  const frontMatter = markdown.match(/^---\r?\n([\s\S]*?)\r?\n(?:---|\.\.\.)(?:\r?\n|$)/);
  if (frontMatter) {
    return markdown.replace(frontMatter[0], `---\n${IMPORT_MARKER}\n${frontMatter[1]}\n---\n`);
  }
  return `---\n${IMPORT_MARKER}\n---\n\n${markdown}`;
}

export function hasExamImportMarker(markdown: string): boolean {
  const frontMatter = markdown.match(/^---\r?\n([\s\S]*?)\r?\n(?:---|\.\.\.)(?:\r?\n|$)/);
  return Boolean(frontMatter && /^quizlet-import:\s*user\s*$/m.test(frontMatter[1]));
}

function isPaperSetId(setId: string): boolean {
  return setId.startsWith(PAPER_PREFIX);
}

/** Exam decks (public bundles), Research papers, and private owner-vault decks. */
export function isKeptQuizletSetId(setId: string): boolean {
  return isExamSetId(setId) || isPaperSetId(setId) || isOwnerSetId(setId);
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

/**
 * Sync is off. Keep the account cache current while the in-memory library
 * still has sets. Skip the write after a rejected account has emptied it, so
 * that blank library cannot replace the cache. With no account id, only the
 * theme belongs in the signed-out cache.
 */
export function offlineLibraryWrite(accountId: string | null, data: AppData): 'account' | 'theme-only' | 'skip' {
  if (!accountId) return 'theme-only';
  if (data.sets.length > 0) return 'account';
  return 'skip';
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
 * Quizlet ships Exam 1, Exam 2 and Basil CS/stats. Leave `paper-*` (Research) and
 * other `owner-*` sets alone, including their markdown. An explicitly imported
 * exam deck is an exception to the bundled fallback. Tombstone every
 * other flashcard set so old decks disappear on sync.
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

  for (const deck of EXAM_DECKS) {
    const existing = next.sets.find((set) => set.id === deck.id);
    if (!existing) {
      const stamp = nextDataTimestamp(next, now);
      const created: StudySet = { ...deck, createdAt: stamp, updatedAt: stamp };
      next = clearSetTombstone(upsertSet(next, created), deck.id);
    } else {
      if (!hasExamImportMarker(existing.markdown)
        && (existing.markdown !== deck.markdown || existing.title !== deck.title)) {
        next = upsertSet(next, {
          ...existing,
          title: deck.title,
          markdown: deck.markdown,
          updatedAt: nextDataTimestamp(next, now),
        });
      }
      next = clearSetTombstone(next, deck.id);
    }
  }

  return ensureBasilDeck(next, now);
}
