import type { StudySet } from '../model';
import basilMarkdown from './basil-cs-stats.md?raw';

/**
 * Owner-vault flashcard sets. The prefix is the allowlist key.
 * Basil CS/stats ships with the app so it opens without a file upload.
 */
export const OWNER_SET_PREFIX = 'owner-';

export const OWNER_BASIL_CS_STATS_ID = 'owner-basil-cs-stats';
export const OWNER_BASIL_CS_STATS_TITLE = 'Basil CS/stats — Ioerger Sep 2026';
export const BASIL_MARKDOWN = basilMarkdown;

export function isOwnerSetId(setId: string): boolean {
  return setId.startsWith(OWNER_SET_PREFIX);
}

/** Basil CS/stats study set. Defaults to the bundled cards. */
export function createOwnerBasilCsStatsSet(now: number, markdown = BASIL_MARKDOWN): StudySet {
  return {
    id: OWNER_BASIL_CS_STATS_ID,
    title: OWNER_BASIL_CS_STATS_TITLE,
    markdown,
    createdAt: now,
    updatedAt: now,
  };
}
