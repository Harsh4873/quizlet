import type { StudySet } from '../model';

/**
 * Private owner-vault flashcard sets. The prefix is the allowlist key.
 * Card bodies never ship in this repo; only ids and titles live here.
 */
export const OWNER_SET_PREFIX = 'owner-';

export const OWNER_BASIL_CS_STATS_ID = 'owner-basil-cs-stats';
export const OWNER_BASIL_CS_STATS_TITLE = 'Basil CS/stats — Ioerger Sep 2026';

export function isOwnerSetId(setId: string): boolean {
  return setId.startsWith(OWNER_SET_PREFIX);
}

/** Empty private set ready for paste/import. No bundled markdown. */
export function createOwnerBasilCsStatsSet(now: number, markdown = ''): StudySet {
  return {
    id: OWNER_BASIL_CS_STATS_ID,
    title: OWNER_BASIL_CS_STATS_TITLE,
    markdown,
    createdAt: now,
    updatedAt: now,
  };
}
