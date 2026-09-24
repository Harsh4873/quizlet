import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/**
 * Rendered output is never used to verify this app, so guard the phone rules
 * that the flashcard page depends on at the CSS level, like the header test does.
 */
const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8').replace(
  /\/\*[\s\S]*?\*\//g,
  '',
);

function mediaBlock(query: string): string {
  const at = css.indexOf(`@media ${query}`);
  expect(at, `missing @media ${query}`).toBeGreaterThan(-1);
  const open = css.indexOf('{', at);
  let depth = 0;
  for (let i = open; i < css.length; i += 1) {
    if (css[i] === '{') depth += 1;
    else if (css[i] === '}') {
      depth -= 1;
      if (depth === 0) return css.slice(open + 1, i);
    }
  }
  throw new Error(`unterminated @media ${query}`);
}

function declarations(selector: string, source: string): string {
  return [...source.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .filter((match) =>
      match[1]
        .split(',')
        .map((part) => part.trim())
        .includes(selector),
    )
    .map((match) => match[2])
    .join(';');
}

const phone = mediaBlock('(max-width: 560px)');

describe('flashcards on a phone', () => {
  it('keeps focused search fields at 16px so iOS does not zoom the page', () => {
    const rule = declarations('.input', phone);
    const size = Number(rule.match(/font-size:\s*(\d+(?:\.\d+)?)px/)?.[1]);
    expect(size).toBeGreaterThanOrEqual(16);
  });

  it('sizes the card from the visible screen height', () => {
    expect(declarations('.flashcard', phone)).toMatch(/height:\s*min\(\d+dvh/);
  });

  it('gives the grade buttons a full thumb-sized target', () => {
    const rule = declarations('.grade-row .btn', phone);
    const height = Number(rule.match(/min-height:\s*(\d+)px/)?.[1]);
    expect(height).toBeGreaterThanOrEqual(44);
    expect(rule).toMatch(/flex:\s*1/);
  });

  it('lets the two-row header scroll away', () => {
    expect(declarations('.app-header', phone)).toMatch(/position:\s*relative/);
  });

  it('pads the header below the status bar when installed to the home screen', () => {
    expect(declarations('.app-header', css.replace(phone, ''))).toMatch(/padding-top:\s*env\(safe-area-inset-top/);
  });
});
