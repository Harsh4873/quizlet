import examMarkdown from './exam-1.md?raw';
import exam2Markdown from './exam-2.md?raw';

/** Fixed study-set id for the Exam 1 deck in Firestore and local storage. */
export const EXAM_SET_ID = 'exam-1-627';
export const EXAM_SET_TITLE = 'Exam 1';
export const EXAM_MARKDOWN = examMarkdown;

/** Aliases kept for existing extract/quiz tests. */
export const SAMPLE_TITLE = EXAM_SET_TITLE;
export const SAMPLE_MARKDOWN = EXAM_MARKDOWN;

export const EXAM_2_SET_ID = 'exam-2-627';
export const EXAM_2_SET_TITLE = 'Exam 2';
export const EXAM_2_MARKDOWN = exam2Markdown;

export const EXAM_DECKS = [
  { id: EXAM_SET_ID, title: EXAM_SET_TITLE, markdown: EXAM_MARKDOWN },
  { id: EXAM_2_SET_ID, title: EXAM_2_SET_TITLE, markdown: EXAM_2_MARKDOWN },
] as const;

export function isExamSetId(id: string): boolean {
  return EXAM_DECKS.some((deck) => deck.id === id);
}
