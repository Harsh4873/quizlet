import { useId, type ReactNode } from 'react';

export interface MachineNode {
  id: string;
  x: number;
  y: number;
  label: string;
  accept?: boolean;
  note?: string;
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

interface MachineProps {
  aria: string;
  width: number;
  height: number;
  nodes: MachineNode[];
  links?: MachineLink[];
  loops?: MachineLoop[];
  start: string;
}

export function Machine({ aria, width, height, nodes, links = [], loops = [], start }: MachineProps) {
  const rawId = useId().replace(/:/g, '');
  const markerId = `arrow-${rawId}`;
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const r = 22;

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
        const x1 = a.x + ux * (r + 2);
        const y1 = a.y + uy * (r + 2);
        const x2 = b.x - ux * (r + 8);
        const y2 = b.y - uy * (r + 8);
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
          lx = midX + -uy * 22 * side;
          ly = midY + ux * 22 * side;
        }
        return (
          <g key={`${link.from}-${link.to}-${link.label}`}>
            <path d={d} fill="none" stroke="currentColor" strokeWidth="1.6" markerEnd={`url(#${markerId})`} />
            <text x={lx} y={ly} textAnchor="middle" fill="currentColor" fontSize="12" fontWeight="600">
              {link.label}
            </text>
          </g>
        );
      })}
      {loops.map((loop) => {
        const node = byId.get(loop.id);
        if (!node) return null;
        const above = (loop.side ?? 'below') === 'above';
        const sign = above ? -1 : 1;
        const d = `M ${node.x - 8} ${node.y + sign * (r - 1)}
          C ${node.x - 28} ${node.y + sign * (r + 28)},
            ${node.x + 28} ${node.y + sign * (r + 28)},
            ${node.x + 10} ${node.y + sign * (r - 1)}`;
        return (
          <g key={`${loop.id}-${loop.label}`}>
            <path d={d} fill="none" stroke="currentColor" strokeWidth="1.6" markerEnd={`url(#${markerId})`} />
            <text
              x={node.x}
              y={node.y + sign * (r + 48)}
              textAnchor="middle"
              fill="currentColor"
              fontSize="12"
              fontWeight="600"
            >
              {loop.label}
            </text>
          </g>
        );
      })}
      {nodes.map((node) => {
        const isStart = node.id === start;
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
            <text x={node.x} y={node.y + 4} textAnchor="middle" fill="currentColor" fontSize="13" fontWeight="700">
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
      aria="PDA for odd length with middle 0. Push dollar, push X on the first half, read 0 as the middle, pop X, pop dollar to accept."
      width={520}
      height={210}
      start="q0"
      nodes={[
        { id: 'q0', x: 70, y: 130, label: 'q0' },
        { id: 'q1', x: 190, y: 130, label: 'q1' },
        { id: 'q2', x: 320, y: 130, label: 'q2' },
        { id: 'q3', x: 450, y: 130, label: 'q3', accept: true },
      ]}
      links={[
        { from: 'q0', to: 'q1', label: 'ε, ε → $' },
        { from: 'q1', to: 'q2', label: `0, ${e}` },
        { from: 'q2', to: 'q3', label: 'ε, $ → ε' },
      ]}
      loops={[
        { id: 'q1', label: 'push X', side: 'above' },
        { id: 'q2', label: 'pop X', side: 'above' },
      ]}
    />
  ),
  'pda-pal': (
    <Machine
      aria="Palindrome PDA. Push dollar, push the real letters, guess the middle, pop only a match, pop dollar to accept."
      width={520}
      height={220}
      start="q0"
      nodes={[
        { id: 'q0', x: 70, y: 140, label: 'q0' },
        { id: 'q1', x: 190, y: 140, label: 'q1' },
        { id: 'q2', x: 330, y: 140, label: 'q2' },
        { id: 'q3', x: 450, y: 140, label: 'q3', accept: true },
      ]}
      links={[
        { from: 'q0', to: 'q1', label: 'ε, ε → $' },
        { from: 'q1', to: 'q2', label: 'guess mid' },
        { from: 'q2', to: 'q3', label: 'ε, $ → ε' },
      ]}
      loops={[
        { id: 'q1', label: 'push', side: 'above' },
        { id: 'q2', label: 'match', side: 'above' },
      ]}
    />
  ),
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
