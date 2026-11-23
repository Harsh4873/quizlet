# Architecture

Quizlet is a client-side React + Vite single-page app; the deployed site is static files on GitHub Pages under `/quizlet/`. There is no app server. Optional Firebase sync (Google auth + Firestore) stays unloaded until Sync is turned on.

Flashcard extraction and study modes were transported from Research (Recall). Paper lookup UI is not part of this app; research papers live in `Harsh4873/research`.

## Presentation import

Library lazy-loads `src/lib/pptx-import.ts` for `.pptx` uploads and drops. In the browser, JSZip reads OOXML slide order, shapes, notes, tables, image relationships, and media. The converter skips agendas and decorative art, threads divider topics into later slides, splits compound bullets, mines notes, pairs table headers with cells, and matches figures to nearby captions. It emits deduplicated Q/A markdown plus marked `Cloze: {{answer}} ...` lines for clear definitions. `extractStudyMaterial` turns those lines into Blanks and Quiz cards, and retains bounded figure data URLs on Q/A cards; Notes and Flashcards render images. Unsupported or oversized artwork keeps its caption/alt text. No presentation text or image is generated into the static bundle.

Explicit user imports into any exam deck carry a `quizlet-import: user` front-matter marker. `ensureQuizletLibrary` preserves those imports across reload and owner-vault sync while still restoring the bundled deck for missing or stale unmarked copies. Basil imports require an active owner-vault Sync session.

## Sync policy

Shared collection: `recall_users/{vaultId}/sets` (same ruleset as Research).

- Signed-out sessions and rejected Google accounts keep an empty set list. The exam decks and Basil are written into the library only after owner-vault membership resolves, then they sync to `recall_users/{vaultId}/sets`.
- The registry in `src/lib/sample.ts` supplies `exam-1-627`, `exam-2-627`, and `exam-3-627`. Each missing exam deck gets its bundled markdown. User imports marked `quizlet-import: user` persist.
- Ensure `owner-basil-cs-stats` (Basil CS/stats, Ioerger Sep 2026) exists from `src/lib/basil-cs-stats.md` when that owner library is missing it or the set is empty. A deleted copy stays deleted. Other `owner-*` markdown is not overwritten.
- Never tombstone `paper-*` sets (Research) or `owner-*` sets (private vault flashcards).
- Tombstone sets outside the exam registry and the `paper-*` and `owner-*` prefixes.
