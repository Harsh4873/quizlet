# Architecture

Quizlet is a client-side React + Vite single-page app; the deployed site is static files on GitHub Pages under `/quizlet/`. There is no app server. Optional Firebase sync (Google auth + Firestore) stays unloaded until Sync is turned on.

Flashcard extraction and study modes were transported from Research (Recall). Paper lookup UI is not part of this app; research papers live in `Harsh4873/research`.

## Sync policy

Shared collection: `recall_users/{vaultId}/sets` (same ruleset as Research).

- Ensure set id `exam-1-627` exists with the bundled Exam 1 markdown when missing.
- Tombstone every other set whose id does not start with `paper-` and is not `exam-1-627`.
- Never tombstone `paper-*` sets.
