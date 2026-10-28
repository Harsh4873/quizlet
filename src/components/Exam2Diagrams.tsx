import type { ReactNode } from 'react';

function Frame({ label, height, children }: { label: string; height: number; children: ReactNode }) {
  return <svg className="machine" viewBox={`0 0 420 ${height}`} role="img" aria-label={label}>
    <g fill="currentColor" fontFamily="system-ui, sans-serif" fontSize="14">{children}</g>
  </svg>;
}

function Tape({ y, symbols, heads }: { y: number; symbols: string[]; heads: number[] }) {
  const size = 36;
  const x = (420 - symbols.length * size) / 2;
  return <g>
    {symbols.map((symbol, i) => <g key={i}>
      <rect x={x + i * size} y={y} width={size} height={34} fill="none" stroke="currentColor" opacity={0.6} />
      <text x={x + i * size + size / 2} y={y + 24} textAnchor="middle" fontSize="18">{symbol}</text>
      {heads.includes(i) && <circle cx={x + i * size + size / 2} cy={y - 6} r={3.5} />}
    </g>)}
  </g>;
}

const line = (x1: number, y1: number, x2: number, y2: number) =>
  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth={1.5} />;

export const EXAM_2_FIGURES: Record<string, ReactNode> = {
  'exam2-multitape': <Frame height={174} label="Two simulated tapes stored on one physical tape, separated by hash marks. Dots above cells record the two simulated head positions; one physical head visits them in turn.">
    <text x={210} y={21} textAnchor="middle" fontWeight="700">One physical tape stores both tapes</text>
    <text x={174} y={48} textAnchor="middle">tape 1</text>
    <text x={282} y={48} textAnchor="middle">tape 2</text>
    <Tape y={65} symbols={['#', '0', '1', '□', '#', '□', '#']} heads={[1, 5]} />
    <text x={210} y={125} textAnchor="middle">Dot = remembered head position</text>
    <text x={210} y={151} textAnchor="middle">Scan → collect symbols → update → repeat</text>
  </Frame>,
  'exam2-multitape-step': <Frame height={230} label="Lecture two-tape rule: read 0 and 1, write x and 1, move left and right. Before: hash 1 marked-0 hash marked-1 0 hash. After: hash marked-1 x hash 1 marked-0 hash.">
    <text x={210} y={22} textAnchor="middle" fontWeight="700">Read (0, 1) → write (x, 1); move (L, R)</text>
    <text x={35} y={48}>Before</text>
    <Tape y={64} symbols={['#', '1', '0', '#', '1', '0', '#']} heads={[2, 4]} />
    <text x={35} y={130}>After</text>
    <Tape y={145} symbols={['#', '1', 'x', '#', '1', '0', '#']} heads={[1, 5]} />
    <text x={210} y={212} textAnchor="middle">Dots move; only the first tape writes x.</text>
  </Frame>,
  'exam2-ntm': <Frame height={197} label="One input has three possible computation branches: reject, loop, and accept. The NTM accepts because an accepting branch exists. Breadth-first exploration is not trapped in the looping branch.">
    <text x={210} y={22} textAnchor="middle" fontWeight="700">Same input, different allowed choices</text>
    <circle cx={210} cy={52} r={9} fill="none" stroke="currentColor" />
    {line(204, 59, 70, 113)}{line(210, 61, 210, 113)}{line(216, 59, 350, 113)}
    <text x={70} y={135} textAnchor="middle">REJECT</text>
    <text x={210} y={135} textAnchor="middle">LOOP …</text>
    <text x={350} y={135} textAnchor="middle" fontWeight="800">ACCEPT</text>
    <text x={210} y={164} textAnchor="middle">One accepting path is enough.</text>
    <text x={210} y={186} textAnchor="middle">Explore by depth; never wait forever on one path.</text>
  </Frame>,
  'exam2-halting': <Frame height={215} label="Assume H decides halting. Machine S asks whether M halts on its own encoding. If H says yes, S loops. If H says no, S accepts and halts. Taking M equal to S contradicts either answer.">
    <text x={210} y={22} textAnchor="middle" fontWeight="700">S on ⟨M⟩ asks the assumed decider H:</text>
    <rect x={58} y={38} width={304} height={43} fill="none" stroke="currentColor" />
    <text x={210} y={65} textAnchor="middle">Does M halt on ⟨M⟩?</text>
    {line(145, 81, 100, 119)}{line(275, 81, 320, 119)}
    <text x={96} y={140} textAnchor="middle">YES → LOOP</text>
    <text x={320} y={140} textAnchor="middle">NO → HALT</text>
    <text x={210} y={176} textAnchor="middle" fontWeight="700">Now use M = S.</text>
    <text x={210} y={201} textAnchor="middle">Either prediction becomes false.</text>
  </Frame>,
  'exam2-counting': <Frame height={211} label="Characteristic sequence illustration. Rows L1, L2, L3 are hypothetical listed languages; columns s1, s2, s3 are strings. Circle diagonal bits 0, 0, 1. The missing language D has flipped bits 1, 1, 0, and differs from every row on its own diagonal position.">
    <text x={210} y={21} textAnchor="middle" fontWeight="700">1 = string belongs; 0 = it does not</text>
    {['s₁', 's₂', 's₃', '…'].map((s, j) => <text key={s} x={150 + j * 62} y={49} textAnchor="middle">{s}</text>)}
    {[[0, 0, 1], [1, 0, 1], [1, 1, 1]].map((row, i) => <g key={i}>
      <text x={65} y={79 + i * 29}>{['L₁', 'L₂', 'L₃'][i]}</text>
      {row.map((n, j) => <g key={j}>
        {i === j && <circle cx={150 + j * 62} cy={74 + i * 29} r={12} fill="none" stroke="currentColor" />}
        <text x={150 + j * 62} y={79 + i * 29} textAnchor="middle">{n}</text>
      </g>)}
      <text x={336} y={79 + i * 29} textAnchor="middle">…</text>
    </g>)}
    {line(54, 150, 366, 150)}
    <text x={65} y={174} fontWeight="700">D</text>
    {[1, 1, 0, '…'].map((n, j) => <text key={j} x={150 + j * 62} y={174} textAnchor="middle" fontWeight="700">{n}</text>)}
    <text x={210} y={201} textAnchor="middle">Continue flipping along the entire infinite list.</text>
  </Frame>,
  'exam2-cfl-tree': <Frame height={230} label="Parse-tree pumping schematic. The start variable generates u, an upper R subtree, and z. The upper R generates v, a lower R subtree, and y. The lower R generates x. Repeating the upper-to-lower R section adds v and y together.">
    <text x={210} y={20} textAnchor="middle" fontWeight="700">Same variable R occurs twice on one path</text>
    <text x={210} y={49} textAnchor="middle">Start</text>
    {line(194, 55, 40, 167)}{line(210, 55, 210, 77)}{line(226, 55, 380, 167)}
    <text x={210} y={93} textAnchor="middle" fontWeight="800">R</text>
    {line(202, 99, 120, 167)}{line(210, 99, 210, 118)}{line(218, 99, 300, 167)}
    <text x={210} y={135} textAnchor="middle" fontWeight="800">R</text>
    {line(210, 141, 210, 167)}
    {['u', 'v', 'x', 'y', 'z'].map((s, i) => <text key={s} x={[40, 120, 210, 300, 380][i]} y={185} textAnchor="middle" fontSize={18}>{s}</text>)}
    <text x={210} y={216} textAnchor="middle">Keep u, x, z; repeat v and y together.</text>
  </Frame>,
  'exam2-cfl-blocks': <Frame height={177} label="The witness a to the p, b to the p, c to the p has three blocks. A window vxy of at most p symbols cannot reach both the a block and the c block. Deleting v and y changes at least one count and leaves a block untouched at p.">
    <text x={210} y={22} textAnchor="middle" fontWeight="700">s = aᵖ bᵖ cᵖ</text>
    {['aᵖ', 'bᵖ', 'cᵖ'].map((s, i) => <g key={s}>
      <rect x={30 + 120 * i} y={40} width={120} height={42} fill="none" stroke="currentColor" />
      <text x={90 + 120 * i} y={69} textAnchor="middle" fontSize={20}>{s}</text>
    </g>)}
    {line(215, 91, 325, 91)}{line(215, 87, 215, 98)}{line(325, 87, 325, 98)}
    <text x={270} y={119} textAnchor="middle">example vxy window</text>
    <text x={210} y={145} textAnchor="middle">Length ≤ p: cannot touch all three blocks.</text>
    <text x={210} y={168} textAnchor="middle">Pump down: one count drops, another stays p.</text>
  </Frame>,
};
