import { describe, expect, it } from 'vitest';
import { extractStudyMaterial } from '../src/lib/extract';
import { EXAM_MARKDOWN } from '../src/lib/sample';

const questions = EXAM_MARKDOWN.match(/^Q: .+$/gm) ?? [];
const answers = EXAM_MARKDOWN.match(/^A: .+$/gm) ?? [];

describe('Exam 1 deck source', () => {
  it('turns every Q line into exactly one card', () => {
    // A duplicate question merges silently, and the 140-card cap drops the rest silently.
    const { terms } = extractStudyMaterial(EXAM_MARKDOWN);
    expect(questions.length).toBe(answers.length);
    expect(terms).toHaveLength(questions.length);
    expect(terms.every((term) => term.source === 'qa')).toBe(true);
  });

  it('keeps every answer short enough to show without clipping', () => {
    for (const line of answers) {
      expect(line.length - 'A: '.length, line.slice(0, 60)).toBeLessThanOrEqual(420);
    }
  });

  it('writes Kleene star as the unicode star', () => {
    // An ASCII * in markdown is eaten as italics.
    expect(EXAM_MARKDOWN.includes('*')).toBe(false);
  });
});
