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
const DEDUP_FILLERS = new Set(['a', 'an', 'the', 'is', 'are', 'was', 'were', 'its', 'of', 'at', 'in']);

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
  tableCards: number;
  notesCards: number;
  clozeCount: number;
  reverseCards: number;
  skippedAgenda: number;
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
interface Position { x: number; y: number; width: number; height: number }
interface TextShape extends Position { kind: 'text'; paragraphs: Paragraph[]; placeholder: string }
interface TableShape { kind: 'table'; rows: string[][] }
interface PictureShape extends Position { kind: 'picture'; relId: string; alt: string }
type SlideShape = TextShape | TableShape | PictureShape;
interface Card {
  question: string;
  answer: string;
  source: 'body' | 'table' | 'notes' | 'figure' | 'reverse';
  image?: { alt: string; url: string };
  cloze?: { sentence: string; answer: string };
}
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

function position(element: Element): Position {
  const xfrm = first(element, A, 'xfrm') ?? first(element, P, 'xfrm');
  const offset = first(xfrm ?? element, A, 'off');
  const extent = first(xfrm ?? element, A, 'ext');
  return {
    x: Number(offset?.getAttribute('x') ?? 0) || 0,
    y: Number(offset?.getAttribute('y') ?? 0) || 0,
    width: Number(extent?.getAttribute('cx') ?? 0) || 0,
    height: Number(extent?.getAttribute('cy') ?? 0) || 0,
  };
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
        ...position(node),
      });
      const embedded = first(node, A, 'blip')?.getAttributeNS(R, 'embed');
      if (embedded) out.push({ kind: 'picture', relId: embedded, alt, ...position(node) });
    } else if (node.localName === 'graphicFrame') {
      const table = first(node, A, 'tbl');
      if (!table) {
        const alt = altText(node);
        if (alt) out.push({ kind: 'text', paragraphs: [{ text: alt, level: 0 }], placeholder: '', ...position(node) });
        const embedded = first(node, A, 'blip')?.getAttributeNS(R, 'embed');
        if (embedded) out.push({ kind: 'picture', relId: embedded, alt, ...position(node) });
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
      if (relId) out.push({ kind: 'picture', relId, alt, ...position(node) });
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

function initialUpper(value: string): string {
  const normalized = clean(value);
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function isNoise(value: string): boolean {
  const line = clean(value);
  return !/[a-zA-Z]/.test(line)
    || /^\d+(?:\s*[/|-]\s*\d+)?$/.test(line)
    || /^(?:click|tap|press)\s+(?:here|to|next|back|the)\b/i.test(line)
    || /^(?:next|previous|back|home|slide show|insert title|add text|speaker notes)$/i.test(line)
    || /^(?:©|copyright\b|all rights reserved\b|https?:\/\/|www\.)/i.test(line)
    || /^(?:logo|university logo|company logo|icon)\s*\d*$/i.test(line);
}

function clozeForDefinition(term: string, definition: string, verb?: 'is' | 'are'): Card['cloze'] | undefined {
  const name = clean(term);
  const detail = clean(definition).replace(/[.;]\s*$/, '');
  if (name.length < 3 || name.length > 55 || name.split(/\s+/).length > 7
    || detail.length < 18 || detail.length > 170 || isNoise(detail)
    || normalizeKey(detail).startsWith(`${normalizeKey(name)} `)) return undefined;
  const copula = verb ?? (/s$/i.test(name) && !/(?:sis|us|ss)$/i.test(name) ? 'are' : 'is');
  const sentence = `${name} ${copula} ${detail}.`;
  return sentence.length >= 30 && sentence.length <= 240 ? { sentence, answer: name } : undefined;
}

function reverseForDefinition(term: string, definition: string): Card | null {
  const name = clean(term);
  const detail = clean(definition).replace(/[.;]\s*$/, '');
  if (name.length < 3 || name.length > 40 || name.split(/\s+/).length > 5
    || detail.length < 14 || detail.length > 90 || detail.split(/\s+/).length > 15
    || normalizeKey(detail).includes(normalizeKey(name)) || isNoise(detail)) return null;
  return { question: `Which term means “${detail}”?`, answer: name, source: 'reverse' };
}

function subjectOf(fact: string): string | undefined {
  const colon = fact.match(/^([^:：]{2,65})\s*[:：]\s*.{5,}$/);
  if (colon && colon[1].split(/\s+/).length <= 8) return clean(colon[1]);
  const definition = fact.match(/^(.{2,65}?)\s+(?:is|are|means|refers to|describes|represents)\s+.{5,}$/i);
  return definition && definition[1].split(/\s+/).length <= 8 ? clean(definition[1]) : undefined;
}

function questionForFact(value: string, topic: string, source: Card['source'] = 'body'): Card | null {
  const fact = clean(value).replace(/[.;]\s*$/, '');
  if (fact.length < 12 || isNoise(fact)) return null;
  const comparison = fact.match(/^(.{2,45}?)\s+(?:vs\.?|versus)\s+(.{2,45}?)\s*[:—–-]\s*(.{10,})$/i);
  if (comparison) {
    return { question: `How do ${clean(comparison[1])} and ${clean(comparison[2])} differ?`, answer: clean(comparison[3]), source };
  }
  const colon = fact.match(/^([^:：]{2,78})\s*[:：]\s*(.{5,})$/);
  if (colon && colon[1].split(/\s+/).length <= 8 && !/^(?:figure|fig\.?|diagram|image|example|exam tip)$/i.test(colon[1])) {
    const name = clean(colon[1]);
    const detail = clean(colon[2]);
    return { question: `What is ${name}?`, answer: detail, source, cloze: clozeForDefinition(name, detail) };
  }
  const definition = fact.match(/^(.{2,75}?)\s+(is|are|means|refers to|describes|represents|consists of|is defined as)\s+(.{5,})$/i);
  if (definition && definition[1].split(/\s+/).length <= 8 && !/^(?:it|this|that|they|these|those)$/i.test(definition[1])) {
    const name = clean(definition[1]);
    return {
      question: `What ${definition[2].toLowerCase() === 'are' ? 'are' : 'is'} ${name}?`,
      answer: fact, source, cloze: clozeForDefinition(name, clean(definition[3]), definition[2].toLowerCase() === 'are' ? 'are' : 'is'),
    };
  }
  const action = fact.match(/^(.{2,65}?)\s+(absorbs|activates|binds|carries|catalyzes|causes|codes|contains|controls|converts|creates|determines|drives|enables|encodes|forms|generates|includes|increases|inhibits|maintains|measures|produces|protects|provides|reduces|regulates|releases|requires|separates|sends|stores|transfers|transmits|uses)\s+(.{3,})$/i);
  if (action && action[1].split(/\s+/).length <= 7 && !/^(?:it|this|that|they|these|those)$/i.test(action[1])) {
    const verb = action[2].toLowerCase();
    const baseVerb = verb.endsWith('ies') ? `${verb.slice(0, -3)}y` : verb.slice(0, -1);
    return { question: `What does ${initialUpper(action[1])} ${baseVerb}?`, answer: fact, source };
  }
  const pluralAction = fact.match(/^(.{2,65}?)\s+(produce|convert|carry|generate|require|use|contain|release|store|reduce|increase|inhibit|regulate|transfer|bind|create|form|drive)\s+(.{3,})$/i);
  if (pluralAction && pluralAction[1].split(/\s+/).length <= 7 && !/^(?:it|this|that|they|these|those)$/i.test(pluralAction[1])) {
    return { question: `What do ${initialUpper(pluralAction[1])} ${pluralAction[2].toLowerCase()}?`, answer: fact, source };
  }
  if (fact.split(/\s+/).length < 5 || fact.length < 24) return null;
  const lead = fact.split(/\s+/).slice(0, 3).join(' ');
  return { question: `In ${topic}, what is the point about “${lead}”?`, answer: fact, source };
}

function splitFacts(value: string): string[] {
  const numbered = value.replace(/\s+(?=\(?\d{1,2}[.)]\s+[A-Za-z])/g, '; ');
  return numbered
    .split(/;\s*(?=[A-Za-z(\d])|(?<=[.!?])\s+(?=[A-Z][a-z])/)
    .map((part) => clean(part.replace(/^\(?\d{1,2}[.)]\s*/, '')))
    .filter(Boolean);
}

function isInformativeTableCell(value: string): boolean {
  return Boolean(value && (!isNoise(value) || /^[-+]?\d+(?:[./]\d+)?(?:%|x)?$/i.test(value)));
}

function cardsFromParagraphs(lines: Paragraph[], topic: string, source: 'body' | 'notes' = 'body'): Card[] {
  const cards: Card[] = [];
  for (let index = 0; index < lines.length; index++) {
    const value = clean(lines[index].text);
    if (isNoise(value)) continue;
    const inlineQa = value.match(/^(?:Q|Question)\s*[:.)-]\s*(.+?[?!.])\s+(?:A|Answer)\s*[:.)-]\s*(.+)$/i);
    if (inlineQa) {
      cards.push({ question: clean(inlineQa[1]), answer: clean(inlineQa[2]), source });
      continue;
    }
    const q = value.match(/^(?:Q|Question)\s*[:.)-]\s*(.+)$/i);
    if (q) {
      const next = lines[index + 1]?.text.match(/^(?:A|Answer)\s*[:.)-]\s*(.+)$/i);
      if (next) {
        cards.push({ question: clean(q[1]), answer: clean(next[1]), source });
        index++;
      }
      continue;
    }
    if (/^(?:A|Answer)\s*[:.)-]/i.test(value)) continue;
    const following = lines[index + 1];
    const comparisonLead = value.match(/^(.{2,45}?)\s+(?:vs\.?|versus)\s+(.{2,45})$/i);
    if (comparisonLead && following?.level > lines[index].level) {
      const details: string[] = [];
      const parentLevel = lines[index].level;
      while (lines[index + 1]?.level > parentLevel) {
        index++;
        if (!isNoise(lines[index].text)) details.push(clean(lines[index].text));
      }
      if (details.length >= 2) cards.push({
        question: `How do ${clean(comparisonLead[1])} and ${clean(comparisonLead[2])} differ?`,
        answer: details.join('; '), source,
      });
      else if (details.length === 1) {
        const card = questionForFact(details[0], `${topic} (${value})`, source);
        if (card) cards.push(card);
      }
      continue;
    }
    if (value.length <= 65 && !/[.!?;:]$/.test(value) && following
      && following.level > lines[index].level && following.text.length >= 16 && !isNoise(following.text)) {
      const detail = clean(following.text);
      cards.push({ question: `What is ${value}?`, answer: detail, source, cloze: clozeForDefinition(value, detail) });
      const reverse = reverseForDefinition(value, detail);
      if (reverse) cards.push(reverse);
      index++;
      continue;
    }
    const tip = source === 'notes' ? value.match(/^(?:exam tip|remember(?: that)?|key point|important)\s*[:：,]?\s*(.+)$/i) : null;
    if (tip) {
      for (const clause of splitFacts(clean(tip[1]))) {
        if (isNoise(clause) || clause.length < 18) continue;
        const factCard = questionForFact(clause, topic, source);
        cards.push(factCard && !/^In .+, what is the point about /.test(factCard.question)
          ? factCard : { question: `What should you remember about ${topic.replace(/[?!.]+$/, '')}?`, answer: clause, source });
      }
      continue;
    }
    if (/\b(?:vs|versus)\b/i.test(value) && /[:—–-]/.test(value)) {
      const card = questionForFact(value, topic, source);
      if (card) cards.push(card);
      continue;
    }
    let subject: string | undefined;
    for (const clause of splitFacts(value)) {
      const example = clause.match(/^(?:for example|for instance|e\.g\.|example)\s*[,：:]?\s*(.{8,})$/i);
      if (example) {
        const detail = clean(example[1]);
        if (!isNoise(detail)) cards.push({ question: `What is an example of ${subject ?? topic}?`, answer: detail, source });
        continue;
      }
      const card = questionForFact(clause, topic, source);
      if (!card) continue;
      cards.push(card);
      const name = subjectOf(clause);
      if (name) {
        subject = name;
        if (/^What is /.test(card.question)) {
          const reverse = reverseForDefinition(name, card.answer);
          if (reverse && /^([^:：]+)[:：]/.test(clause)) cards.push(reverse);
        }
      }
    }
  }
  return cards;
}

function cardsFromTable(rows: string[][], topic: string): Card[] {
  const useful = rows.map((row) => row.map(clean)).filter((row) => {
    const key = row[0];
    return Boolean(key && !isNoise(key) && row.slice(1).some(isInformativeTableCell));
  });
  if (!useful.length) return [];
  const header = useful[0];
  const hasHeader = /^(?:term|concept|name|type|feature|component|structure|item|process|stage|property|criterion|characteristic|parameter|metric|aspect)$/i.test(header[0] ?? '');
  const body = hasHeader ? useful.slice(1) : useful;
  if (!body.length) return [];
  const comparison = hasHeader && header.length >= 3 && /^(?:feature|property|criterion|characteristic|parameter|metric|aspect)$/i.test(header[0]);
  const cards: Card[] = [];
  for (const row of body) {
    const key = clean(row[0] ?? '');
    if (!key || key.length > 85 || isNoise(key)) continue;
    const values = row.slice(1).map((cell, i) => ({ label: clean(header[i + 1] ?? ''), value: clean(cell) }))
      .filter(({ value }) => isInformativeTableCell(value));
    if (!values.length) continue;
    if (comparison && values.length >= 2) {
      const names = values.map(({ label }) => label).filter(Boolean);
      const joined = names.length === 2 ? names.join(' and ') : names.join(', ');
      cards.push({ question: `How do ${joined} compare in ${key}?`, answer: values.map(({ label, value }) => `${label}: ${value}`).join('; '), source: 'table' });
    } else if (hasHeader && header.length >= 3) {
      for (const { label, value } of values) {
        if (!label || label === key) continue;
        cards.push({ question: `For ${key}, what is ${label.toLowerCase()}?`, answer: value, source: 'table' });
      }
    } else {
      const detail = values[0].value;
      const card: Card = { question: `What is ${key}?`, answer: detail, source: 'table', cloze: clozeForDefinition(key, detail) };
      cards.push(card);
      const reverse = reverseForDefinition(key, detail);
      if (reverse) cards.push(reverse);
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

function stem(word: string): string {
  if (word.length <= 4) return word;
  if (word.endsWith('ies')) return `${word.slice(0, -3)}y`;
  if (word.endsWith('sses')) return word.slice(0, -2);
  if (word.endsWith('ing') && word.length > 6) return word.slice(0, -3);
  if (word.endsWith('ed') && word.length > 5) return word.slice(0, -2);
  if (word.endsWith('s') && !word.endsWith('ss')) return word.slice(0, -1);
  return word;
}

function factTokens(value: string): string[] {
  return normalizeKey(value).split(' ').filter((word) => word && !DEDUP_FILLERS.has(word)).map(stem);
}

/** Compare ordered content tokens: changing a number, negation, or subject keeps a distinct fact. */
function nearDuplicate(a: string, b: string): boolean {
  const one = factTokens(a);
  const two = factTokens(b);
  if (!one.length || !two.length) return false;
  if (one.join(' ') === two.join(' ')) return true;
  if (Math.min(one.length, two.length) < 5) return false;
  const shorter = one.length <= two.length ? one : two;
  const longer = one.length > two.length ? one : two;
  if (longer.length - shorter.length > 1) return false;
  let cursor = 0;
  const extra: string[] = [];
  for (const token of longer) {
    if (token === shorter[cursor]) cursor++;
    else extra.push(token);
  }
  return cursor === shorter.length && extra.length === 1
    && /^(?:also|mainly|primarily|typically|generally)$/.test(extra[0]);
}

function answerWithoutRepeatedTerm(card: Card): string {
  const term = card.question.match(/^What (?:is|are) (.+)\?$/i)?.[1];
  if (!term) return card.answer;
  const answer = clean(card.answer);
  const prefix = new RegExp(`^${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*(?::|is|are|means)\\s+`, 'i');
  return answer.replace(prefix, '');
}

function addUnique(cards: Card[], candidate: Card): boolean {
  const question = clean(candidate.question).replace(/\?*$/, '?');
  const answer = clean(candidate.answer);
  if (!question || (answer.length < 4 && !(candidate.source === 'reverse' && answer.length >= 2)) || isNoise(answer)) return false;
  if (cards.some((existing) => nearDuplicate(existing.question, question)
    && nearDuplicate(answerWithoutRepeatedTerm(existing), answerWithoutRepeatedTerm({ ...candidate, question, answer }))
    && ((!existing.image && !candidate.image) || existing.image?.url === candidate.image?.url))) return false;
  cards.push({ ...candidate, question, answer });
  return true;
}

function escapeMarkdown(value: string): string {
  return value.replace(/[\[\]\\`*_!]/g, '\\$&').replace(/\s+/g, ' ').trim();
}

function isAgenda(title: string, body: string[]): boolean {
  const agendaTitle = /^(?:agenda|outline|overview|table of contents|contents|today(?:'s topics)?|topics|(?:learning )?objectives?|roadmap|course plan)$/i.test(title);
  const items = body.map((line) => line.replace(/^\s*\d+(?:\.\d+)*[.)]?\s*/, '').trim()).filter((line) => !isNoise(line));
  const indexLike = items.length >= 2 && items.every((item) => item.length < 85
    && !/\b(?:is|are|means|because|causes|consists|refers to|produces|requires|converts)\b|[:;]/i.test(item));
  return (agendaTitle && (items.length === 0 || indexLike))
    || (indexLike && body.length >= 3 && body.every((line) => /^\s*\d+(?:\.\d+)*[.)]?\s+/.test(line)));
}

function isEnding(title: string): boolean {
  return /^(?:questions?\??|q\s*&\s*a|thank(?:s| you)(?: for (?:your|listening|watching).*)?|the end|contact(?: information)?|end of presentation)[.!?\s]*$/i.test(title);
}

function isDecorativePicture(picture: PictureShape): boolean {
  return picture.width > 0 && picture.height > 0
    && (picture.width < 300_000 || picture.height < 300_000 || picture.width * picture.height < 250_000 ** 2);
}

function figureCaption(picture: PictureShape, shapes: TextShape[], used: Set<TextShape>): TextShape | undefined {
  const candidates = shapes.filter((shape) => {
    if (used.has(shape) || /^(?:title|ctrTitle)$/i.test(shape.placeholder) || shape.paragraphs.length > 2) return false;
    const label = shape.paragraphs.map((line) => line.text).join(' ');
    if (label.length < 12 || label.length > 190 || isNoise(label)) return false;
    const explicit = /^(?:fig(?:ure)?\.?\s*\d+|diagram\s*\d+|image\s*\d+)\b/i.test(label);
    const below = shape.y >= picture.y && shape.y <= picture.y + picture.height + 2_000_000;
    const overlaps = !picture.width || !shape.width
      || (shape.x < picture.x + picture.width && picture.x < shape.x + shape.width);
    return (below && overlaps) || (explicit && shapes.length <= 3);
  });
  return candidates.sort((a, b) => {
    const score = (shape: TextShape) => {
      const explicit = /^(?:fig(?:ure)?\.?\s*\d+|diagram\s*\d+|image\s*\d+)\b/i.test(shape.paragraphs[0].text);
      const below = Math.max(0, shape.y - picture.y - picture.height);
      return below + (explicit ? -1_000_000 : 0) + (shape.y < picture.y ? 3_000_000 : 0);
    };
    return score(a) - score(b);
  })[0];
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
  const stats: PptxStats = {
    slides: paths.length, skippedSlides: 0, cards: 0, figures: 0, skippedFigures: 0,
    notes: 0, tables: 0, tableCards: 0, notesCards: 0, clozeCount: 0,
    reverseCards: 0, skippedAgenda: 0,
  };
  const sections: string[] = [];
  const allCards: Card[] = [];
  const seenClozes = new Set<string>();
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
    const pictures = shapes.filter((shape): shape is PictureShape => shape.kind === 'picture' && !isDecorativePicture(shape));
    const notesRel = [...rels.values()].find((rel) => rel.type.endsWith('/notesSlide'));
    const notes = noteLines(notesRel ? await xml(zip, notesRel.target) : null);
    if (notes.length) stats.notes++;
    stats.tables += tables.length;

    const agenda = isAgenda(heading, bodyText);
    const ending = isEnding(heading);
    if (!titleChosen && heading && !agenda && !ending) {
      deckTitle = heading;
      titleChosen = true;
    }
    if (agenda && !notes.length && !tables.length) {
      stats.skippedSlides++;
      stats.skippedAgenda++;
      options.onProgress?.({ slide: index + 1, slides: paths.length });
      continue;
    }
    if (ending && !notes.length && !tables.length) {
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
    if (bodyText.length && bodyText.every((line) => isNoise(line) || line.length < 25
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
    const usedCaptions = new Set<TextShape>();
    const usedFigureNotes = new Set<Paragraph>();
    for (const [pictureIndex, picture] of pictures.entries()) {
      const matched = figureCaption(picture, bodyShapes, usedCaptions);
      if (matched) usedCaptions.add(matched);
      const caption = clean(matched?.paragraphs.map((p) => p.text).join(' ') ?? '');
      const captionNumber = caption.match(/^(?:fig(?:ure)?\.?|diagram|image)\s*(\d+)/i)?.[1];
      const expectedNumber = captionNumber ?? (pictures.length > 1 ? String(pictureIndex + 1) : undefined);
      const note = notes.find((line) => !usedFigureNotes.has(line)
        && /^(?:fig(?:ure)?\.?|diagram|image)\s*\d+\b/i.test(line.text)
        && (!expectedNumber || new RegExp(`^\\s*(?:fig(?:ure)?\\.?|diagram|image)\\s*${expectedNumber}\\b`, 'i').test(line.text)));
      if (note) usedFigureNotes.add(note);
      const noteCaption = clean(note?.text ?? '');
      const label = clean(caption || noteCaption || picture.alt);
      const description = [caption, noteCaption, picture.alt].filter((part, i, all) => part && all.indexOf(part) === i).join(' — ');
      if (!label || isNoise(label) || label.length < 12 || description.length < 12) continue;
      const relationship = rels.get(picture.relId);
      const mediaPath = relationship?.type.endsWith('/image') ? relationship.target : null;
      const mime = mediaPath ? rasterMime(mediaPath, mediaTypes) : undefined;
      let url: string | null = null;
      if (mediaPath && mime && zip.file(mediaPath)) {
        const data = await zip.file(mediaPath)!.async('uint8array');
        const available = Math.min(350_000, imageBudget - usedImageChars);
        if (available > 2_000 && (data.length > 500 || caption || noteCaption || picture.alt)) {
          url = await compressedDataUrl(data, mime, available);
        }
      }
      if (url) {
        usedImageChars += url.length;
        stats.figures++;
      } else stats.skippedFigures++;
      const figureName = caption.match(/^(?:fig(?:ure)?\.?|diagram|image)\s*\d+/i)?.[0]
        || noteCaption.match(/^(?:fig(?:ure)?\.?|diagram|image)\s*\d+/i)?.[0]
        || `figure ${pictureIndex + 1}`;
      addUnique(slideCards, {
        question: `What does ${figureName} in ${topic} show?`,
        answer: description,
        source: 'figure',
        image: url ? { alt: label, url } : undefined,
      });
    }
    const bodyLines = bodyShapes
      .filter((shape) => !usedCaptions.has(shape) && (!pictures.length
        || !/^(?:fig(?:ure)?\.?\s*\d+|diagram\s*\d+|image\s*\d+)\b/i.test(shape.paragraphs[0].text)))
      .flatMap((shape) => shape.paragraphs);
    for (const card of cardsFromParagraphs(bodyLines, section)) addUnique(slideCards, card);
    for (const table of tables) for (const card of cardsFromTable(table.rows, topic)) addUnique(slideCards, card);
    for (const card of cardsFromParagraphs(notes.filter((line) => !usedFigureNotes.has(line)), section, 'notes')) addUnique(slideCards, card);

    const uniqueForSection: Card[] = [];
    for (const card of slideCards) {
      if (addUnique(allCards, card)) {
        uniqueForSection.push(card);
        if (card.source === 'table') stats.tableCards++;
        if (card.source === 'notes') stats.notesCards++;
        if (card.source === 'reverse') stats.reverseCards++;
      }
    }
    if (uniqueForSection.length) {
      sections.push(`## ${escapeMarkdown(section)}`);
      for (const card of uniqueForSection) {
        sections.push(`Q: ${escapeMarkdown(card.question)}`);
        sections.push(`A: ${escapeMarkdown(card.answer)}${card.image ? ` ![${clean(card.image.alt).replace(/[\[\]]/g, '')}](${card.image.url})` : ''}`);
        if (card.cloze && stats.clozeCount < 60) {
          const clozeKey = normalizeKey(card.cloze.sentence);
          if (!seenClozes.has(clozeKey)) {
            seenClozes.add(clozeKey);
            const marked = card.cloze.sentence.replace(card.cloze.answer, `{{${card.cloze.answer}}}`);
            sections.push('');
            sections.push(`Cloze: ${escapeMarkdown(marked)}`);
            stats.clozeCount++;
          }
        }
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
