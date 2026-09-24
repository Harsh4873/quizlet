import { useId, type ReactNode } from 'react';
import {
  DiffGridFigure,
  PdaLabelFigure,
  PerfectShuffleFigure,
  PowersGapFigure,
  PumpOneAFigure,
  PumpSplitFigure,
  QPrimeTableFigure,
  SubsetVennFigure,
} from './Diagrams';

export interface MachineNode {
  id: string;
  x: number;
  y: number;
  label: string;
  accept?: boolean;
  note?: string;
  /** Radius; widen it for set labels such as {q0, q1}. */
  r?: number;
}

export interface MachineLink {
  from: string;
  to: string;
  label: string;
  /** Curve the arrow this many px off the straight line. Positive bends up. */
  bend?: number;
}

export interface MachineLoop {
  id: string;
  label: string;
  side?: 'above' | 'below';
}

export interface MachineText {
  x: number;
  y: number;
  text: string;
  anchor?: 'start' | 'middle' | 'end';
  size?: number;
  weight?: number;
}

interface MachineProps {
  aria: string;
  width: number;
  height: number;
  nodes: MachineNode[];
  links?: MachineLink[];
  loops?: MachineLoop[];
  /** One start state, or several when a figure shows two machines. */
  start: string | string[];
  texts?: MachineText[];
}

const LINE = 14;

/** A label split on newlines, stacked so the whole block is centered on (x, y). */
function Label({ x, y, text, size = 12 }: { x: number; y: number; text: string; size?: number }) {
  const lines = text.split('\n');
  const top = y - ((lines.length - 1) * LINE) / 2;
  return (
    <text x={x} y={top} textAnchor="middle" fill="currentColor" fontSize={size} fontWeight="600">
      {lines.map((line, index) => (
        <tspan key={`${index}-${line}`} x={x} dy={index === 0 ? 0 : LINE}>
          {line}
        </tspan>
      ))}
    </text>
  );
}

export function Machine({ aria, width, height, nodes, links = [], loops = [], start, texts = [] }: MachineProps) {
  const rawId = useId().replace(/:/g, '');
  const markerId = `arrow-${rawId}`;
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const starts = new Set(Array.isArray(start) ? start : [start]);
  const radius = (node: MachineNode) => node.r ?? 22;

  return (
    <svg className="machine" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={aria}>
      <defs>
        <marker id={markerId} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" fill="currentColor" />
        </marker>
      </defs>
      {links.map((link) => {
        const a = byId.get(link.from);
        const b = byId.get(link.to);
        if (!a || !b) return null;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const len = Math.hypot(dx, dy) || 1;
        const ux = dx / len;
        const uy = dy / len;
        const x1 = a.x + ux * (radius(a) + 2);
        const y1 = a.y + uy * (radius(a) + 2);
        const x2 = b.x - ux * (radius(b) + 8);
        const y2 = b.y - uy * (radius(b) + 8);
        const bend = link.bend ?? 0;
        const mx = (a.x + b.x) / 2 - uy * bend;
        const my = (a.y + b.y) / 2 + ux * bend;
        const d = bend === 0 ? `M ${x1} ${y1} L ${x2} ${y2}` : `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        let lx = midX;
        let ly = midY;
        if (bend !== 0) {
          const chordX = (a.x + b.x) / 2;
          const chordY = (a.y + b.y) / 2;
          const vx = mx - chordX;
          const vy = my - chordY;
          const vlen = Math.hypot(vx, vy) || 1;
          lx = mx + (vx / vlen) * 16;
          ly = my + (vy / vlen) * 16;
        } else {
          const side = ux > 0.2 ? -1 : 1;
          const lines = link.label.split('\n').length;
          const push = 22 + (lines - 1) * (LINE / 2);
          lx = midX + -uy * push * side;
          ly = midY + ux * push * side;
        }
        return (
          <g key={`${link.from}-${link.to}-${link.label}`}>
            <path d={d} fill="none" stroke="currentColor" strokeWidth="1.6" markerEnd={`url(#${markerId})`} />
            <Label x={lx} y={ly} text={link.label} />
          </g>
        );
      })}
      {loops.map((loop) => {
        const node = byId.get(loop.id);
        if (!node) return null;
        const r = radius(node);
        const above = (loop.side ?? 'below') === 'above';
        const sign = above ? -1 : 1;
        const d = `M ${node.x - 8} ${node.y + sign * (r - 1)}
          C ${node.x - 28} ${node.y + sign * (r + 28)},
            ${node.x + 28} ${node.y + sign * (r + 28)},
            ${node.x + 10} ${node.y + sign * (r - 1)}`;
        const lines = loop.label.split('\n').length;
        const labelY = node.y + sign * (r + 48 + ((lines - 1) * LINE) / 2);
        return (
          <g key={`${loop.id}-${loop.label}`}>
            <path d={d} fill="none" stroke="currentColor" strokeWidth="1.6" markerEnd={`url(#${markerId})`} />
            <Label x={node.x} y={labelY} text={loop.label} />
          </g>
        );
      })}
      {texts.map((item) => (
        <text
          key={`${item.x}-${item.y}-${item.text}`}
          x={item.x}
          y={item.y}
          textAnchor={item.anchor ?? 'middle'}
          fill="currentColor"
          fontSize={item.size ?? 12}
          fontWeight={item.weight ?? 600}
        >
          {item.text}
        </text>
      ))}
      {nodes.map((node) => {
        const isStart = starts.has(node.id);
        const r = radius(node);
        return (
          <g key={node.id}>
            {isStart ? (
              <line
                x1={Math.max(8, node.x - r - 26)}
                y1={node.y}
                x2={node.x - r - 4}
                y2={node.y}
                stroke="currentColor"
                strokeWidth="1.6"
                markerEnd={`url(#${markerId})`}
              />
            ) : null}
            <circle cx={node.x} cy={node.y} r={r} fill="none" stroke="currentColor" strokeWidth="1.8" />
            {node.accept ? (
              <circle cx={node.x} cy={node.y} r={r - 5} fill="none" stroke="currentColor" strokeWidth="1.6" />
            ) : null}
            <text
              x={node.x}
              y={node.y + 4}
              textAnchor="middle"
              fill="currentColor"
              fontSize={node.label.length > 5 ? 11 : 13}
              fontWeight="700"
            >
              {node.label}
            </text>
            {node.note ? (
              <text x={node.x} y={node.y + r + 14} textAnchor="middle" fill="currentColor" fontSize="10">
                {node.note}
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}

export function ExamFigure({ id }: { id: string }) {
  const fig = FIGURES[id];
  if (!fig) return null;
  return <div className="card-figure">{fig}</div>;
}

const e = 'ε → ε';

const FIGURES: Record<string, ReactNode> = {
  'end-1': (
    <Machine
      aria="DFA for strings ending in 1. q0 start, q1 double circle. 1 goes to q1. 0 returns to q0. Each state loops on its own letter."
      width={280}
      height={150}
      start="q0"
      nodes={[
        { id: 'q0', x: 70, y: 70, label: 'q0' },
        { id: 'q1', x: 210, y: 70, label: 'q1', accept: true },
      ]}
      links={[
        { from: 'q0', to: 'q1', label: '1', bend: -18 },
        { from: 'q1', to: 'q0', label: '0', bend: -18 },
      ]}
      loops={[
        { id: 'q0', label: '0', side: 'below' },
        { id: 'q1', label: '1', side: 'below' },
      ]}
    />
  ),
  'end-0': (
    <Machine
      aria="DFA for strings ending in 0. q0 start, q1 double circle. 0 goes to q1. 1 returns to q0."
      width={280}
      height={150}
      start="q0"
      nodes={[
        { id: 'q0', x: 70, y: 70, label: 'q0' },
        { id: 'q1', x: 210, y: 70, label: 'q1', accept: true },
      ]}
      links={[
        { from: 'q0', to: 'q1', label: '0', bend: -18 },
        { from: 'q1', to: 'q0', label: '1', bend: -18 },
      ]}
      loops={[
        { id: 'q0', label: '1', side: 'below' },
        { id: 'q1', label: '0', side: 'below' },
      ]}
    />
  ),
  'one-1': (
    <Machine
      aria="DFA for at least one 1. q0 loops on 0. 1 goes to q1, which is accept and loops on 0 and 1."
      width={280}
      height={150}
      start="q0"
      nodes={[
        { id: 'q0', x: 70, y: 70, label: 'q0' },
        { id: 'q1', x: 210, y: 70, label: 'q1', accept: true },
      ]}
      links={[{ from: 'q0', to: 'q1', label: '1' }]}
      loops={[
        { id: 'q0', label: '0', side: 'below' },
        { id: 'q1', label: '0, 1', side: 'below' },
      ]}
    />
  ),
  'even-ones': (
    <Machine
      aria="DFA for an even number of 1s. q0 is start and accept. 1 flips to q1 and back. 0 loops on both."
      width={280}
      height={150}
      start="q0"
      nodes={[
        { id: 'q0', x: 70, y: 70, label: 'q0', accept: true },
        { id: 'q1', x: 210, y: 70, label: 'q1' },
      ]}
      links={[
        { from: 'q0', to: 'q1', label: '1', bend: -18 },
        { from: 'q1', to: 'q0', label: '1', bend: -18 },
      ]}
      loops={[
        { id: 'q0', label: '0', side: 'below' },
        { id: 'q1', label: '0', side: 'below' },
      ]}
    />
  ),
  'odd-ones': (
    <Machine
      aria="DFA for an odd number of 1s. Same arrows as the even machine. q1 is the double circle instead of q0."
      width={280}
      height={150}
      start="q0"
      nodes={[
        { id: 'q0', x: 70, y: 70, label: 'q0' },
        { id: 'q1', x: 210, y: 70, label: 'q1', accept: true },
      ]}
      links={[
        { from: 'q0', to: 'q1', label: '1', bend: -18 },
        { from: 'q1', to: 'q0', label: '1', bend: -18 },
      ]}
      loops={[
        { id: 'q0', label: '0', side: 'below' },
        { id: 'q1', label: '0', side: 'below' },
      ]}
    />
  ),
  'even-len': (
    <Machine
      aria="DFA for even length. q0 is start and accept. q1 is odd and not accept. Every letter flips."
      width={280}
      height={140}
      start="q0"
      nodes={[
        { id: 'q0', x: 70, y: 60, label: 'q0', accept: true },
        { id: 'q1', x: 210, y: 60, label: 'q1' },
      ]}
      links={[
        { from: 'q0', to: 'q1', label: '0, 1', bend: -16 },
        { from: 'q1', to: 'q0', label: '0, 1', bend: -16 },
      ]}
    />
  ),
  product: (
    <Machine
      aria="Four-state product. q0 even length even ones, start. q2 even length odd ones, accept. 1 moves sideways. 0 moves up and down."
      width={340}
      height={250}
      start="q0"
      nodes={[
        { id: 'q0', x: 90, y: 70, label: 'q0' },
        { id: 'q1', x: 250, y: 70, label: 'q1' },
        { id: 'q3', x: 90, y: 165, label: 'q3' },
        { id: 'q2', x: 250, y: 165, label: 'q2', accept: true },
      ]}
      links={[
        { from: 'q0', to: 'q1', label: '1', bend: -16 },
        { from: 'q1', to: 'q0', label: '1', bend: -16 },
        { from: 'q3', to: 'q2', label: '1', bend: 16 },
        { from: 'q2', to: 'q3', label: '1', bend: 16 },
        { from: 'q0', to: 'q3', label: '0', bend: 16 },
        { from: 'q3', to: 'q0', label: '0', bend: 16 },
        { from: 'q1', to: 'q2', label: '0', bend: -16 },
        { from: 'q2', to: 'q1', label: '0', bend: -16 },
      ]}
    />
  ),
  'nfa-union': (
    <Machine
      aria="NFA union. New start q0 with epsilon into N1 and N2. Each Ni has its own accept state."
      width={340}
      height={180}
      start="q0"
      nodes={[
        { id: 'q0', x: 50, y: 90, label: 'q0' },
        { id: 'n1', x: 170, y: 45, label: 'N1' },
        { id: 'f1', x: 290, y: 45, label: 'F1', accept: true },
        { id: 'n2', x: 170, y: 135, label: 'N2' },
        { id: 'f2', x: 290, y: 135, label: 'F2', accept: true },
      ]}
      links={[
        { from: 'q0', to: 'n1', label: 'ε' },
        { from: 'q0', to: 'n2', label: 'ε' },
        { from: 'n1', to: 'f1', label: '…' },
        { from: 'n2', to: 'f2', label: '…' },
      ]}
    />
  ),
  'pda-3': (
    <Machine
      aria="PDA for at least three 1s. q0 q1 q2 q3. q3 is accept. Forward arrows read 1 and ignore the stack. 0 loops until q3, which loops on 0 and 1."
      width={460}
      height={160}
      start="q0"
      nodes={[
        { id: 'q0', x: 50, y: 55, label: 'q0' },
        { id: 'q1', x: 160, y: 55, label: 'q1' },
        { id: 'q2', x: 270, y: 55, label: 'q2' },
        { id: 'q3', x: 390, y: 55, label: 'q3', accept: true },
      ]}
      links={[
        { from: 'q0', to: 'q1', label: `1, ${e}` },
        { from: 'q1', to: 'q2', label: `1, ${e}` },
        { from: 'q2', to: 'q3', label: `1, ${e}` },
      ]}
      loops={[
        { id: 'q0', label: '0', side: 'below' },
        { id: 'q1', label: '0', side: 'below' },
        { id: 'q2', label: '0', side: 'below' },
        { id: 'q3', label: '0, 1', side: 'below' },
      ]}
    />
  ),
  'pda-ends': (
    <Machine
      aria="PDA for same first and last symbol. Top row started with 0. Bottom row started with 1. q3 and q4 are dead accepts."
      width={420}
      height={300}
      start="q0"
      nodes={[
        { id: 'q0', x: 55, y: 150, label: 'q0' },
        { id: 'q1', x: 190, y: 90, label: 'q1' },
        { id: 'q3', x: 340, y: 90, label: 'q3', accept: true },
        { id: 'q2', x: 190, y: 210, label: 'q2' },
        { id: 'q4', x: 340, y: 210, label: 'q4', accept: true },
      ]}
      links={[
        { from: 'q0', to: 'q1', label: `0, ${e}` },
        { from: 'q0', to: 'q2', label: `1, ${e}` },
        { from: 'q1', to: 'q3', label: `0, ${e}` },
        { from: 'q2', to: 'q4', label: `1, ${e}` },
      ]}
      loops={[
        { id: 'q1', label: '0/1', side: 'above' },
        { id: 'q2', label: '0/1', side: 'below' },
      ]}
    />
  ),
  'pda-odd': (
    <Machine
      aria="PDA for odd length. q0 even start. q1 odd accept. Both 0 and 1 flip either way. Stack unused."
      width={280}
      height={140}
      start="q0"
      nodes={[
        { id: 'q0', x: 70, y: 70, label: 'q0' },
        { id: 'q1', x: 210, y: 70, label: 'q1', accept: true },
      ]}
      links={[
        { from: 'q0', to: 'q1', label: `0/1, ${e}`, bend: -16 },
        { from: 'q1', to: 'q0', label: `0/1, ${e}`, bend: -16 },
      ]}
    />
  ),
  'pda-mid': (
    <Machine
      aria="PDA for odd length with middle 0. Push dollar, push X for each first-half symbol, read a 0 as the middle, pop X for each second-half symbol, pop dollar to accept."
      width={560}
      height={192}
      start="q0"
      nodes={[
        { id: 'q0', x: 70, y: 130, label: 'q0' },
        { id: 'q1', x: 200, y: 130, label: 'q1' },
        { id: 'q2', x: 360, y: 130, label: 'q2' },
        { id: 'q3', x: 500, y: 130, label: 'q3', accept: true },
      ]}
      links={[
        { from: 'q0', to: 'q1', label: 'ε, ε → $' },
        { from: 'q1', to: 'q2', label: `0, ${e}` },
        { from: 'q2', to: 'q3', label: 'ε, $ → ε' },
      ]}
      loops={[
        { id: 'q1', label: '0, ε → X\n1, ε → X', side: 'above' },
        { id: 'q2', label: '0, X → ε\n1, X → ε', side: 'above' },
      ]}
      texts={[{ x: 280, y: 180, text: 'read the middle 0', size: 11 }]}
    />
  ),
  'pda-pal': (
    <Machine
      aria="Palindrome PDA. Push dollar, push each symbol, guess the middle by reading nothing or one symbol, pop only a matching symbol, pop dollar to accept."
      width={560}
      height={192}
      start="q0"
      nodes={[
        { id: 'q0', x: 70, y: 130, label: 'q0' },
        { id: 'q1', x: 200, y: 130, label: 'q1' },
        { id: 'q2', x: 360, y: 130, label: 'q2' },
        { id: 'q3', x: 500, y: 130, label: 'q3', accept: true },
      ]}
      links={[
        { from: 'q0', to: 'q1', label: 'ε, ε → $' },
        { from: 'q1', to: 'q2', label: 'ε, ε → ε\n0, ε → ε\n1, ε → ε' },
        { from: 'q2', to: 'q3', label: 'ε, $ → ε' },
      ]}
      loops={[
        { id: 'q1', label: '0, ε → 0\n1, ε → 1', side: 'above' },
        { id: 'q2', label: '0, 0 → ε\n1, 1 → ε', side: 'above' },
      ]}
      texts={[{ x: 280, y: 180, text: 'middle: ε if even, one symbol if odd', size: 11 }]}
    />
  ),
  'pda-wwr': (
    <Machine
      aria="PDA for w w reverse. Push dollar, push each symbol, guess the middle with an epsilon move only, pop only a matching symbol, pop dollar to accept."
      width={560}
      height={192}
      start="q1"
      nodes={[
        { id: 'q1', x: 70, y: 130, label: 'q1' },
        { id: 'q2', x: 200, y: 130, label: 'q2' },
        { id: 'q3', x: 360, y: 130, label: 'q3' },
        { id: 'q4', x: 500, y: 130, label: 'q4', accept: true },
      ]}
      links={[
        { from: 'q1', to: 'q2', label: 'ε, ε → $' },
        { from: 'q2', to: 'q3', label: 'ε, ε → ε' },
        { from: 'q3', to: 'q4', label: 'ε, $ → ε' },
      ]}
      loops={[
        { id: 'q2', label: '0, ε → 0\n1, ε → 1', side: 'above' },
        { id: 'q3', label: '0, 0 → ε\n1, 1 → ε', side: 'above' },
      ]}
      texts={[{ x: 280, y: 180, text: 'guess the middle', size: 11 }]}
    />
  ),
  'pda-0n1n': (
    <Machine
      aria="Lecture 9 PDA for 0^n 1^n. q1 is start and accept. Push dollar, push a 0 for each 0, pop a 0 for each 1, pop dollar into q4, which accepts."
      width={520}
      height={150}
      start="q1"
      nodes={[
        { id: 'q1', x: 60, y: 105, label: 'q1', accept: true },
        { id: 'q2', x: 190, y: 105, label: 'q2' },
        { id: 'q3', x: 330, y: 105, label: 'q3' },
        { id: 'q4', x: 460, y: 105, label: 'q4', accept: true },
      ]}
      links={[
        { from: 'q1', to: 'q2', label: 'ε, ε → $' },
        { from: 'q2', to: 'q3', label: '1, 0 → ε' },
        { from: 'q3', to: 'q4', label: 'ε, $ → ε' },
      ]}
      loops={[
        { id: 'q2', label: '0, ε → 0', side: 'above' },
        { id: 'q3', label: '1, 0 → ε', side: 'above' },
      ]}
    />
  ),
  'pda-ij-ik': (
    <Machine
      aria="PDA for a^i b^j c^k with i = j or i = k. Push dollar and a marker per a, then guess a branch. Top: pop a marker per b, pop dollar, read c's. Bottom: read b's, pop a marker per c, pop dollar."
      width={585}
      height={330}
      start="q1"
      nodes={[
        { id: 'q1', x: 65, y: 170, label: 'q1' },
        { id: 'q2', x: 175, y: 170, label: 'q2' },
        { id: 'q3', x: 325, y: 90, label: 'q3' },
        { id: 'q4', x: 465, y: 90, label: 'q4', accept: true },
        { id: 'q5', x: 325, y: 250, label: 'q5' },
        { id: 'q6', x: 445, y: 250, label: 'q6' },
        { id: 'q7', x: 555, y: 250, label: 'q7', accept: true },
      ]}
      links={[
        { from: 'q1', to: 'q2', label: 'ε, ε → $' },
        { from: 'q2', to: 'q3', label: 'ε, ε → ε' },
        { from: 'q3', to: 'q4', label: 'ε, $ → ε' },
        { from: 'q2', to: 'q5', label: 'ε, ε → ε' },
        { from: 'q5', to: 'q6', label: 'ε, ε → ε' },
        { from: 'q6', to: 'q7', label: 'ε, $ → ε' },
      ]}
      loops={[
        { id: 'q2', label: 'a, ε → X', side: 'above' },
        { id: 'q3', label: 'b, X → ε', side: 'above' },
        { id: 'q4', label: 'c, ε → ε', side: 'above' },
        { id: 'q5', label: 'b, ε → ε', side: 'below' },
        { id: 'q6', label: 'c, X → ε', side: 'below' },
      ]}
    />
  ),
  'pda-ij-jk': (
    <Machine
      aria="PDA for a^i b^j c^k with i = j or j = k. Guess the branch at the start. Top: push dollar, a marker per a, pop per b, pop dollar, read c's. Bottom: push dollar, skip a's, a marker per b, pop per c, pop dollar."
      width={585}
      height={340}
      start="s"
      nodes={[
        { id: 's', x: 65, y: 170, label: 's' },
        { id: 'p1', x: 175, y: 90, label: 'p1' },
        { id: 'p2', x: 315, y: 90, label: 'p2' },
        { id: 'p3', x: 455, y: 90, label: 'p3', accept: true },
        { id: 't1', x: 175, y: 250, label: 't1' },
        { id: 't2', x: 295, y: 250, label: 't2' },
        { id: 't3', x: 415, y: 250, label: 't3' },
        { id: 't4', x: 535, y: 250, label: 't4', accept: true },
      ]}
      links={[
        { from: 's', to: 'p1', label: 'ε, ε → $' },
        { from: 'p1', to: 'p2', label: 'ε, ε → ε' },
        { from: 'p2', to: 'p3', label: 'ε, $ → ε' },
        { from: 's', to: 't1', label: 'ε, ε → $' },
        { from: 't1', to: 't2', label: 'ε, ε → ε' },
        { from: 't2', to: 't3', label: 'ε, ε → ε' },
        { from: 't3', to: 't4', label: 'ε, $ → ε' },
      ]}
      loops={[
        { id: 'p1', label: 'a, ε → X', side: 'above' },
        { id: 'p2', label: 'b, X → ε', side: 'above' },
        { id: 'p3', label: 'c, ε → ε', side: 'above' },
        { id: 't1', label: 'a, ε → ε', side: 'below' },
        { id: 't2', label: 'b, ε → X', side: 'below' },
        { id: 't3', label: 'c, X → ε', side: 'below' },
      ]}
    />
  ),
  'nfa-ends1': (
    <Machine
      aria="NFA for strings ending in 1. q0 loops on 0 and 1. On 1, q0 can also jump to q1, which accepts and has no arrows out."
      width={300}
      height={150}
      start="q0"
      nodes={[
        { id: 'q0', x: 80, y: 60, label: 'q0' },
        { id: 'q1', x: 230, y: 60, label: 'q1', accept: true, note: 'no arrows out' },
      ]}
      links={[{ from: 'q0', to: 'q1', label: '1' }]}
      loops={[{ id: 'q0', label: '0, 1', side: 'below' }]}
    />
  ),
  'subset-ends1': (
    <Machine
      aria="Top: the NFA for strings ending in 1. Bottom: its subset DFA. {q0} loops on 0 and goes to {q0, q1} on 1. {q0, q1} loops on 1, goes back to {q0} on 0, and accepts because it holds q1."
      width={360}
      height={330}
      start={['n0', 'd0']}
      nodes={[
        { id: 'n0', x: 100, y: 70, label: 'q0' },
        { id: 'n1', x: 240, y: 70, label: 'q1', accept: true },
        { id: 'd0', x: 100, y: 235, label: '{q0}', r: 28 },
        { id: 'd1', x: 262, y: 235, label: '{q0,q1}', r: 34, accept: true },
      ]}
      links={[
        { from: 'n0', to: 'n1', label: '1' },
        { from: 'd0', to: 'd1', label: '1', bend: -16 },
        { from: 'd1', to: 'd0', label: '0', bend: -16 },
      ]}
      loops={[
        { id: 'n0', label: '0, 1', side: 'below' },
        { id: 'd0', label: '0', side: 'below' },
        { id: 'd1', label: '1', side: 'below' },
      ]}
      texts={[
        { x: 20, y: 24, text: 'NFA', anchor: 'start', size: 12.5 },
        { x: 20, y: 184, text: 'subset DFA: each state is a set of NFA states', anchor: 'start', size: 11.5 },
      ]}
    />
  ),
  'union-ab': (
    <Machine
      aria="Union of a machine for {a} and a machine for {b}. New start q0 with epsilon arrows into s1 and s2. s1 reads a into f1. s2 reads b into f2. f1 and f2 accept."
      width={395}
      height={220}
      start="q0"
      nodes={[
        { id: 'q0', x: 70, y: 110, label: 'q0', note: 'new start' },
        { id: 's1', x: 205, y: 50, label: 's1' },
        { id: 'f1', x: 335, y: 50, label: 'f1', accept: true },
        { id: 's2', x: 205, y: 175, label: 's2' },
        { id: 'f2', x: 335, y: 175, label: 'f2', accept: true },
      ]}
      links={[
        { from: 'q0', to: 's1', label: 'ε' },
        { from: 'q0', to: 's2', label: 'ε' },
        { from: 's1', to: 'f1', label: 'a' },
        { from: 's2', to: 'f2', label: 'b' },
      ]}
    />
  ),
  'concat-ab': (
    <Machine
      aria="Concatenation: s1 reads a into f1, which no longer accepts. An epsilon arrow goes from f1 to s2. s2 reads b into f2, which accepts. Accepts only ab."
      width={500}
      height={130}
      start="s1"
      nodes={[
        { id: 's1', x: 70, y: 60, label: 's1' },
        { id: 'f1', x: 190, y: 60, label: 'f1', note: 'no longer accepts' },
        { id: 's2', x: 320, y: 60, label: 's2' },
        { id: 'f2', x: 440, y: 60, label: 'f2', accept: true },
      ]}
      links={[
        { from: 's1', to: 'f1', label: 'a' },
        { from: 'f1', to: 's2', label: 'ε' },
        { from: 's2', to: 'f2', label: 'b' },
      ]}
    />
  ),
  'star-a': (
    <Machine
      aria="Star of {a}: new start q0 accepts and has an epsilon arrow to s1. s1 reads a into f1, which accepts. An epsilon arrow loops from f1 back to s1."
      width={415}
      height={165}
      start="q0"
      nodes={[
        { id: 'q0', x: 70, y: 80, label: 'q0', accept: true, note: 'new start' },
        { id: 's1', x: 200, y: 80, label: 's1' },
        { id: 'f1', x: 335, y: 80, label: 'f1', accept: true },
      ]}
      links={[
        { from: 'q0', to: 's1', label: 'ε' },
        { from: 's1', to: 'f1', label: 'a' },
        { from: 'f1', to: 's1', label: 'ε', bend: -42 },
      ]}
    />
  ),
  'pump-loop': (
    <Machine
      aria="Pumping lemma proof picture. x leads from the start to a repeated state q. y is a loop from q back to q. z leads from q to the accept state f."
      width={440}
      height={195}
      start="s"
      nodes={[
        { id: 's', x: 60, y: 120, label: 's' },
        { id: 'q', x: 220, y: 120, label: 'q', note: 'the first repeated state' },
        { id: 'f', x: 380, y: 120, label: 'f', accept: true },
      ]}
      links={[
        { from: 's', to: 'q', label: 'x' },
        { from: 'q', to: 'f', label: 'z' },
      ]}
      loops={[{ id: 'q', label: 'y', side: 'above' }]}
      texts={[
        { x: 220, y: 22, text: 'p = number of states, so p symbols visit p + 1 states', size: 11.5 },
        { x: 220, y: 188, text: 'go around the loop i times: x yⁱ z still ends at f', size: 11.5 },
      ]}
    />
  ),
  'dfa-same-ends': (
    <Machine
      aria="DFA for strings that start and end with the same symbol. From s, 0 goes to the top row and 1 to the bottom row. In each row, the double circle means the last symbol matches the first."
      width={420}
      height={300}
      start="s"
      nodes={[
        { id: 's', x: 70, y: 150, label: 's' },
        { id: 'a', x: 200, y: 85, label: 'a', accept: true },
        { id: 'b', x: 340, y: 85, label: 'b' },
        { id: 'c', x: 200, y: 215, label: 'c', accept: true },
        { id: 'd', x: 340, y: 215, label: 'd' },
      ]}
      links={[
        { from: 's', to: 'a', label: '0' },
        { from: 's', to: 'c', label: '1' },
        { from: 'a', to: 'b', label: '1', bend: -14 },
        { from: 'b', to: 'a', label: '0', bend: -14 },
        { from: 'c', to: 'd', label: '0', bend: 14 },
        { from: 'd', to: 'c', label: '1', bend: 14 },
      ]}
      loops={[
        { id: 'a', label: '0', side: 'above' },
        { id: 'b', label: '1', side: 'above' },
        { id: 'c', label: '1', side: 'below' },
        { id: 'd', label: '0', side: 'below' },
      ]}
    />
  ),
  'shuffle-turn': (
    <Machine
      aria="Perfect shuffle DFA idea. The state remembers whose turn it is. On A's turn a symbol moves A's part and passes the turn to B. On B's turn it moves B's part and passes the turn back."
      width={380}
      height={190}
      start="A"
      nodes={[
        { id: 'A', x: 90, y: 95, label: 'A', note: 'A’s turn' },
        { id: 'B', x: 290, y: 95, label: 'B', note: 'B’s turn' },
      ]}
      links={[
        { from: 'A', to: 'B', label: 'symbol c: move p', bend: -20 },
        { from: 'B', to: 'A', label: 'symbol c: move q', bend: -20 },
      ]}
      texts={[
        { x: 190, y: 20, text: 'state = (p, q, whose turn)', size: 12 },
        { x: 190, y: 180, text: 'accept on A’s turn when p ∈ FA and q ∈ FB', size: 11.5 },
      ]}
    />
  ),
  'quotient-ab': (
    <Machine
      aria="Top: DFA for L = {ab}: s0 reads a into m, m reads b into f, f accepts. Bottom: the same DFA for L/b = {a}: now m accepts, because reading b from m lands in the old accept state."
      width={470}
      height={250}
      start={['s0', 't0']}
      nodes={[
        { id: 's0', x: 60, y: 60, label: 's0' },
        { id: 'm', x: 190, y: 60, label: 'm' },
        { id: 'f', x: 320, y: 60, label: 'f', accept: true },
        { id: 't0', x: 60, y: 185, label: 's0' },
        { id: 'm2', x: 190, y: 185, label: 'm', accept: true },
        { id: 'f2', x: 320, y: 185, label: 'f' },
      ]}
      links={[
        { from: 's0', to: 'm', label: 'a' },
        { from: 'm', to: 'f', label: 'b' },
        { from: 't0', to: 'm2', label: 'a' },
        { from: 'm2', to: 'f2', label: 'b' },
      ]}
      texts={[
        { x: 362, y: 64, text: 'L = {ab}', anchor: 'start', size: 13 },
        { x: 362, y: 189, text: 'L/b = {a}', anchor: 'start', size: 13 },
        { x: 190, y: 240, text: 'm reads b into the old accept state, so m accepts now', size: 11.5 },
      ]}
    />
  ),
  'dfa-mod3': (
    <Machine
      aria="DFA for unary strings whose length is a multiple of 3. Three states in a cycle on a. r0 is start and accept."
      width={300}
      height={235}
      start="r0"
      nodes={[
        { id: 'r0', x: 70, y: 115, label: 'r0', accept: true },
        { id: 'r1', x: 220, y: 50, label: 'r1' },
        { id: 'r2', x: 220, y: 180, label: 'r2' },
      ]}
      links={[
        { from: 'r0', to: 'r1', label: 'a' },
        { from: 'r1', to: 'r2', label: 'a' },
        { from: 'r2', to: 'r0', label: 'a' },
      ]}
      texts={[{ x: 150, y: 228, text: 'state = length mod 3', size: 11.5 }]}
    />
  ),
  'dfa-div3': (
    <Machine
      aria="DFA for binary numbers divisible by 3, read left to right. States are remainders r0, r1, r2. Reading bit b from remainder r goes to 2r plus b mod 3. r0 is start and accept."
      width={420}
      height={190}
      start="r0"
      nodes={[
        { id: 'r0', x: 70, y: 70, label: 'r0', accept: true },
        { id: 'r1', x: 210, y: 70, label: 'r1' },
        { id: 'r2', x: 350, y: 70, label: 'r2' },
      ]}
      links={[
        { from: 'r0', to: 'r1', label: '1', bend: -16 },
        { from: 'r1', to: 'r0', label: '1', bend: -16 },
        { from: 'r1', to: 'r2', label: '0', bend: -16 },
        { from: 'r2', to: 'r1', label: '0', bend: -16 },
      ]}
      loops={[
        { id: 'r0', label: '0', side: 'below' },
        { id: 'r2', label: '1', side: 'below' },
      ]}
      texts={[{ x: 210, y: 182, text: 'reading bit b from remainder r goes to (2r + b) mod 3', size: 11.5 }]}
    />
  ),
  'drop-copies': (
    <Machine
      aria="DROP for A = {ab}. Copy 1 on top means nothing is dropped yet; copy 2 below means one letter was dropped. Free epsilon moves go from s1 to m2, skipping a, and from m1 to f2, skipping b. Only f2 accepts. It accepts a and b and rejects ab."
      width={560}
      height={265}
      start="s1"
      nodes={[
        { id: 's1', x: 70, y: 60, label: 's1' },
        { id: 'm1', x: 200, y: 60, label: 'm1' },
        { id: 'f1', x: 330, y: 60, label: 'f1' },
        { id: 's2', x: 70, y: 190, label: 's2' },
        { id: 'm2', x: 200, y: 190, label: 'm2' },
        { id: 'f2', x: 330, y: 190, label: 'f2', accept: true },
      ]}
      links={[
        { from: 's1', to: 'm1', label: 'a' },
        { from: 'm1', to: 'f1', label: 'b' },
        { from: 's2', to: 'm2', label: 'a' },
        { from: 'm2', to: 'f2', label: 'b' },
        { from: 's1', to: 'm2', label: 'ε, skip a' },
        { from: 'm1', to: 'f2', label: 'ε, skip b' },
      ]}
      texts={[
        { x: 372, y: 64, text: 'copy 1: nothing dropped yet', anchor: 'start', size: 12 },
        { x: 372, y: 194, text: 'copy 2: one letter dropped', anchor: 'start', size: 12 },
        { x: 200, y: 254, text: 'A = {ab}: accepts a and b, rejects ab', size: 12 },
      ]}
    />
  ),
  'q-prime-table': <QPrimeTableFigure />,
  'pda-label': <PdaLabelFigure />,
  'perfect-shuffle': <PerfectShuffleFigure />,
  'pump-split': <PumpSplitFigure />,
  'pump-one-a': <PumpOneAFigure />,
  'powers-gap': <PowersGapFigure />,
  'diff-grid': <DiffGridFigure />,
  'subset-venn': <SubsetVennFigure />,
  'dfa-empty': (
    <Machine
      aria="DFA for the empty language. Start q0 is not accept. No arrows, so every string dies, including epsilon."
      width={180}
      height={110}
      start="q0"
      nodes={[{ id: 'q0', x: 90, y: 55, label: 'q0' }]}
    />
  ),
  'dfa-eps': (
    <Machine
      aria="DFA for the language whose only string is epsilon. q0 is start and accept. Any real symbol goes to q1, a rejecting sink."
      width={280}
      height={150}
      start="q0"
      nodes={[
        { id: 'q0', x: 70, y: 70, label: 'q0', accept: true },
        { id: 'q1', x: 210, y: 70, label: 'q1', note: 'sink' },
      ]}
      links={[
        { from: 'q0', to: 'q1', label: '0, 1' },
      ]}
      loops={[{ id: 'q1', label: '0, 1', side: 'below' }]}
    />
  ),
  'pda-empty': (
    <Machine
      aria="Empty-set PDA. One start state q0, not accept, no arrows out."
      width={180}
      height={110}
      start="q0"
      nodes={[{ id: 'q0', x: 90, y: 55, label: 'q0' }]}
    />
  ),
};

export const FIGURE_IDS: readonly string[] = Object.keys(FIGURES);
