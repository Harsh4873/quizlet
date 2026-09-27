import JSZip from 'jszip';
import { normalizeKey } from './extract';

const P = 'http://schemas.openxmlformats.org/presentationml/2006/main';
const A = 'http://schemas.openxmlformats.org/drawingml/2006/main';
const R = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
const MAX_FILE_BYTES = 40 * 1024 * 1024;
const MAX_SLIDES = 400;
const MAX_XML_CHARS = 5_000_000;
const RASTER_MIMES: Record<string, string> = {
  png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif',
  webp: 'image/webp', bmp: 'image/bmp',
};
const DEDUP_ARTICLES = new Set(['a', 'an', 'the']);

export interface PptxProgress {
  slide: number;
  slides: number;
}

export interface PptxStats {
  slides: number;
  skippedSlides: number;
  cards: number;
  figures: number;
  skippedFigures: number;
  notes: number;
  tables: number;
}

export interface PptxImportOptions {
  fallbackTitle?: string;
  onProgress?: (progress: PptxProgress) => void;
  signal?: AbortSignal;
  /** Limit data URLs in the saved markdown. The owner vault accepts at most 600 KB of markdown. */
  maxMarkdownChars?: number;
}

export interface PptxConversion {
  title: string;
  markdown: string;
  stats: PptxStats;
}

interface Paragraph { text: string; level: number }
interface TextShape { kind: 'text'; paragraphs: Paragraph[]; placeholder: string; y: number }
interface TableShape { kind: 'table'; rows: string[][] }
interface PictureShape { kind: 'picture'; relId: string; alt: string; y: number }
type SlideShape = TextShape | TableShape | PictureShape;
interface Card { question: string; answer: string; image?: { alt: string; url: string } }
interface Relationship { target: string; type: string }
interface ContentTypes { defaults: Map<string, string>; overrides: Map<string, string> }

function children(element: Element): Element[] {
  return Array.from(element.childNodes).filter((node): node is Element => node.nodeType === 1);
}

function descendants(element: Element | Document, namespace: string, name: string): Element[] {
  return Array.from(element.getElementsByTagNameNS(namespace, name));
}

function first(element: Element | Document, namespace: string, name: string): Element | undefined {
  return descendants(element, namespace, name)[0];
}

function text(element: Element): string {
  const pieces: string[] = [];
  const visit = (node: Element) => {
    if (node.namespaceURI === A && node.localName === 't') {
      pieces.push(node.textContent ?? '');
      return;
    }
    if (node.namespaceURI === A && (node.localName === 'br' || node.localName === 'tab')) {
      pieces.push(' ');
      return;
    }
    for (const child of children(node)) visit(child);
  };
  visit(element);
  return pieces.join('').replace(/\s+/g, ' ').trim();
}

function paragraphs(body: Element | undefined): Paragraph[] {
  if (!body) return [];
  return children(body)
    .filter((node) => node.namespaceURI === A && node.localName === 'p')
    .map((node) => ({
      text: text(node),
      level: Number(first(node, A, 'pPr')?.getAttribute('lvl') ?? 0) || 0,
    }))
    .filter((paragraph) => paragraph.text);
}

function yPosition(element: Element): number {
  const xfrm = first(element, A, 'xfrm') ?? first(element, P, 'xfrm');
  return Number(first(xfrm ?? element, A, 'off')?.getAttribute('y') ?? 0) || 0;
}

function altText(element: Element): string {
  const props = first(element, P, 'cNvPr');
  const name = props?.getAttribute('name')?.trim() ?? '';
  return props?.getAttribute('descr')?.trim()
    || props?.getAttribute('title')?.trim()
    || (/^(?:picture|rectangle|text ?box|oval|graphic ?frame|shape|title|content placeholder)\s*\d+$/i.test(name) ? '' : name);
}

function readShapes(root: Element): SlideShape[] {
  const out: SlideShape[] = [];
  const visit = (node: Element) => {
    if (node.namespaceURI !== P) return;
    if (node.localName === 'grpSp') {
      for (const child of children(node)) visit(child);
    } else if (node.localName === 'sp') {
      const body = children(node).find((child) => child.namespaceURI === P && child.localName === 'txBody');
      const lines = paragraphs(body);
      const alt = altText(node);
      const placeholder = first(node, P, 'ph')?.getAttribute('type') ?? '';
      if (alt && !/^(?:title|ctrTitle)$/i.test(placeholder)
        && !lines.some((line) => normalizeKey(line.text) === normalizeKey(alt))) {
        lines.push({ text: alt, level: 0 });
      }
      if (lines.length) out.push({
        kind: 'text',
        paragraphs: lines,
        placeholder,
        y: yPosition(node),
      });
      const embedded = first(node, A, 'blip')?.getAttributeNS(R, 'embed');
      if (embedded) out.push({ kind: 'picture', relId: embedded, alt, y: yPosition(node) });
    } else if (node.localName === 'graphicFrame') {
      const table = first(node, A, 'tbl');
      if (!table) {
        const alt = altText(node);
        if (alt) out.push({ kind: 'text', paragraphs: [{ text: alt, level: 0 }], placeholder: '', y: yPosition(node) });
        const embedded = first(node, A, 'blip')?.getAttributeNS(R, 'embed');
        if (embedded) out.push({ kind: 'picture', relId: embedded, alt, y: yPosition(node) });
        return;
      }
      const rows = children(table)
        .filter((child) => child.namespaceURI === A && child.localName === 'tr')
        .map((row) => children(row)
          .filter((child) => child.namespaceURI === A && child.localName === 'tc')
          .map((cell) => paragraphs(first(cell, A, 'txBody')).map((p) => p.text).join(' ')));
      if (rows.length) out.push({ kind: 'table', rows });
    } else if (node.localName === 'pic') {
      const blip = first(node, A, 'blip');
      const relId = blip?.getAttributeNS(R, 'embed') ?? '';
      const alt = altText(node);
      if (relId) out.push({ kind: 'picture', relId, alt, y: yPosition(node) });
    }
  };
  const tree = first(root, P, 'spTree');
  if (tree) for (const child of children(tree)) visit(child);
  return out;
}

function resolvePart(from: string, target: string): string | null {
  if (!target || /^[a-z][\w+.-]*:/i.test(target)) return null;
  const parts = (target.startsWith('/') ? [] : from.split('/').slice(0, -1));
  for (const piece of target.replace(/^\//, '').split('/')) {
    if (!piece || piece === '.') continue;
    if (piece === '..') {
      if (!parts.length) return null;
      parts.pop();
    } else parts.push(piece);
  }
  return parts.join('/');
}

function relsPath(part: string): string {
  const at = part.lastIndexOf('/');
  return `${part.slice(0, at + 1)}_rels/${part.slice(at + 1)}.rels`;
}

function relationships(doc: Document | null, part: string): Map<string, Relationship> {
  const out = new Map<string, Relationship>();
  if (!doc) return out;
  for (const rel of Array.from(doc.getElementsByTagName('Relationship'))) {
    if (rel.getAttribute('TargetMode') === 'External') continue;
    const id = rel.getAttribute('Id');
    const target = resolvePart(part, rel.getAttribute('Target') ?? '');
    if (id && target) out.set(id, { target, type: rel.getAttribute('Type') ?? '' });
  }
  return out;
}

async function xml(zip: JSZip, path: string): Promise<Document | null> {
  const file = zip.file(path);
  if (!file) return null;
  const source = await file.async('string');
  if (source.length > MAX_XML_CHARS) throw new Error(`The presentation has an oversized XML part: ${path}`);
  const doc = new DOMParser().parseFromString(source, 'application/xml');
  if (doc.getElementsByTagName('parsererror').length || !doc.documentElement) {
    throw new Error(`Could not read presentation XML: ${path}`);
  }
  return doc;
}

async function slidePaths(zip: JSZip): Promise<string[]> {
  const presentation = await xml(zip, 'ppt/presentation.xml');
  const rels = relationships(await xml(zip, relsPath('ppt/presentation.xml')), 'ppt/presentation.xml');
  const ids = presentation ? descendants(presentation, P, 'sldId') : [];
  const ordered = ids
    .map((id) => rels.get(id.getAttributeNS(R, 'id') ?? '')?.target)
    .filter((path): path is string => Boolean(path && zip.file(path)));
  if (ordered.length) return ordered.slice(0, MAX_SLIDES);
  return Object.keys(zip.files)
    .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
    .sort((a, b) => Number(a.match(/\d+/g)?.at(-1)) - Number(b.match(/\d+/g)?.at(-1)))
    .slice(0, MAX_SLIDES);
}

async function contentTypes(zip: JSZip): Promise<ContentTypes> {
  const types: ContentTypes = { defaults: new Map(), overrides: new Map() };
  const doc = await xml(zip, '[Content_Types].xml');
  if (!doc) return types;
  for (const element of Array.from(doc.documentElement.childNodes).filter((node): node is Element => node.nodeType === 1)) {
    if (element.localName === 'Default') {
      const extension = element.getAttribute('Extension')?.toLowerCase();
      const mime = element.getAttribute('ContentType');
      if (extension && mime) types.defaults.set(extension, mime);
    } else if (element.localName === 'Override') {
      const path = element.getAttribute('PartName')?.replace(/^\//, '');
      const mime = element.getAttribute('ContentType');
      if (path && mime) types.overrides.set(path, mime);
    }
  }
  return types;
}

function rasterMime(path: string, types: ContentTypes): string | undefined {
  const extension = path.split('.').at(-1)?.toLowerCase() ?? '';
  const declared = types.overrides.get(path) ?? types.defaults.get(extension);
  const known = Object.values(RASTER_MIMES);
  if (declared && known.includes(declared)) return declared;
  return RASTER_MIMES[extension];
}

function clean(value: string): string {
  return value.replace(/\s+/g, ' ').replace(/^[-•–]\s*/, '').trim();
}

function questionForFact(value: string, topic: string): Card | null {
  const fact = clean(value).replace(/[.;]\s*$/, '');
  if (fact.length < 12 || !/[a-zA-Z]/.test(fact)) return null;
  const colon = fact.match(/^([^:：]{2,78})\s*[:：]\s*(.{5,})$/);
  if (colon && colon[1].split(/\s+/).length <= 9) {
    return { question: `What is ${clean(colon[1])}?`, answer: clean(colon[2]) };
  }
  const definition = fact.match(/^(.{2,75}?)\s+(is|are|means|refers to|describes|represents|consists of|is defined as)\s+(.{5,})$/i);
  if (definition && definition[1].split(/\s+/).length <= 9) {
    return { question: `What ${definition[2].toLowerCase() === 'are' ? 'are' : 'is'} ${clean(definition[1])}?`, answer: fact };
  }
  const action = fact.match(/^(.{2,65}?)\s+(absorbs|activates|binds|carries|catalyzes|causes|codes|contains|controls|converts|creates|determines|drives|enables|encodes|forms|generates|includes|increases|inhibits|maintains|measures|produces|protects|provides|reduces|regulates|releases|requires|separates|sends|stores|transfers|transmits|uses)\s+(.{3,})$/i);
  if (action && action[1].split(/\s+/).length <= 7) {
    const verb = action[2].toLowerCase();
    const baseVerb = verb.endsWith('ies') ? `${verb.slice(0, -3)}y` : verb.slice(0, -1);
    return { question: `What does ${clean(action[1])} ${baseVerb}?`, answer: fact };
  }
  const lead = fact.split(/\s+/).slice(0, 3).join(' ');
  return { question: `In ${topic}, what is the point about “${lead}”?`, answer: fact };
}

function cardsFromParagraphs(lines: Paragraph[], topic: string): Card[] {
  const cards: Card[] = [];
  for (let index = 0; index < lines.length; index++) {
    const value = clean(lines[index].text);
    const inlineQa = value.match(/^(?:Q|Question)\s*[:.)-]\s*(.+?[?!.])\s+(?:A|Answer)\s*[:.)-]\s*(.+)$/i);
    if (inlineQa) {
      cards.push({ question: clean(inlineQa[1]), answer: clean(inlineQa[2]) });
      continue;
    }
    const q = value.match(/^(?:Q|Question)\s*[:.)-]\s*(.+)$/i);
    if (q) {
      const next = lines[index + 1]?.text.match(/^(?:A|Answer)\s*[:.)-]\s*(.+)$/i);
      if (next) {
        cards.push({ question: clean(q[1]), answer: clean(next[1]) });
        index++;
        continue;
      }
      continue;
    }
    if (/^(?:A|Answer)\s*[:.)-]/i.test(value)) continue;
    // A short lead followed by an indented explanation is a concept and its definition.
    const following = lines[index + 1];
    if (value.length <= 65 && !/[.!?;:]$/.test(value) && following
      && following.level > lines[index].level && following.text.length >= 16) {
      cards.push({ question: `What is ${value}?`, answer: clean(following.text) });
      index++;
      continue;
    }
    const clauses = value.split(/;\s+(?=[A-Z\p{L}])|(?<=[.!?])\s+(?=[A-Z])/u);
    for (const clause of clauses) {
      const card = questionForFact(clause, topic);
      if (card) cards.push(card);
    }
  }
  return cards;
}

function cardsFromTable(rows: string[][], topic: string): Card[] {
  if (!rows.length) return [];
  const header = rows[0].map(clean);
  const namedHeader = /^(?:term|concept|name|type|feature|component|structure|item)$/i.test(header[0] ?? '');
  const body = namedHeader ? rows.slice(1) : rows;
  const cards: Card[] = [];
  for (const row of body) {
    const key = clean(row[0] ?? '');
    const rest = row.slice(1).map(clean).filter(Boolean);
    if (key && key.length <= 85 && rest.length) {
      const answer = rest.map((cell, i) => namedHeader && header[i + 1] ? `${header[i + 1]}: ${cell}` : cell).join('; ');
      cards.push({ question: `What is ${key}?`, answer });
    } else for (const cell of row) {
      const card = questionForFact(cell, topic);
      if (card) cards.push(card);
    }
  }
  return cards;
}

function noteLines(notes: Document | null): Paragraph[] {
  if (!notes?.documentElement) return [];
  const shapes = readShapes(notes.documentElement);
  return shapes.flatMap((shape) => shape.kind === 'text' && !/^(?:sldNum|hdr|ftr|dt)$/i.test(shape.placeholder)
    ? shape.paragraphs : []);
}

function tokenSimilarity(a: string, b: string): number {
  const tokens = (value: string) => normalizeKey(value).split(' ')
    .filter((word) => word && !DEDUP_ARTICLES.has(word));
  const one = new Set(tokens(a));
  const two = new Set(tokens(b));
  if (!one.size || !two.size) return 0;
  let common = 0;
  for (const token of one) if (two.has(token)) common++;
  return common / (one.size + two.size - common);
}

function addUnique(cards: Card[], candidate: Card): void {
  const question = clean(candidate.question).replace(/\?*$/, '?');
  const answer = clean(candidate.answer);
  if (!question || answer.length < 4) return;
  if (cards.some((existing) =>
    normalizeKey(existing.question) === normalizeKey(question)
      && tokenSimilarity(existing.answer, answer) >= 0.82
      && ((!existing.image && !candidate.image) || existing.image?.url === candidate.image?.url)
    || tokenSimilarity(existing.answer, answer) >= 0.94
      && tokenSimilarity(existing.question, question) >= 0.75
      && !existing.image && !candidate.image)) return;
  cards.push({ ...candidate, question, answer });
}

function escapeMarkdown(value: string): string {
  return value.replace(/[\[\]\\`*_!]/g, '\\$&').replace(/\s+/g, ' ').trim();
}

function isAgenda(title: string, body: string[]): boolean {
  return /^(?:agenda|outline|overview|table of contents|contents|today(?:'s topics)?|topics|(?:learning )?objectives?)$/i.test(title)
    && body.every((line) => {
      const item = line.replace(/^\s*\d+[.)]\s*/, '').trim();
      return item.length < 90 && !/\b(?:is|are|means|because|causes|consists|refers to)\b|[:;]/i.test(item);
    });
}

function base64(bytes: Uint8Array): string {
  let binary = '';
  for (let at = 0; at < bytes.length; at += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(at, at + 0x8000));
  }
  return btoa(binary);
}

async function compressedDataUrl(bytes: Uint8Array, mime: string, maxChars: number): Promise<string | null> {
  const prefix = `data:${mime};base64,`;
  if (prefix.length + Math.ceil(bytes.length / 3) * 4 <= maxChars) return `${prefix}${base64(bytes)}`;
  if (typeof createImageBitmap !== 'function' || typeof document === 'undefined') return null;
  try {
    const bitmap = await createImageBitmap(new Blob([bytes as BlobPart], { type: mime }));
    try {
      for (const longest of [1400, 1000, 700, 450]) {
        const scale = Math.min(1, longest / Math.max(bitmap.width, bitmap.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(bitmap.width * scale));
        canvas.height = Math.max(1, Math.round(bitmap.height * scale));
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        for (const outputMime of ['image/webp', 'image/jpeg']) {
          for (const quality of [0.83, 0.68]) {
            const candidate = canvas.toDataURL(outputMime, quality);
            if (candidate.startsWith(`data:${outputMime};`) && candidate.length <= maxChars) return candidate;
          }
        }
      }
    } finally {
      bitmap.close();
    }
  } catch { /* Keep the caption when an image cannot be decoded. */ }
  return null;
}

/** Read slide content and build study markdown without uploading the presentation. */
export async function pptxToMarkdown(file: File | ArrayBuffer, options: PptxImportOptions = {}): Promise<PptxConversion> {
  const bytes = file instanceof ArrayBuffer ? file : await file.arrayBuffer();
  if (bytes.byteLength > MAX_FILE_BYTES) throw new Error('The PPTX is over the 40 MB import limit.');
  let zip: JSZip;
  try { zip = await JSZip.loadAsync(bytes); }
  catch { throw new Error('This file is not a readable PPTX presentation.'); }
  const paths = await slidePaths(zip);
  if (!paths.length) throw new Error('No slides were found in this PPTX.');
  const mediaTypes = await contentTypes(zip);

  const fallback = clean(options.fallbackTitle?.replace(/\.pptx$/i, '').replace(/[_-]+/g, ' ') ?? '') || 'Imported presentation';
  const stats: PptxStats = { slides: paths.length, skippedSlides: 0, cards: 0, figures: 0, skippedFigures: 0, notes: 0, tables: 0 };
  const sections: string[] = [];
  const allCards: Card[] = [];
  let deckTitle = fallback;
  let titleChosen = false;
  let parentTopic = '';
  let usedImageChars = 0;
  const imageBudget = Math.min(Math.max(0, (options.maxMarkdownChars ?? 1_800_000) - 50_000), 1_500_000);

  for (let index = 0; index < paths.length; index++) {
    if (options.signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    const path = paths[index];
    const slide = await xml(zip, path);
    if (!slide?.documentElement) continue;
    const rels = relationships(await xml(zip, relsPath(path)), path);
    const shapes = readShapes(slide.documentElement);
    const titleShape = shapes.find((shape): shape is TextShape => shape.kind === 'text'
      && /^(?:title|ctrTitle)$/i.test(shape.placeholder));
    const textShapes = shapes.filter((shape): shape is TextShape => shape.kind === 'text');
    const fallbackShape = !titleShape && textShapes.length > 1 && textShapes[0].paragraphs.length === 1
      && textShapes[0].paragraphs[0].text.length <= 100 ? textShapes[0] : undefined;
    const heading = clean((titleShape ?? fallbackShape)?.paragraphs.map((p) => p.text).join(' ') ?? '');
    const bodyShapes = textShapes.filter((shape) => shape !== titleShape && shape !== fallbackShape);
    const bodyText = bodyShapes.flatMap((shape) => shape.paragraphs.map((p) => p.text));
    const tables = shapes.filter((shape): shape is TableShape => shape.kind === 'table');
    const pictures = shapes.filter((shape): shape is PictureShape => shape.kind === 'picture');
    const notesRel = [...rels.values()].find((rel) => rel.type.endsWith('/notesSlide'));
    const notes = noteLines(notesRel ? await xml(zip, notesRel.target) : null);
    if (notes.length) stats.notes++;
    stats.tables += tables.length;

    const agenda = isAgenda(heading, bodyText) && !notes.length && !tables.length && !pictures.length;
    if (!titleChosen && heading && !agenda) {
      deckTitle = heading;
      titleChosen = true;
    }
    if (agenda) {
      stats.skippedSlides++;
      options.onProgress?.({ slide: index + 1, slides: paths.length });
      continue;
    }
    if (!bodyText.length && !notes.length && !tables.length && !pictures.length) {
      stats.skippedSlides++;
      if (heading) parentTopic = heading;
      options.onProgress?.({ slide: index + 1, slides: paths.length });
      continue;
    }
    if (bodyShapes.length && bodyShapes.every((shape) => shape.placeholder === 'subTitle')
      && !notes.length && !tables.length && !pictures.length) {
      stats.skippedSlides++;
      if (heading) parentTopic = heading;
      options.onProgress?.({ slide: index + 1, slides: paths.length });
      continue;
    }
    if (bodyText.length === 1 && /^(?:chapter|unit|part|section)\s*\d+\s*[:.)-]/i.test(bodyText[0])
      && !notes.length && !tables.length && !pictures.length) {
      stats.skippedSlides++;
      if (heading) parentTopic = heading;
      options.onProgress?.({ slide: index + 1, slides: paths.length });
      continue;
    }
    if (bodyText.length && bodyText.every((line) => line.length < 25
      && !/\b(?:is|are|means|causes|uses|includes|contains|converts|requires)\b|[:.;]/i.test(line))
      && !notes.length && !tables.length && !pictures.length) {
      stats.skippedSlides++;
      if (heading) parentTopic = heading;
      options.onProgress?.({ slide: index + 1, slides: paths.length });
      continue;
    }

    const topic = heading || parentTopic || `Slide ${index + 1}`;
    const section = parentTopic && heading && parentTopic !== heading ? `${parentTopic} — ${heading}` : topic;
    const slideCards: Card[] = [];
    const bodyLines = bodyShapes
      .filter((shape) => !pictures.length || !/^(?:fig(?:ure)?\.?\s*\d+|diagram\s*\d+|image\s*\d+)\b/i.test(shape.paragraphs[0].text))
      .flatMap((shape) => shape.paragraphs);
    for (const card of cardsFromParagraphs(bodyLines, topic)) addUnique(slideCards, card);
    for (const table of tables) for (const card of cardsFromTable(table.rows, topic)) addUnique(slideCards, card);
    for (const card of cardsFromParagraphs(notes, topic)) addUnique(slideCards, card);

    // Captions remain near their figures even when drawing order differs from visual order.
    const captions = bodyShapes.filter((shape) => shape.paragraphs.length <= 2
      && /^(?:fig(?:ure)?\.?\s*\d+|diagram\s*\d+|image\s*\d+)\b/i.test(shape.paragraphs[0].text));
    const usedCaptions = new Set<TextShape>();
    for (const [pictureIndex, picture] of pictures.entries()) {
      const nearest = captions.filter((shape) => !usedCaptions.has(shape))
        .sort((a, b) => Math.abs(a.y - picture.y) - Math.abs(b.y - picture.y))[0];
      const matched = nearest && (pictures.length === 1 || Math.abs(nearest.y - picture.y) < 3_500_000)
        ? nearest : undefined;
      if (matched) usedCaptions.add(matched);
      const caption = matched?.paragraphs.map((p) => p.text).join(' ') ?? '';
      const label = clean(caption || picture.alt || `${topic} figure`);
      const relationship = rels.get(picture.relId);
      const mediaPath = relationship?.type.endsWith('/image') ? relationship.target : null;
      const mime = mediaPath ? rasterMime(mediaPath, mediaTypes) : undefined;
      let url: string | null = null;
      if (mediaPath && mime && zip.file(mediaPath)) {
        const data = await zip.file(mediaPath)!.async('uint8array');
        const available = Math.min(350_000, imageBudget - usedImageChars);
        if (available > 2_000 && (data.length > 500 || caption || picture.alt)) {
          url = await compressedDataUrl(data, mime, available);
        }
      }
      if (url) {
        usedImageChars += url.length;
        stats.figures++;
      } else stats.skippedFigures++;
      if (url || caption || picture.alt) {
        const figureName = caption.match(/^(?:fig(?:ure)?\.?|diagram|image)\s*\d+/i)?.[0]
          || `figure ${pictureIndex + 1}`;
        addUnique(slideCards, {
          question: `What does ${figureName} in ${topic} show?`,
          answer: clean([caption, picture.alt].filter((part, i, all) => part && all.indexOf(part) === i).join(' — ')) || label,
          image: url ? { alt: label, url } : undefined,
        });
      }
    }

    const uniqueForSection: Card[] = [];
    for (const card of slideCards) {
      const before = allCards.length;
      addUnique(allCards, card);
      if (allCards.length > before) uniqueForSection.push(card);
    }
    if (uniqueForSection.length) {
      sections.push(`## ${escapeMarkdown(section)}`);
      for (const card of uniqueForSection) {
        sections.push(`Q: ${escapeMarkdown(card.question)}`);
        sections.push(`A: ${escapeMarkdown(card.answer)}${card.image ? ` ![${clean(card.image.alt).replace(/[\[\]]/g, '')}](${card.image.url})` : ''}`);
        sections.push('');
      }
    } else stats.skippedSlides++;
    options.onProgress?.({ slide: index + 1, slides: paths.length });
  }

  stats.cards = allCards.length;
  if (!stats.cards) throw new Error('No study cards could be made from this presentation.');
  const markdown = [`# ${escapeMarkdown(deckTitle)}`, '', ...sections].join('\n').trim() + '\n';
  if (new TextEncoder().encode(markdown).byteLength > (options.maxMarkdownChars ?? 1_800_000)) {
    throw new Error('The converted deck is too large to save. Try a smaller presentation.');
  }
  return { title: deckTitle, markdown, stats };
}
