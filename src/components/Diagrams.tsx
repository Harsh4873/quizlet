/** Card diagrams that are not state machines: letter rows, grids, number lines, and tuple sheets. */

import type { ReactNode } from 'react';

interface TupleRow {
  part: string;
  lines: string[];
  note?: string;
}

const SHEET_WIDTH = 400;

/** One tuple, one part per row, the way it is written on an exam. */
function TupleSheet({ aria, header, rows, footer }: { aria: string; header: string[]; rows: TupleRow[]; footer?: string }) {
  const lineH = 18;
  const noteH = 16;
  const pad = 9;
  const headerH = header.length * 17 + 14;
  const heights = rows.map((row) => pad * 2 + row.lines.length * lineH + (row.note ? noteH : 0));
  const tops: number[] = [];
  let y = headerH;
  for (const h of heights) {
    tops.push(y);
    y += h;
  }
  const bottom = y;
  const total = bottom + (footer ? 26 : 8);
  return (
    <svg className="machine tuple-sheet" viewBox={`0 0 ${SHEET_WIDTH} ${total}`} role="img" aria-label={aria}>
      {header.map((line, i) => (
        <text key={line} x={14} y={20 + i * 17} fill="currentColor" fontSize="12.5" fontWeight="800">
          {line}
        </text>
      ))}
      <line x1={10} x2={SHEET_WIDTH - 10} y1={headerH} y2={headerH} stroke="currentColor" strokeWidth={1.6} />
      {rows.map((row, i) => {
        const top = tops[i];
        const first = top + pad + 13;
        return (
          <g key={row.part}>
            <text x={16} y={first} fill="currentColor" fontSize="16" fontWeight="800">
              {row.part}
            </text>
            {row.lines.map((line, j) => (
              <text key={line} x={66} y={first + j * lineH} fill="currentColor" fontSize="13" fontWeight="600">
                {line}
              </text>
            ))}
            {row.note ? (
              <text x={66} y={first + (row.lines.length - 1) * lineH + noteH} fill="currentColor" fontSize="11.5" opacity={0.72}>
                {row.note}
              </text>
            ) : null}
            <line x1={10} x2={SHEET_WIDTH - 10} y1={top + heights[i]} y2={top + heights[i]} stroke="currentColor" strokeWidth={0.8} opacity={0.4} />
          </g>
        );
      })}
      {footer ? (
        <text x={14} y={bottom + 18} fill="currentColor" fontSize="11.5" opacity={0.72}>
          {footer}
        </text>
      ) : null}
    </svg>
  );
}

const SAME_SIGMA: TupleRow = { part: 'Σ', lines: ['the same alphabet Σ'] };

export const TUPLE_SHEETS: Record<string, ReactNode> = {
  'tuple-dfa': (
    <TupleSheet
      aria="The even-number-of-1s DFA as a 5-tuple. Q is q0 and q1. Sigma is 0 and 1. Delta: 0 stays, 1 flips. Start q0. F is q0."
      header={['Even number of 1s DFA', 'M = (Q, Σ, δ, q0, F)']}
      rows={[
        { part: 'Q', lines: ['Q = {q0, q1}'], note: 'q0: even number of 1s so far, q1: odd' },
        { part: 'Σ', lines: ['Σ = {0, 1}'] },
        { part: 'δ', lines: ['δ(q0, 0) = q0', 'δ(q0, 1) = q1', 'δ(q1, 0) = q1', 'δ(q1, 1) = q0'], note: '0 keeps the count, 1 flips it' },
        { part: 'q0', lines: ['start = q0'] },
        { part: 'F', lines: ['F = {q0}'], note: 'an even number of 1s, including ε' },
      ]}
    />
  ),
  'tuple-subset': (
    <TupleSheet
      aria="NFA to DFA 5-tuple. Q prime is the power set of Q. Same Sigma. Delta prime of R and a collects E of delta of r and a for every r in R. Start is E of q0. F prime is every set that meets F."
      header={['Given NFA N = (Q, Σ, δ, q0, F)', 'Build DFA D = (Q′, Σ, δ′, q0′, F′)']}
      rows={[
        { part: 'Q′', lines: ['Q′ = P(Q)'], note: 'every set of N’s states' },
        SAME_SIGMA,
        { part: 'δ′', lines: ['δ′(R, a) = {q : q ∈ E(δ(r, a))', 'for some r ∈ R}'], note: 'move every state in R on a, then take ε-moves' },
        { part: 'q0′', lines: ['q0′ = E({q0})'], note: 'the start plus its free ε-moves' },
        { part: 'F′', lines: ['F′ = {R ∈ Q′ : R ∩ F ≠ ∅}'], note: 'any set that holds an accept state' },
      ]}
      footer="E(S) = S plus everything reachable by ε-arrows"
    />
  ),
  'tuple-product': (
    <TupleSheet
      aria="Product DFA 5-tuple. Q is Q1 times Q2. Same Sigma. Delta moves both parts. Start is the pair of starts. F depends on union, intersection, or A minus B."
      header={['Given DFAs M1 = (Q1, Σ, δ1, q1, F1)', 'and M2 = (Q2, Σ, δ2, q2, F2). Build M = (Q, Σ, δ, q0, F)']}
      rows={[
        { part: 'Q', lines: ['Q = Q1 × Q2'], note: 'a pair: where each machine is' },
        SAME_SIGMA,
        { part: 'δ', lines: ['δ((r1, r2), a) = (δ1(r1, a), δ2(r2, a))'], note: 'both parts move on every letter' },
        { part: 'q0', lines: ['q0 = (q1, q2)'] },
        { part: 'F', lines: ['union: r1 ∈ F1 or r2 ∈ F2', 'intersection: F1 × F2', 'A − B: F1 × (Q2 − F2)'], note: 'only F changes between the three' },
      ]}
    />
  ),
  'tuple-union': (
    <TupleSheet
      aria="Union NFA 5-tuple. Q is a new start plus Q1 and Q2. Same Sigma. The new start has epsilon moves to q1 and q2. F is F1 union F2."
      header={['Given NFAs N1 = (Q1, Σ, δ1, q1, F1)', 'and N2 = (Q2, Σ, δ2, q2, F2). Build N = (Q, Σ, δ, q0, F)']}
      rows={[
        { part: 'Q', lines: ['Q = {q0} ∪ Q1 ∪ Q2'], note: 'one new start state q0' },
        SAME_SIGMA,
        { part: 'δ', lines: ['δ(q0, ε) = {q1, q2}', 'δ(q, a) = δ1(q, a) for q in Q1', 'δ(q, a) = δ2(q, a) for q in Q2'], note: 'q0 reads no real letter; nothing else changes' },
        { part: 'q0', lines: ['start = the new q0'] },
        { part: 'F', lines: ['F = F1 ∪ F2'] },
      ]}
    />
  ),
  'tuple-concat': (
    <TupleSheet
      aria="Concatenation NFA 5-tuple. Q is Q1 union Q2. Same Sigma. Each accept state of N1 gets an epsilon move to q2. Start is q1. F is F2."
      header={['Given NFAs N1 = (Q1, Σ, δ1, q1, F1)', 'and N2 = (Q2, Σ, δ2, q2, F2). Build N = (Q, Σ, δ, q1, F2)']}
      rows={[
        { part: 'Q', lines: ['Q = Q1 ∪ Q2'], note: 'no new states' },
        SAME_SIGMA,
        { part: 'δ', lines: ['δ(q, ε) = δ1(q, ε) ∪ {q2} for q in F1', 'otherwise δ1 on Q1 and δ2 on Q2'], note: 'each accept of N1 gets a free move into q2' },
        { part: 'q0', lines: ['start = q1'], note: 'N1’s start' },
        { part: 'F', lines: ['F = F2'], note: 'only N2’s accept states' },
      ]}
    />
  ),
  'tuple-star': (
    <TupleSheet
      aria="Star NFA 5-tuple. Q is a new start plus Q1. Same Sigma. The new start has an epsilon move to q1, and each accept state gets an epsilon move back to q1. F is the new start plus F1."
      header={['Given NFA N1 = (Q1, Σ, δ1, q1, F1)', 'Build N = (Q, Σ, δ, q0, F)']}
      rows={[
        { part: 'Q', lines: ['Q = {q0} ∪ Q1'], note: 'one new start state q0' },
        SAME_SIGMA,
        { part: 'δ', lines: ['δ(q0, ε) = {q1}', 'δ(q, ε) = δ1(q, ε) ∪ {q1} for q in F1', 'otherwise δ1'], note: 'every accept loops back to the old start' },
        { part: 'q0', lines: ['start = the new q0'] },
        { part: 'F', lines: ['F = {q0} ∪ F1'], note: 'the new start accepts, so ε is in' },
      ]}
    />
  ),
  'tuple-shuffle': (
    <TupleSheet
      aria="Perfect shuffle 5-tuple. Q is QA times QB times A or B. Same Sigma. Delta moves the machine whose turn it is and passes the turn. Start is both starts on A's turn. F is FA times FB on A's turn."
      header={['Given DFAs MA = (QA, Σ, δA, sA, FA)', 'and MB = (QB, Σ, δB, sB, FB). Build M = (Q, Σ, δ, q0, F)']}
      rows={[
        { part: 'Q', lines: ['Q = QA × QB × {A, B}'], note: 'where each machine is, plus whose turn it is' },
        SAME_SIGMA,
        { part: 'δ', lines: ['δ((p, q, A), c) = (δA(p, c), q, B)', 'δ((p, q, B), c) = (p, δB(q, c), A)'], note: 'move the machine whose turn it is, pass the turn' },
        { part: 'q0', lines: ['q0 = (sA, sB, A)'], note: 'both starts, A goes first' },
        { part: 'F', lines: ['F = FA × FB × {A}'], note: 'both accept, and it is A’s turn again' },
      ]}
    />
  ),
  'tuple-drop': (
    <TupleSheet
      aria="DROP NFA 5-tuple. Q prime is Q times 1 or 2. Same Sigma. Read normally in either copy; one epsilon move from copy 1 to copy 2 skips a letter. Start is q0 in copy 1. F prime is F in copy 2."
      header={['Given DFA M = (Q, Σ, δ, q0, F) for A', 'Build NFA N = (Q′, Σ, δ′, q0′, F′)']}
      rows={[
        { part: 'Q′', lines: ['Q′ = Q × {1, 2}'], note: 'copy 1: nothing dropped yet, copy 2: one dropped' },
        SAME_SIGMA,
        { part: 'δ′', lines: ['δ′((q, i), a) = {(δ(q, a), i)}', 'δ′((q, 1), ε) = {(δ(q, b), 2) : b ∈ Σ}'], note: 'read normally; one free move skips a letter' },
        { part: 'q0′', lines: ['q0′ = (q0, 1)'], note: 'start in copy 1' },
        { part: 'F′', lines: ['F′ = F × {2}'], note: 'accept only in copy 2' },
      ]}
    />
  ),
  'tuple-pda': (
    <TupleSheet
      aria="The 0 to the n 1 to the n PDA as a 6-tuple. Q is q1 to q4. Sigma is 0 and 1. Gamma is 0 and dollar. Five delta entries; every other entry is empty. Start q1. F is q1 and q4."
      header={['The 0ⁿ1ⁿ PDA from lecture 9', 'P = (Q, Σ, Γ, δ, q0, F)']}
      rows={[
        { part: 'Q', lines: ['Q = {q1, q2, q3, q4}'] },
        { part: 'Σ', lines: ['Σ = {0, 1}'], note: 'input alphabet' },
        { part: 'Γ', lines: ['Γ = {0, $}'], note: 'stack alphabet' },
        {
          part: 'δ',
          lines: ['δ(q1, ε, ε) = {(q2, $)}', 'δ(q2, 0, ε) = {(q2, 0)}', 'δ(q2, 1, 0) = {(q3, ε)}', 'δ(q3, 1, 0) = {(q3, ε)}', 'δ(q3, ε, $) = {(q4, ε)}'],
          note: 'every other entry is ∅',
        },
        { part: 'q0', lines: ['start = q1'] },
        { part: 'F', lines: ['F = {q1, q4}'], note: 'q1 accepts, so ε is in' },
      ]}
    />
  ),
};

const BOX = 30;
const STEP = 36;

interface RowProps {
  x: number;
  y: number;
  letters: string;
  /** Indexes drawn heavier, such as the pumped piece y. */
  strong?: number[];
  /** Indexes drawn dashed, such as letters that came from the second string. */
  dashed?: number[];
}

function LetterRow({ x, y, letters, strong = [], dashed = [] }: RowProps) {
  return (
    <g>
      {[...letters].map((ch, i) => (
        <g key={`${i}-${ch}`}>
          <rect
            x={x + i * STEP}
            y={y}
            width={BOX}
            height={BOX}
            rx={5}
            fill="none"
            stroke="currentColor"
            strokeWidth={strong.includes(i) ? 3 : 1.6}
            strokeDasharray={dashed.includes(i) ? '4 3' : undefined}
          />
          <text x={x + i * STEP + BOX / 2} y={y + 21} textAnchor="middle" fill="currentColor" fontSize="16" fontWeight="700">
            {ch}
          </text>
        </g>
      ))}
    </g>
  );
}

/** Shaded band behind the first `count` boxes of a row: the part a legal y must sit in. */
function Window({ x, y, count, label }: { x: number; y: number; count: number; label: string }) {
  const width = count * STEP - (STEP - BOX) + 8;
  return (
    <g>
      <rect x={x - 4} y={y - 4} width={width} height={BOX + 8} rx={7} fill="currentColor" opacity={0.12} />
      <text x={x - 4} y={y - 10} fill="currentColor" fontSize="12" fontWeight="600">
        {label}
      </text>
    </g>
  );
}

function Bracket({ x1, x2, y, label }: { x1: number; x2: number; y: number; label: string }) {
  return (
    <g>
      <path d={`M ${x1} ${y - 5} L ${x1} ${y} L ${x2} ${y} L ${x2} ${y - 5}`} fill="none" stroke="currentColor" strokeWidth={1.4} />
      <text x={(x1 + x2) / 2} y={y + 16} textAnchor="middle" fill="currentColor" fontSize="14" fontWeight="700">
        {label}
      </text>
    </g>
  );
}

function Arrowhead({ id }: { id: string }) {
  return (
    <defs>
      <marker id={id} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8 Z" fill="currentColor" />
      </marker>
    </defs>
  );
}

export function PdaLabelFigure() {
  const tokens: [string, number, string][] = [
    ['1', 170, 'read'],
    ['A', 212, 'pop'],
    ['B', 262, 'push'],
  ];
  return (
    <svg className="machine" viewBox="0 0 420 130" role="img" aria-label="PDA arrow labeled 1, A to B. Read 1 from the input, pop A off the stack, push B onto the stack.">
      <Arrowhead id="pda-label-arrow" />
      {tokens.map(([, x, note]) => (
        <g key={note}>
          <text x={x} y={22} textAnchor="middle" fill="currentColor" fontSize="12" fontWeight="600">
            {note}
          </text>
          <line x1={x} y1={28} x2={x} y2={40} stroke="currentColor" strokeWidth={1.2} />
        </g>
      ))}
      <text x={170} y={62} textAnchor="middle" fill="currentColor" fontSize="19" fontWeight="700">
        1
      </text>
      <text x={184} y={62} textAnchor="middle" fill="currentColor" fontSize="19" fontWeight="700">
        ,
      </text>
      <text x={212} y={62} textAnchor="middle" fill="currentColor" fontSize="19" fontWeight="700">
        A
      </text>
      <text x={237} y={62} textAnchor="middle" fill="currentColor" fontSize="19" fontWeight="700">
        →
      </text>
      <text x={262} y={62} textAnchor="middle" fill="currentColor" fontSize="19" fontWeight="700">
        B
      </text>
      <circle cx={60} cy={92} r={22} fill="none" stroke="currentColor" strokeWidth={1.8} />
      <text x={60} y={96} textAnchor="middle" fill="currentColor" fontSize="13" fontWeight="700">
        p
      </text>
      <circle cx={360} cy={92} r={22} fill="none" stroke="currentColor" strokeWidth={1.8} />
      <text x={360} y={96} textAnchor="middle" fill="currentColor" fontSize="13" fontWeight="700">
        q
      </text>
      <line x1={84} y1={92} x2={330} y2={92} stroke="currentColor" strokeWidth={1.6} markerEnd="url(#pda-label-arrow)" />
    </svg>
  );
}

export function PerfectShuffleFigure() {
  const left = 70;
  const slot = (i: number) => left + i * 46;
  const a = ['a', 'b', 'c'];
  const b = ['x', 'y', 'z'];
  return (
    <svg className="machine" viewBox="0 0 360 215" role="img" aria-label="Perfect shuffle: abc from A and xyz from B zip into axbycz. Letters from A land in the odd spots and letters from B in the even spots.">
      <Arrowhead id="shuffle-arrow" />
      <text x={20} y={40} fill="currentColor" fontSize="13" fontWeight="700">A</text>
      <text x={20} y={116} fill="currentColor" fontSize="13" fontWeight="700">zip</text>
      <text x={20} y={192} fill="currentColor" fontSize="13" fontWeight="700">B</text>
      {a.map((ch, i) => (
        <g key={`a-${ch}`}>
          <LetterRow x={slot(2 * i)} y={20} letters={ch} />
          <line x1={slot(2 * i) + BOX / 2} y1={52} x2={slot(2 * i) + BOX / 2} y2={88} stroke="currentColor" strokeWidth={1.4} markerEnd="url(#shuffle-arrow)" />
        </g>
      ))}
      {b.map((ch, i) => (
        <g key={`b-${ch}`}>
          <LetterRow x={slot(2 * i + 1)} y={172} letters={ch} dashed={[0]} />
          <line x1={slot(2 * i + 1) + BOX / 2} y1={170} x2={slot(2 * i + 1) + BOX / 2} y2={134} stroke="currentColor" strokeWidth={1.4} markerEnd="url(#shuffle-arrow)" />
        </g>
      ))}
      {['a', 'x', 'b', 'y', 'c', 'z'].map((ch, i) => (
        <LetterRow key={`m-${ch}`} x={slot(i)} y={96} letters={ch} dashed={i % 2 === 1 ? [0] : []} />
      ))}
    </svg>
  );
}

export function PumpSplitFigure() {
  const x0 = 40;
  const at = (i: number) => x0 + i * STEP;
  return (
    <svg className="machine" viewBox="0 0 420 225" role="img" aria-label="s = 00001111 with p = 4. The first four letters are shaded. x = 000, y = the fourth 0, z = 1111. Pumping to i = 2 gives five 0s and four 1s, which is out.">
      <Window x={x0} y={36} count={4} label="the first p = 4 letters: y has to be in here" />
      <LetterRow x={x0} y={36} letters="00001111" strong={[3]} />
      <Bracket x1={at(0)} x2={at(2) + BOX} y={78} label="x" />
      <Bracket x1={at(3)} x2={at(3) + BOX} y={78} label="y" />
      <Bracket x1={at(4)} x2={at(7) + BOX} y={78} label="z" />
      <text x={x0} y={134} fill="currentColor" fontSize="12" fontWeight="600">
        i = 2: copy y once
      </text>
      <LetterRow x={x0} y={142} letters="000001111" strong={[3, 4]} />
      <text x={x0} y={200} fill="currentColor" fontSize="12.5" fontWeight="700">
        five 0s, four 1s: out, so this cut fails for 0ⁿ1ⁿ
      </text>
    </svg>
  );
}

export function PumpOneAFigure() {
  const x0 = 30;
  return (
    <svg className="machine" viewBox="0 0 360 235" role="img" aria-label="s = abbbccc with p = 3. Every legal y sits in abb. Copying a b gives abbbbccc, four b's and three c's, out. Deleting the a gives bbbccc, no a, out.">
      <Window x={x0} y={32} count={3} label="s = a bᵖ cᵖ, first p = 3 letters shaded" />
      <LetterRow x={x0} y={32} letters="abbbccc" />
      <text x={x0} y={98} fill="currentColor" fontSize="12" fontWeight="600">
        y is only b's: copy it. 4 b's, 3 c's, out
      </text>
      <LetterRow x={x0} y={106} letters="abbbbccc" strong={[4]} />
      <text x={x0} y={172} fill="currentColor" fontSize="12" fontWeight="600">
        y holds the a: delete it. No a, out
      </text>
      <LetterRow x={x0} y={180} letters="bbbccc" />
    </svg>
  );
}

export function PowersGapFigure() {
  return (
    <svg className="machine" viewBox="0 0 460 150" role="img" aria-label="Number line. 2 to the p, then 2 to the p plus t just after it, then 2 to the p plus 1 far to the right. No power of two sits strictly between 2 to the p and 2 to the p plus 1.">
      <Arrowhead id="gap-arrow" />
      <rect x={110} y={70} width={260} height={20} fill="currentColor" opacity={0.12} />
      <text x={240} y={62} textAnchor="middle" fill="currentColor" fontSize="12.5" fontWeight="600">
        no power of 2 in here
      </text>
      <line x1={30} y1={90} x2={430} y2={90} stroke="currentColor" strokeWidth={1.6} markerEnd="url(#gap-arrow)" />
      <line x1={110} y1={82} x2={110} y2={98} stroke="currentColor" strokeWidth={2} />
      <line x1={370} y1={82} x2={370} y2={98} stroke="currentColor" strokeWidth={2} />
      <text x={110} y={116} textAnchor="middle" fill="currentColor" fontSize="13" fontWeight="700">2ᵖ</text>
      <text x={370} y={116} textAnchor="middle" fill="currentColor" fontSize="13" fontWeight="700">2ᵖ⁺¹</text>
      <circle cx={165} cy={90} r={5} fill="currentColor" />
      <text x={165} y={140} textAnchor="middle" fill="currentColor" fontSize="12.5" fontWeight="600">
        pumped length 2ᵖ + t, with t ≤ p
      </text>
    </svg>
  );
}

export function DiffGridFigure() {
  const cells: [number, number, string, boolean][] = [
    [0, 0, 'reject', false],
    [1, 0, 'accept', true],
    [0, 1, 'reject', false],
    [1, 1, 'reject', false],
  ];
  const cx = (col: number) => 140 + col * 100;
  const cy = (row: number) => 58 + row * 60;
  return (
    <svg className="machine" viewBox="0 0 360 190" role="img" aria-label="Product state for A minus B. Accept only when the A part accepts and the B part rejects.">
      <text x={190} y={18} textAnchor="middle" fill="currentColor" fontSize="12.5" fontWeight="600">
        product state (p, q): accept A − B when
      </text>
      <text x={190} y={46} textAnchor="middle" fill="currentColor" fontSize="12" fontWeight="600">B accepts</text>
      <text x={290} y={46} textAnchor="middle" fill="currentColor" fontSize="12" fontWeight="600">B rejects</text>
      <text x={128} y={94} textAnchor="end" fill="currentColor" fontSize="12" fontWeight="600">A accepts</text>
      <text x={128} y={154} textAnchor="end" fill="currentColor" fontSize="12" fontWeight="600">A rejects</text>
      {cells.map(([col, row, word, yes]) => (
        <g key={`${col}-${row}`}>
          <rect
            x={cx(col)}
            y={cy(row)}
            width={100}
            height={60}
            fill={yes ? 'currentColor' : 'none'}
            fillOpacity={yes ? 0.14 : 0}
            stroke="currentColor"
            strokeWidth={yes ? 2.6 : 1.4}
          />
          <text x={cx(col) + 50} y={cy(row) + 35} textAnchor="middle" fill="currentColor" fontSize={yes ? 15 : 13} fontWeight={yes ? 800 : 500}>
            {word}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function QPrimeTableFigure() {
  const rows: [string, string][] = [
    ['Product, A − B', 'a pair: where A’s machine is, where B’s machine is'],
    ['Perfect shuffle', 'that pair, plus whose turn it is'],
    ['DROP', 'where the old machine is, plus whether the free move is used'],
    ['Subset (NFA → DFA)', 'the set of places the NFA could be'],
  ];
  const top = 14;
  const rowH = 36;
  const split = 160;
  const width = 540;
  return (
    <svg className="machine" viewBox={`0 0 ${width} ${top + rowH * 5 + 10}`} role="img" aria-label="Table: what Q prime remembers. Product, A minus B: a pair. Perfect shuffle: the pair plus whose turn it is. DROP: where the old machine is plus whether the free move is used. Subset: the set of places the NFA could be.">
      <rect x={10} y={top} width={width - 20} height={rowH} fill="currentColor" opacity={0.1} />
      <text x={20} y={top + 23} fill="currentColor" fontSize="13" fontWeight="800">Construction</text>
      <text x={split + 10} y={top + 23} fill="currentColor" fontSize="13" fontWeight="800">What Q′ remembers</text>
      {rows.map(([name, memory], i) => (
        <g key={name}>
          <text x={20} y={top + rowH * (i + 1) + 23} fill="currentColor" fontSize="12.5" fontWeight="700">{name}</text>
          <text x={split + 10} y={top + rowH * (i + 1) + 23} fill="currentColor" fontSize="12.5" fontWeight="500">{memory}</text>
        </g>
      ))}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <line key={i} x1={10} x2={width - 10} y1={top + rowH * i} y2={top + rowH * i} stroke="currentColor" strokeWidth={i === 0 || i === 5 ? 1.6 : 0.8} />
      ))}
      <line x1={split} x2={split} y1={top} y2={top + rowH * 5} stroke="currentColor" strokeWidth={0.8} />
    </svg>
  );
}

export function SubsetVennFigure() {
  return (
    <svg className="machine" viewBox="0 0 360 200" role="img" aria-label="A big box for sigma star, which is regular. Inside it, an oval for 0 to the n 1 to the n, which is not regular.">
      <rect x={20} y={20} width={320} height={160} rx={16} fill="none" stroke="currentColor" strokeWidth={1.8} />
      <text x={38} y={46} fill="currentColor" fontSize="13" fontWeight="700">Σ∗, regular</text>
      <ellipse cx={200} cy={116} rx={110} ry={44} fill="currentColor" fillOpacity={0.12} stroke="currentColor" strokeWidth={1.8} />
      <text x={200} y={112} textAnchor="middle" fill="currentColor" fontSize="13" fontWeight="700">{'{0ⁿ1ⁿ}'}</text>
      <text x={200} y={130} textAnchor="middle" fill="currentColor" fontSize="12" fontWeight="600">not regular</text>
    </svg>
  );
}
