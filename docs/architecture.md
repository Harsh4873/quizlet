# Architecture

Quizlet is a client-side React + Vite single-page app; the deployed site is static files on GitHub Pages under `/quizlet/`. There is no app server. Optional Firebase sync (Google auth + Firestore) stays unloaded until Sync is turned on.

Flashcard extraction and study modes were transported from Research (Recall). Paper lookup UI is not part of this app; research papers live in `Harsh4873/research`.

## Sync policy

Shared collection: `recall_users/{vaultId}/sets` (same ruleset as Research).

- Ensure set id `exam-1-627` exists with the bundled Exam 1 markdown when missing.
- Ensure `owner-basil-cs-stats` (`Basil CS/stats, Ioerger Sep 2026`) exists from `src/lib/basil-cs-stats.md` when missing or empty. A deleted copy stays deleted. Other `owner-*` markdown is not overwritten.
- Never tombstone `paper-*` sets (Research) or `owner-*` sets.
- Tombstone every other set whose id is not `exam-1-627`, not `paper-*`, and not `owner-*`.
