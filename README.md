# Quizlet

Quizlet is the owner's exam flashcard app, published at `https://harsh.bet/quizlet/` from `Harsh4873/quizlet`. It is the flashcard half split out of Research (Recall). Paper reading stays in `Harsh4873/research`.

## What it does

- Ships the public **Exam 1** set (`exam-1-627`), bundled from the course Q/A notes.
- Signed-in owner-vault members can keep private `owner-*` decks (for example `owner-basil-cs-stats`). Only the id and title live in the app; card bodies stay in the shared Firestore vault and are never bundled.
- Study modes: **Notes**, **Flashcards**, **Quiz**, **Blanks**, and **Match**.
- One cumulative Exam 1 deck. Cards still sit under `## Terms`, `## Rules`, `## Theorems`, and `## Examples`, and each card is labeled, but study is the whole deck.
- Import/export can replace Exam 1 or, when Sync is on, upsert the private Basil set (JSON or markdown).
- Optional Sync uses the shared private owner vault (`recall_users/{vaultId}/sets`). On sync it ensures Exam 1 exists, leaves `paper-*` and `owner-*` sets alone, and tombstones other stray flashcard decks. Unapproved Google accounts cannot sync.

## Privacy boundary

By default generation and storage run in the browser. Turning on **Sync** signs in with a verified, provisioned Google account and resolves it to the shared owner vault. There are no analytics.

## Local development

```bash
npm install
npm test
npm run typecheck
npm run test:rules   # Firestore rules against the emulator (needs Java + firebase-tools)
npm run build
npm run dev
```

## Deployment

1. Push to `main`; GitHub Actions tests, builds, and publishes `/quizlet/` to GitHub Pages. There is no app backend to deploy.
2. When `firestore.rules` changes, deploy it once to the shared Firebase project from an app that owns the shared ruleset. Keep the file byte-identical across sibling private apps.
