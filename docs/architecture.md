# Architecture

Quizlet is a client-side React + Vite single-page app; the deployed site is static files on GitHub Pages under `/quizlet/`. There is no app server. Optional Firebase sync (Google auth + Firestore) stays unloaded until Sync is turned on.

Flashcard extraction and study modes were transported from Research (Recall). Paper lookup UI is not part of this app; research papers live in `Harsh4873/research`.

## Presentation import

Library lazy-loads `src/lib/pptx-import.ts` for `.pptx` uploads and drops. In the browser, JSZip reads OOXML slide order, shapes, notes, tables, image relationships, and media. The converter builds topic-grouped Q/A markdown, deduplicates cards, and embeds supported figures as bounded data URLs. `extractStudyMaterial` retains those image URLs on cards; Notes and Flashcards render them. Unsupported or oversized artwork keeps its caption/alt text. No presentation text or image is generated into the static bundle.

Explicit user imports into Exam 1 carry a `quizlet-import: user` front-matter marker. `ensureQuizletLibrary` preserves those imports across reload and owner-vault sync while still restoring the bundled deck for missing or stale unmarked Exam 1 copies. Basil imports require an active owner-vault Sync session. Firestore rules and set ids are unchanged.

## Sync policy

Shared collection: `recall_users/{vaultId}/sets` (same ruleset as Research).

- Signed-out sessions and rejected Google accounts keep an empty set list. Exam 1 and Basil are written into the library only after owner-vault membership resolves, then they sync to `recall_users/{vaultId}/sets`.
- Ensure set id `exam-1-627` exists with the bundled Exam 1 markdown when the owner library is missing it; preserve an explicitly imported Exam 1 copy (marked `quizlet-import: user`).
- Ensure `owner-basil-cs-stats` (Basil CS/stats, Ioerger Sep 2026) exists from `src/lib/basil-cs-stats.md` when that owner library is missing it or the set is empty. A deleted copy stays deleted. Other `owner-*` markdown is not overwritten.
- Never tombstone `paper-*` sets (Research) or `owner-*` sets (private vault flashcards).
- Tombstone every other set whose id is not `exam-1-627`, not `paper-*`, and not `owner-*`.
