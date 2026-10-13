import { describe, expect, it } from 'vitest';
import { parseInlines, parseMarkdown, plainText } from '../src/lib/markdown';
import type { HeadingBlock, ListBlock, ParaBlock, TableBlock } from '../src/model';

describe('parseInlines', () => {
  it('parses bold, italic, code, and links', () => {
    const runs = parseInlines('A **bold** and *slanted* `code` [site](https://example.com) end');
    expect(runs).toEqual([
      { kind: 'text', text: 'A ' },
      { kind: 'bold', text: 'bold' },
      { kind: 'text', text: ' and ' },
      { kind: 'italic', text: 'slanted' },
      { kind: 'text', text: ' ' },
      { kind: 'code', text: 'code' },
      { kind: 'text', text: ' ' },
      { kind: 'link', text: 'site', href: 'https://example.com' },
      { kind: 'text', text: ' end' },
    ]);
  });

  it('supports __bold__ and does not italicize snake_case', () => {
    const runs = parseInlines('__strong__ snake_case_word stays');
    expect(runs[0]).toEqual({ kind: 'bold', text: 'strong' });
    expect(plainText(runs)).toBe('strong snake_case_word stays');
  });

  it('keeps the readable label when a link is bold', () => {
    expect(parseInlines('**[PAML branch model](PAML.md)**')).toEqual([{ kind: 'bold', text: 'PAML branch model' }]);
  });

  it('drops images but keeps alt text', () => {
    expect(plainText(parseInlines('see ![diagram of a cell](img.png) here'))).toBe('see diagram of a cell here');
  });

  it('allows http, https, and mailto links and keeps other targets as text', () => {
    expect(parseInlines('[ok](https://example.com/a)')).toEqual([
      { kind: 'link', text: 'ok', href: 'https://example.com/a' },
    ]);
    expect(parseInlines('[web](http://example.com)')).toEqual([
      { kind: 'link', text: 'web', href: 'http://example.com' },
    ]);
    expect(parseInlines('[mail](mailto:study@example.com)')).toEqual([
      { kind: 'link', text: 'mail', href: 'mailto:study@example.com' },
    ]);
    expect(parseInlines('[x](javascript:1)')).toEqual([{ kind: 'text', text: 'x' }]);
    expect(parseInlines('[x](JAVASCRIPT:1)')).toEqual([{ kind: 'text', text: 'x' }]);
    expect(parseInlines('[x](data:text/html,hi)')).toEqual([{ kind: 'text', text: 'x' }]);
  });

  it('keeps raster data images and drops other image targets', () => {
    expect(parseInlines('![fig](data:image/png;base64,aaaa)')).toEqual([
      { kind: 'image', text: 'fig', href: 'data:image/png;base64,aaaa' },
    ]);
    expect(parseInlines('![fig](https://cdn.example.com/fig.png)')).toEqual([
      { kind: 'image', text: 'fig', href: 'https://cdn.example.com/fig.png' },
    ]);
    expect(parseInlines('![fig](javascript:1)')).toEqual([{ kind: 'text', text: 'fig' }]);
    expect(parseInlines('![fig](data:image/svg+xml;base64,PHN2Zw)')).toEqual([{ kind: 'text', text: 'fig' }]);
  });

  it('honors backslash escapes', () => {
    expect(plainText(parseInlines('not \\*italic\\* here'))).toBe('not *italic* here');
  });
});

describe('parseMarkdown', () => {
  it('parses headings with stable slugs and finds the title', () => {
    const doc = parseMarkdown('# Cell Biology\n\n## Organelles\n\n## Organelles\n');
    const headings = doc.blocks.filter((b): b is HeadingBlock => b.type === 'heading');
    expect(doc.title).toBe('Cell Biology');
    expect(headings.map((h) => h.id)).toEqual(['cell-biology', 'organelles', 'organelles-1']);
  });

  it('reads a front matter title and skips the front matter block', () => {
    const doc = parseMarkdown('---\ntitle: "My Notes"\ndate: 2026-01-01\n---\n\nBody text.\n');
    expect(doc.title).toBe('My Notes');
    expect((doc.blocks[0] as ParaBlock).text).toBe('Body text.');
  });

  it('parses nested lists', () => {
    const doc = parseMarkdown('- parent one\n  - child a\n  - child b\n- parent two\n');
    const list = doc.blocks[0] as ListBlock;
    expect(list.items).toHaveLength(2);
    expect(list.items[0].children?.items.map((i) => i.text)).toEqual(['child a', 'child b']);
  });

  it('merges lazy continuation lines into one list item', () => {
    const doc = parseMarkdown('- **Mitosis**: cell division that\n  produces identical cells\n');
    const list = doc.blocks[0] as ListBlock;
    expect(list.items[0].text).toBe('Mitosis: cell division that produces identical cells');
  });

  it('parses tables into header and rows', () => {
    const doc = parseMarkdown('| Term | Meaning |\n| --- | --- |\n| ATP | Energy currency |\n| DNA | Genetic code |\n');
    const table = doc.blocks[0] as TableBlock;
    expect(table.header).toEqual(['Term', 'Meaning']);
    expect(table.rows).toEqual([
      ['ATP', 'Energy currency'],
      ['DNA', 'Genetic code'],
    ]);
  });

  it('parses fenced code without interpreting its contents', () => {
    const doc = parseMarkdown('```python\n# not a heading\nx = 1\n```\n');
    expect(doc.blocks[0]).toEqual({ type: 'code', lang: 'python', code: '# not a heading\nx = 1' });
  });

  it('parses blockquotes recursively and horizontal rules', () => {
    const doc = parseMarkdown('> quoted **wisdom**\n\n---\n\nafter\n');
    expect(doc.blocks[0].type).toBe('quote');
    expect(doc.blocks[1].type).toBe('rule');
    expect((doc.blocks[2] as ParaBlock).text).toBe('after');
  });

  it('keeps separate paragraphs separate and merges wrapped lines', () => {
    const doc = parseMarkdown('First line\nstill first.\n\nSecond.\n');
    const paras = doc.blocks.filter((b): b is ParaBlock => b.type === 'para');
    expect(paras.map((p) => p.text)).toEqual(['First line still first.', 'Second.']);
  });

  it('strips task-list markers', () => {
    const doc = parseMarkdown('- [ ] read chapter\n- [x] make cards\n');
    const list = doc.blocks[0] as ListBlock;
    expect(list.items.map((i) => i.text)).toEqual(['read chapter', 'make cards']);
  });
});
