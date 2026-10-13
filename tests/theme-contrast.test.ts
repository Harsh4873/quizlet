import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

function channel(hex: string, offset: number): number {
  const value = parseInt(hex.slice(offset, offset + 2), 16) / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  return 0.2126 * channel(hex, 1) + 0.7152 * channel(hex, 3) + 0.0722 * channel(hex, 5);
}

function contrast(foreground: string, background: string): number {
  const lighter = Math.max(luminance(foreground), luminance(background));
  const darker = Math.min(luminance(foreground), luminance(background));
  return (lighter + 0.05) / (darker + 0.05);
}

function blend(foreground: string, background: string, alpha: number): string {
  const rgb = (hex: string) => [1, 3, 5].map((offset) => parseInt(hex.slice(offset, offset + 2), 16));
  const fg = rgb(foreground);
  const bg = rgb(background);
  const mixed = fg.map((channel, index) => Math.round(channel * alpha + bg[index] * (1 - alpha)));
  return `#${mixed.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`;
}

const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
const lightRoot = css.slice(css.indexOf(':root {'), css.indexOf(':root[data-theme'));

function token(name: string): string {
  const match = lightRoot.match(new RegExp(`${name}:\\s*(#[0-9a-fA-F]{6})`));
  if (!match) throw new Error(`missing ${name}`);
  return match[1];
}

describe('light theme contrast', () => {
  it('keeps muted, green, and amber text at least 4.5:1', () => {
    const bg = token('--bg');
    const panel = token('--panel');
    expect(contrast(token('--muted'), bg)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(token('--muted'), panel)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(token('--muted'), token('--panel-2'))).toBeGreaterThanOrEqual(4.5);
    expect(contrast(token('--green'), panel)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(token('--green'), blend(token('--green'), panel, 0.12))).toBeGreaterThanOrEqual(4.5);
    // Got it and a correct quiz option use the green tint over the page, not the panel.
    expect(contrast(token('--green'), blend(token('--green'), bg, 0.12))).toBeGreaterThanOrEqual(4.5);
    expect(contrast(token('--amber'), panel)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(token('--amber'), blend(token('--amber'), bg, 0.12))).toBeGreaterThanOrEqual(4.5);
    // Still learning and a wrong option use the red tint over the page. Errors are red on the page.
    expect(contrast(token('--red'), bg)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(token('--red'), blend(token('--red'), bg, 0.1))).toBeGreaterThanOrEqual(4.5);
    expect(contrast(token('--red'), blend(token('--red'), panel, 0.1))).toBeGreaterThanOrEqual(4.5);
    expect(contrast('#ffffff', token('--red'))).toBeGreaterThanOrEqual(4.5);
    // The card back fades into the accent tint. The section label is muted text.
    expect(contrast(token('--muted'), blend(token('--accent'), bg, 0.12))).toBeGreaterThanOrEqual(4.5);
  });
});
