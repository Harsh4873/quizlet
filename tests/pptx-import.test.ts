import JSZip from 'jszip';
import { DOMParser } from '@xmldom/xmldom';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { extractStudyMaterial } from '../src/lib/extract';
import { pptxToMarkdown } from '../src/lib/pptx-import';

const P = 'http://schemas.openxmlformats.org/presentationml/2006/main';
const A = 'http://schemas.openxmlformats.org/drawingml/2006/main';
const R = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
const O = 'http://schemas.openxmlformats.org/package/2006/relationships';

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
});
