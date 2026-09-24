/** Card diagrams that are not state machines: letter rows, grids, and number lines. */

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
