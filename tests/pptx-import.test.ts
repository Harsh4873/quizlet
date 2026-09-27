import JSZip from 'jszip';
import { DOMParser } from '@xmldom/xmldom';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { extractStudyMaterial } from '../src/lib/extract';
import { pptxToMarkdown } from '../src/lib/pptx-import';
import { buildQuiz } from '../src/lib/questions';

const P = 'http://schemas.openxmlformats.org/presentationml/2006/main';
const A = 'http://schemas.openxmlformats.org/drawingml/2006/main';
const R = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
const O = 'http://schemas.openxmlformats.org/package/2006/relationships';
const PNG = Uint8Array.from(atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/lZkAAAAASUVORK5CYII='), (char) => char.charCodeAt(0));

function escaped(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function shape(value: string, type = '', y = 0, level = 0): string {
  const ph = type ? `<p:nvPr><p:ph type="${type}"/></p:nvPr>` : '<p:nvPr/>';
  return `<p:sp><p:nvSpPr>${ph}</p:nvSpPr><p:spPr><a:xfrm><a:off x="0" y="${y}"/></a:xfrm></p:spPr><p:txBody><a:bodyPr/><a:p><a:pPr lvl="${level}"/><a:r><a:t>${value}</a:t></a:r></a:p></p:txBody></p:sp>`;
}

function nestedShape(parent: string, child: string): string {
  return `<p:sp><p:txBody><a:p><a:pPr lvl="0"/><a:r><a:t>${parent}</a:t></a:r></a:p><a:p><a:pPr lvl="1"/><a:r><a:t>${child}</a:t></a:r></a:p></p:txBody></p:sp>`;
}

function describedShape(description: string): string {
  return `<p:sp><p:nvSpPr><p:cNvPr name="Shape 2" descr="${description}"/></p:nvSpPr><p:spPr/></p:sp>`;
}

function picture(): string {
  return `<p:pic><p:nvPicPr><p:cNvPr name="Picture 1" descr="Mitochondrial membrane"/></p:nvPicPr><p:spPr><a:xfrm><a:off x="0" y="2000000"/></a:xfrm></p:spPr><p:blipFill><a:blip r:embed="rIdImage"/></p:blipFill></p:pic>`;
}

function table(): string {
  return `<p:graphicFrame><a:graphic><a:graphicData><a:tbl>
    <a:tr><a:tc><a:txBody><a:p><a:r><a:t>Term</a:t></a:r></a:p></a:txBody></a:tc><a:tc><a:txBody><a:p><a:r><a:t>Meaning</a:t></a:r></a:p></a:txBody></a:tc></a:tr>
    <a:tr><a:tc><a:txBody><a:p><a:r><a:t>Matrix</a:t></a:r></a:p></a:txBody></a:tc><a:tc><a:txBody><a:p><a:r><a:t>Inner compartment of the mitochondrion</a:t></a:r></a:p></a:txBody></a:tc></a:tr>
  </a:tbl></a:graphicData></a:graphic></p:graphicFrame>`;
}

function slide(body: string): string {
  return `<p:sld xmlns:p="${P}" xmlns:a="${A}" xmlns:r="${R}"><p:cSld><p:spTree>${body}</p:spTree></p:cSld></p:sld>`;
}

function placedShape(value: string, x: number, y: number, width = 2_000_000): string {
  return `<p:sp><p:spPr><a:xfrm><a:off x="${x}" y="${y}"/><a:ext cx="${width}" cy="300000"/></a:xfrm></p:spPr><p:txBody><a:p><a:r><a:t>${escaped(value)}</a:t></a:r></a:p></p:txBody></p:sp>`;
}

function placedPicture(alt: string, relId: string, x: number, y: number, width = 2_000_000, height = 1_000_000): string {
  return `<p:pic><p:nvPicPr><p:cNvPr name="Picture 1" descr="${escaped(alt)}"/></p:nvPicPr><p:spPr><a:xfrm><a:off x="${x}" y="${y}"/><a:ext cx="${width}" cy="${height}"/></a:xfrm></p:spPr><p:blipFill><a:blip r:embed="${relId}"/></p:blipFill></p:pic>`;
}

function tableRows(rows: string[][]): string {
  const cells = rows.map((row) => `<a:tr>${row.map((cell) => `<a:tc><a:txBody><a:p><a:r><a:t>${escaped(cell)}</a:t></a:r></a:p></a:txBody></a:tc>`).join('')}</a:tr>`).join('');
  return `<p:graphicFrame><a:graphic><a:graphicData><a:tbl>${cells}</a:tbl></a:graphicData></a:graphic></p:graphicFrame>`;
}

interface FixtureSlide {
  body: string;
  notes?: string;
  images?: string[];
}

async function deck(slides: FixtureSlide[]): Promise<ArrayBuffer> {
  const zip = new JSZip();
  const ids = slides.map((_, i) => `<p:sldId id="${i + 1}" r:id="rId${i + 1}"/>`).join('');
  const links = slides.map((_, i) => `<Relationship Id="rId${i + 1}" Type="${R}/slide" Target="slides/slide${i + 1}.xml"/>`).join('');
  zip.file('ppt/presentation.xml', `<p:presentation xmlns:p="${P}" xmlns:r="${R}"><p:sldIdLst>${ids}</p:sldIdLst></p:presentation>`);
  zip.file('ppt/_rels/presentation.xml.rels', `<Relationships xmlns="${O}">${links}</Relationships>`);
  zip.file('[Content_Types].xml', '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="png" ContentType="image/png"/></Types>');
  for (const [index, item] of slides.entries()) {
    const number = index + 1;
    zip.file(`ppt/slides/slide${number}.xml`, slide(item.body));
    const rels: string[] = [];
    if (item.notes) {
      zip.file(`ppt/notesSlides/notesSlide${number}.xml`, `<p:notes xmlns:p="${P}" xmlns:a="${A}"><p:cSld><p:spTree>${item.notes}</p:spTree></p:cSld></p:notes>`);
      rels.push(`<Relationship Id="rIdNotes" Type="${R}/notesSlide" Target="../notesSlides/notesSlide${number}.xml"/>`);
    }
    for (const [imageIndex, relId] of (item.images ?? []).entries()) {
      const name = `image${number}-${imageIndex + 1}.png`;
      zip.file(`ppt/media/${name}`, PNG);
      rels.push(`<Relationship Id="${relId}" Type="${R}/image" Target="../media/${name}"/>`);
    }
    if (rels.length) zip.file(`ppt/slides/_rels/slide${number}.xml.rels`, `<Relationships xmlns="${O}">${rels.join('')}</Relationships>`);
  }
  return zip.generateAsync({ type: 'arraybuffer' });
}

function questions(markdown: string): string[] {
  return extractStudyMaterial(markdown).terms.map((card) => card.term);
}

async function fixture(): Promise<ArrayBuffer> {
  const zip = new JSZip();
  zip.file('ppt/presentation.xml', `<p:presentation xmlns:p="${P}" xmlns:r="${R}"><p:sldIdLst><p:sldId id="1" r:id="rId1"/><p:sldId id="2" r:id="rId2"/><p:sldId id="3" r:id="rId3"/><p:sldId id="4" r:id="rId4"/></p:sldIdLst></p:presentation>`);
  // Deliberately map the second presentation slide to slide3.xml: relationship order wins.
  zip.file('ppt/_rels/presentation.xml.rels', `<Relationships xmlns="${O}"><Relationship Id="rId1" Type="${R}/slide" Target="slides/slide1.xml"/><Relationship Id="rId2" Type="${R}/slide" Target="slides/slide3.xml"/><Relationship Id="rId3" Type="${R}/slide" Target="slides/slide2.xml"/><Relationship Id="rId4" Type="${R}/slide" Target="slides/slide4.xml"/></Relationships>`);
  zip.file('ppt/slides/slide1.xml', slide(shape('Cell Biology', 'title')));
  zip.file('ppt/slides/slide3.xml', slide(shape('Agenda', 'title') + shape('1. Energy systems') + shape('2. Mitochondria')));
  zip.file('ppt/slides/slide2.xml', slide(
    shape('Energy Systems', 'title')
    + shape('ATP: the energy currency of a cell')
    + shape('NADH carries electrons to the respiratory chain')
    + shape('Citric acid cycle produces NADH. Electron transport chain uses NADH to drive proton pumping.')
    + table()
    + picture()
    + shape('Figure 1: Electron transport chain diagram', '', 2400000),
  ));
  zip.file('ppt/slides/slide4.xml', slide(shape('ATP and Gradients', 'title')
    + shape('ATP: energy currency of the cell')
    + nestedShape('Proton gradient', 'Stored membrane energy drives ATP synthase')
    + shape('Q: What powers ATP synthase?')
    + shape('A: A proton gradient across the membrane.')
    + describedShape('ATP synthase converts proton flow into chemical energy')));
  zip.file('ppt/slides/_rels/slide2.xml.rels', `<Relationships xmlns="${O}"><Relationship Id="rIdImage" Type="${R}/image" Target="../media/image1.bin"/><Relationship Id="rIdNotes" Type="${R}/notesSlide" Target="../notesSlides/notesSlide1.xml"/></Relationships>`);
  zip.file('ppt/notesSlides/notesSlide1.xml', `<p:notes xmlns:p="${P}" xmlns:a="${A}"><p:cSld><p:spTree>${shape('Electron transport chain converts electron energy into a proton gradient', 'body')}${shape('3', 'sldNum')}</p:spTree></p:cSld></p:notes>`);
  zip.file('[Content_Types].xml', '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Override PartName="/ppt/media/image1.bin" ContentType="image/png"/></Types>');
  zip.file('ppt/media/image1.bin', Uint8Array.from(atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/lZkAAAAASUVORK5CYII='), (char) => char.charCodeAt(0)));
  return zip.generateAsync({ type: 'arraybuffer' });
}

beforeAll(() => vi.stubGlobal('DOMParser', DOMParser));
afterAll(() => vi.unstubAllGlobals());

describe('PPTX import', () => {
  it('follows presentation order, splits concepts, reads notes and tables, and attaches a figure', async () => {
    const updates: number[] = [];
    const converted = await pptxToMarkdown(await fixture(), {
      fallbackTitle: 'fallback.pptx',
      onProgress: ({ slide }) => updates.push(slide),
    });
    expect(converted.title).toBe('Cell Biology');
    expect(converted.stats.slides).toBe(4);
    expect(converted.stats.skippedSlides).toBe(2);
    expect(converted.stats.tables).toBe(1);
    expect(converted.stats.notes).toBe(1);
    expect(converted.stats.figures).toBe(1);
    expect(updates).toEqual([1, 2, 3, 4]);
    expect(converted.markdown).toContain('## Cell Biology — Energy Systems');
    expect(converted.markdown).not.toContain('## Agenda');
    expect(converted.markdown).toContain('data:image/png;base64,');
    expect(converted.markdown).toContain('Electron transport chain converts electron energy into a proton gradient');

    const material = extractStudyMaterial(converted.markdown);
    expect(material.terms.length).toBe(converted.stats.cards);
    const questions = material.terms.map((card) => card.term);
    expect(questions.filter((question) => question === 'What is ATP?')).toHaveLength(1);
    expect(questions).toContain('What is Matrix?');
    expect(questions).toContain('What does Citric acid cycle produce?');
    expect(questions).toContain('What does Electron transport chain use?');
    expect(questions).toContain('What does Electron transport chain convert?');
    expect(questions).toContain('What is Proton gradient?');
    expect(questions).toContain('What powers ATP synthase?');
    expect(questions).toContain('What does ATP synthase convert?');
    expect(questions).toContain('What does Figure 1 in Energy Systems show?');
    expect(material.terms.find((card) => card.term.includes('Figure 1'))?.images?.[0].src).toMatch(/^data:image\/png;base64,/);
    expect(material.terms.length).toBeGreaterThan(4);
  });

  it('reports a useful error for a presentation with no study content', async () => {
    const zip = new JSZip();
    zip.file('ppt/slides/slide1.xml', slide(shape('Section divider', 'title')));
    await expect(pptxToMarkdown(await zip.generateAsync({ type: 'arraybuffer' })))
      .rejects.toThrow('No study cards');
  });

  it('keeps the figure caption when the image exceeds its budget', async () => {
    const converted = await pptxToMarkdown(await fixture(), { maxMarkdownChars: 50_000 });
    expect(converted.stats.figures).toBe(0);
    expect(converted.stats.skippedFigures).toBe(1);
    expect(converted.markdown).toContain('What does Figure 1 in Energy Systems show?');
  });

  it('splits numbered, semicolon, definition-plus-example, and comparison bullets into separate facts', async () => {
    const converted = await pptxToMarkdown(await deck([{ body: shape('Concept Splits', 'title')
      + shape('ATP: cellular energy currency used by enzymes; NADH: reduced electron carrier used by the respiratory chain')
      + shape('1) Chloroplasts are organelles that capture sunlight 2) Mitochondrion produces ATP for cellular work')
      + shape('Osmosis is movement of water through a semipermeable membrane; Example: water entering a swollen cell')
      + shape('Mitosis vs Meiosis: mitosis preserves chromosome count; meiosis halves chromosome count') }]));
    const prompts = questions(converted.markdown);
    expect(prompts).toContain('What is ATP?');
    expect(prompts).toContain('What is NADH?');
    expect(prompts).toContain('What are Chloroplasts?');
    expect(prompts).toContain('What does Mitochondrion produce?');
    expect(prompts).toContain('What is Osmosis?');
    expect(prompts).toContain('What is an example of Osmosis?');
    expect(prompts).toContain('How do Mitosis and Meiosis differ?');
    expect(converted.stats.cards).toBeGreaterThanOrEqual(7);
  });

  it('builds one focused comparison from a versus lead and nested explanations', async () => {
    const converted = await pptxToMarkdown(await deck([{ body: shape('Division', 'title')
      + `<p:sp><p:txBody><a:p><a:pPr lvl="0"/><a:r><a:t>Mitosis vs Meiosis</a:t></a:r></a:p>
        <a:p><a:pPr lvl="1"/><a:r><a:t>Mitosis preserves chromosome count</a:t></a:r></a:p>
        <a:p><a:pPr lvl="1"/><a:r><a:t>Meiosis halves chromosome count</a:t></a:r></a:p></p:txBody></p:sp>` }]));
    const material = extractStudyMaterial(converted.markdown);
    expect(material.terms).toHaveLength(1);
    expect(material.terms[0].term).toBe('How do Mitosis and Meiosis differ?');
    expect(material.terms[0].definition).toBe('Mitosis preserves chromosome count; Meiosis halves chromosome count');
  });

  it('makes deliberate cloze and reverse cards from short glossary definitions that the quiz consumes', async () => {
    const converted = await pptxToMarkdown(await deck([{ body: shape('Energy Glossary', 'title')
      + shape('ATP: the primary energy currency used by cells for work')
      + shape('NADH: a reduced electron carrier that feeds the respiratory chain')
      + shape('Matrix: the inner mitochondrial compartment containing cycle enzymes')
      + shape('Ribosome: a cellular machine that translates messenger RNA into protein') }]));
    const material = extractStudyMaterial(converted.markdown);
    expect(material.terms).toHaveLength(converted.stats.cards);
    expect(material.clozes).toHaveLength(converted.stats.clozeCount);
    expect(converted.stats.clozeCount).toBe(4);
    expect(converted.stats.reverseCards).toBe(4);
    expect(material.clozes.map((card) => card.answer)).toEqual(expect.arrayContaining(['ATP', 'NADH', 'Matrix', 'Ribosome']));
    expect(material.clozes.find((card) => card.answer === 'ATP')?.prompt).toContain('____ is the primary energy currency');
    expect(material.terms.find((card) => card.term.startsWith('Which term means “the inner mitochondrial'))?.definition).toBe('Matrix');
    const quiz = buildQuiz(material.terms, material.clozes, { seed: 7 });
    expect(quiz.some((question) => question.kind === 'cloze')).toBe(true);
    expect(quiz.filter((question) => question.kind === 'cloze')
      .every((question) => question.options.every((option) => !/[?？]$/.test(option)))).toBe(true);
  });

  it('keeps an ordinary markdown definition named Cloze distinct from the marked fill-in format', () => {
    const ordinary = extractStudyMaterial('# Terms\n\nCloze: a deletion-based recall exercise for learning vocabulary');
    expect(ordinary.terms.find((card) => card.term === 'Cloze')?.definition)
      .toBe('a deletion-based recall exercise for learning vocabulary');
    expect(ordinary.clozes).toHaveLength(1);
  });

  it('pairs term/meaning rows and ignores decorative or empty tables', async () => {
    const converted = await pptxToMarkdown(await deck([{ body: shape('Cell Structure', 'title')
      + tableRows([['Term', 'Meaning'], ['Matrix', 'inner compartment of the mitochondrion'], ['Cristae', 'folds of the inner mitochondrial membrane']])
      + tableRows([['Logo', 'Logo'], ['', ''], ['Copyright', '2026']]) }]));
    const prompts = questions(converted.markdown);
    expect(prompts).toContain('What is Matrix?');
    expect(prompts).toContain('What is Cristae?');
    expect(prompts).not.toContain('What is Term?');
    expect(prompts).not.toContain('What is Copyright?');
    expect(converted.stats.tables).toBe(2);
    expect(converted.stats.tableCards).toBe(2);
  });

  it('turns comparison rows, including numeric cells, into labeled answers', async () => {
    const converted = await pptxToMarkdown(await deck([{ body: shape('Cell Division', 'title')
      + tableRows([['Feature', 'Mitosis', 'Meiosis'], ['Number of divisions', '1', '2'], ['Chromosome count', 'same number', 'half number']]) }]));
    const material = extractStudyMaterial(converted.markdown);
    expect(converted.stats.tableCards).toBe(2);
    expect(material.terms.find((card) => card.term === 'How do Mitosis and Meiosis compare in Number of divisions?')?.definition)
      .toBe('Mitosis: 1; Meiosis: 2');
    expect(material.terms.find((card) => card.term.includes('Chromosome count'))?.definition)
      .toBe('Mitosis: same number; Meiosis: half number');
  });

  it('pairs each attribute header with its row key in multi-column tables', async () => {
    const converted = await pptxToMarkdown(await deck([{ body: shape('Metabolism', 'title')
      + tableRows([['Process', 'Location', 'Product'],
        ['Glycolysis', 'cytosol of the cell', 'two pyruvate molecules'],
        ['Citric acid cycle', 'mitochondrial matrix', 'reduced electron carriers']]) }]));
    expect(converted.stats.tableCards).toBe(4);
    const prompts = questions(converted.markdown);
    expect(prompts).toContain('For Glycolysis, what is location?');
    expect(prompts).toContain('For Glycolysis, what is product?');
    expect(prompts).toContain('For Citric acid cycle, what is location?');
    expect(prompts).not.toContain('What is Process?');
  });

  it('pairs two figures with captions below by position and uses matching figure notes', async () => {
    const converted = await pptxToMarkdown(await deck([{ body: shape('Respiration', 'title')
      + placedPicture('Electron transport diagram', 'rIdImage1', 0, 1_000_000)
      + placedPicture('ATP synthase rotor', 'rIdImage2', 4_000_000, 1_000_000)
      + placedShape('ATP synthase rotor driven by the proton gradient', 4_000_000, 2_200_000)
      + placedShape('Figure 1: electron transport chain in the inner membrane', 0, 2_200_000),
    notes: shape('Figure 2: proton flow rotates ATP synthase to produce ATP', 'body'),
    images: ['rIdImage1', 'rIdImage2'] }]));
    const material = extractStudyMaterial(converted.markdown);
    expect(converted.stats.figures).toBe(2);
    expect(converted.stats.notesCards).toBe(0);
    const first = material.terms.find((card) => card.term === 'What does Figure 1 in Respiration show?');
    const second = material.terms.find((card) => card.term === 'What does Figure 2 in Respiration show?');
    expect(first?.definition).toContain('electron transport chain');
    expect(second?.definition).toContain('proton flow rotates ATP synthase');
    expect(first?.images?.[0].src).toMatch(/^data:image\/png;base64,/);
    expect(second?.images?.[0].src).toMatch(/^data:image\/png;base64,/);
  });

  it('uses a numbered note as the caption when a figure has no nearby body caption', async () => {
    const converted = await pptxToMarkdown(await deck([{ body: shape('Respiration', 'title')
      + placedPicture('', 'rIdImage1', 1_000_000, 1_000_000),
    notes: shape('Figure 3: electron carriers donate energy to build a proton gradient', 'body'), images: ['rIdImage1'] }]));
    expect(converted.stats.figures).toBe(1);
    expect(questions(converted.markdown)).toContain('What does Figure 3 in Respiration show?');
  });

  it('keeps a useful caption when its image relationship is missing', async () => {
    const converted = await pptxToMarkdown(await deck([{ body: shape('Respiration', 'title')
      + placedPicture('', 'rIdMissing', 1_000_000, 1_000_000)
      + placedShape('Figure 1: proton pumping across the mitochondrial inner membrane', 1_000_000, 2_200_000) }]));
    const figure = extractStudyMaterial(converted.markdown).terms.find((card) => card.term.includes('Figure 1'));
    expect(converted.stats.figures).toBe(0);
    expect(converted.stats.skippedFigures).toBe(1);
    expect(figure?.definition).toContain('proton pumping');
    expect(figure?.images).toBeUndefined();
  });

  it('skips tiny decorative icons without consuming the figure budget', async () => {
    const converted = await pptxToMarkdown(await deck([{ body: shape('Respiration', 'title')
      + shape('ATP synthase converts proton flow into chemical energy')
      + placedPicture('Company logo', 'rIdImage1', 0, 0, 100_000, 100_000), images: ['rIdImage1'] }]));
    expect(converted.stats.figures).toBe(0);
    expect(converted.stats.skippedFigures).toBe(0);
    expect(converted.markdown).not.toContain('Company logo');
    expect(questions(converted.markdown)).toContain('What does ATP synthase convert?');
  });

  it('threads a divider topic into ambiguous bullets and mines notes-only slides', async () => {
    const converted = await pptxToMarkdown(await deck([
      { body: shape('Energy Conversion', 'title') },
      { body: shape('Proton Gradient', 'title') + shape('It stores chemical energy across the inner membrane') },
      { body: shape('Exam Review', 'title'), notes: shape('Remember that mitochondria generate ATP through oxidative phosphorylation', 'body')
        + shape('Exam tip: proton gradient drives ATP synthase during oxidative phosphorylation', 'body')
        + shape('3', 'sldNum') },
    ]));
    const material = extractStudyMaterial(converted.markdown);
    expect(converted.stats.skippedSlides).toBe(1);
    expect(converted.stats.notes).toBe(1);
    expect(converted.stats.notesCards).toBe(2);
    expect(material.terms.some((card) => card.section === 'Energy Conversion — Proton Gradient'
      && card.term.includes('In Energy Conversion — Proton Gradient'))).toBe(true);
    expect(material.terms.some((card) => card.term === 'What do Mitochondria generate?')).toBe(true);
    expect(material.terms.map((card) => card.definition)).not.toContain('3');
  });

  it('splits two facts inside one speaker-note reminder and retains useful notes on an ending slide', async () => {
    const converted = await pptxToMarkdown(await deck([{ body: shape('Questions?', 'title'),
      notes: shape('Remember that mitochondria produce ATP. Ribosomes produce proteins for the cell', 'body') }]));
    expect(converted.stats.notesCards).toBe(2);
    expect(questions(converted.markdown)).toEqual(expect.arrayContaining([
      'What do Mitochondria produce?', 'What do Ribosomes produce?',
    ]));
  });

  it('skips agendas, numbered contents, ending slides, and sparse chrome', async () => {
    const converted = await pptxToMarkdown(await deck([
      { body: shape('Agenda', 'title') + shape('1. Energy systems') + shape('2. Respiration')
        + placedPicture('Corporate slide background', 'rIdImage1', 0, 0), images: ['rIdImage1'] },
      { body: shape('Course Roadmap', 'title') + shape('1. Photosynthesis') + shape('2. Respiration') + shape('3. Practice') },
      { body: shape('Questions?', 'title') + shape('Click to continue') },
      { body: shape('Energy', 'title') + shape('ATP synthase converts proton flow into chemical energy') },
    ]));
    expect(converted.title).toBe('Energy');
    expect(converted.stats.skippedAgenda).toBe(2);
    expect(converted.stats.skippedSlides).toBe(3);
    expect(questions(converted.markdown)).toEqual(['What does ATP synthase convert?']);
  });

  it('collapses grammar-level duplicates while keeping changed facts for the same question', async () => {
    const converted = await pptxToMarkdown(await deck([{ body: shape('ATP', 'title')
      + shape('ATP: the energy currency of a cell')
      + shape('ATP is the energy currency of the cell')
      + shape('ATP: the energy currency of a bacterial cell') }]));
    const definitions = extractStudyMaterial(converted.markdown).terms
      .filter((card) => card.term === 'What is ATP?').map((card) => card.definition);
    expect(definitions).toHaveLength(2);
    expect(definitions).toEqual(expect.arrayContaining(['the energy currency of a cell', 'the energy currency of a bacterial cell']));
  });

  it('keeps conflicting numbers and negation even when the other words match', async () => {
    const converted = await pptxToMarkdown(await deck([{ body: shape('Division Counts', 'title')
      + shape('Mitosis: one division produces two daughter cells')
      + shape('Mitosis: two divisions produce two daughter cells')
      + shape('Meiosis: chromosome count is reduced')
      + shape('Meiosis: chromosome count is not reduced') }]));
    const material = extractStudyMaterial(converted.markdown);
    expect(material.terms.filter((card) => card.term === 'What is Mitosis?')).toHaveLength(2);
    expect(material.terms.filter((card) => card.term === 'What is Meiosis?')).toHaveLength(2);
  });

  it('drops page numbers, slide controls, copyright, and logo labels', async () => {
    const converted = await pptxToMarkdown(await deck([{ body: shape('Respiration', 'title')
      + shape('12') + shape('Click to add text') + shape('Copyright 2026')
      + shape('University logo') + shape('ATP synthase converts proton flow into chemical energy') }]));
    expect(questions(converted.markdown)).toEqual(['What does ATP synthase convert?']);
  });

  it('rejects corrupt and empty archives, oversized input, and an aborted conversion', async () => {
    await expect(pptxToMarkdown(new Uint8Array([1, 2, 3, 4]).buffer)).rejects.toThrow('not a readable PPTX');
    await expect(pptxToMarkdown(await new JSZip().generateAsync({ type: 'arraybuffer' }))).rejects.toThrow('No slides were found');
    await expect(pptxToMarkdown(new ArrayBuffer(40 * 1024 * 1024 + 1))).rejects.toThrow('40 MB import limit');
    const oversizedXml = new JSZip();
    oversizedXml.file('ppt/slides/slide1.xml', 'x'.repeat(5_000_001));
    await expect(pptxToMarkdown(await oversizedXml.generateAsync({ type: 'arraybuffer' })))
      .rejects.toThrow('oversized XML part');
    await expect(pptxToMarkdown(await deck([{ body: shape('ATP', 'title')
      + shape('ATP: the energy currency of the cell') }]), { maxMarkdownChars: 80 }))
      .rejects.toThrow('converted deck is too large');
    const controller = new AbortController();
    controller.abort();
    await expect(pptxToMarkdown(await deck([{ body: shape('ATP', 'title') + shape('ATP: the energy currency of the cell') }]),
      { signal: controller.signal })).rejects.toMatchObject({ name: 'AbortError' });
  });
});
