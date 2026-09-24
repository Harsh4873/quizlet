import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ExamFigure, FIGURE_IDS } from '../src/components/Machine';
import { EXAM_MARKDOWN } from '../src/lib/sample';

const used = [...new Set([...EXAM_MARKDOWN.matchAll(/\[\[fig:([a-z0-9-]+)\]\]/g)].map((match) => match[1]))];

describe('card figures', () => {
  it('only names figures that exist, since a missing one renders nothing', () => {
    for (const id of used) expect(FIGURE_IDS, id).toContain(id);
  });

  it('renders every figure to an SVG with a text description', () => {
    for (const id of FIGURE_IDS) {
      const markup = renderToStaticMarkup(createElement(ExamFigure, { id }));
      expect(markup, id).toContain('<svg');
      expect(markup, id).toMatch(/aria-label="[^"]{20,}"/);
    }
  });
});
