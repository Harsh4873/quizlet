# Quizlet

Quizlet is the owner's exam flashcard app, published at `https://harsh.bet/quizlet/` from `Harsh4873/quizlet`. It is the flashcard half split out of Research (Recall). Paper reading stays in `Harsh4873/research`.

## What it does

- Ships exactly one study set: **Exam 1** (`exam-1-627`), bundled from the course Q/A notes.
- Study modes: **Notes**, **Flashcards**, **Quiz**, **Blanks**, and **Match**.
- Import/export replaces or downloads that one set (JSON or markdown).
- Optional Sync uses the shared private owner vault (`recall_users/{vaultId}/sets`). On sync it ensures Exam 1 exists and tombstones old non-paper flashcard decks while leaving `paper-*` sets alone for Research.

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
