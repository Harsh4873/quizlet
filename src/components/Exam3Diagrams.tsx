import type { ReactNode } from 'react';

function Diagram({ label, height, children }: { label: string; height: number; children: ReactNode }) {
  return (
    <svg className="machine" viewBox={`0 0 380 ${height}`} role="img" aria-label={label}>
      <g fill="currentColor" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="15">
        {children}
      </g>
    </svg>
  );
}

function Dot({ x, y, name, picked = false }: { x: number; y: number; name: string; picked?: boolean }) {
  return (
    <g>
      <circle cx={x} cy={y} r="15" stroke="currentColor" strokeWidth="2" fill={picked ? 'currentColor' : 'var(--panel)'} />
      <text x={x} y={y + 5} fontWeight="700" fill={picked ? 'var(--panel)' : 'currentColor'}>{name}</text>
    </g>
  );
}

export const EXAM_3_FIGURES: Record<string, ReactNode> = {
  'exam3-cover-path': (
    <Diagram height={124} label="Path A–B–C–D. The filled dots A and D are picked. Each unpicked dot touches a picked dot, but the middle edge B–C has two unpicked ends.">
      <path d="M43 55 H337" stroke="currentColor" strokeWidth="2" />
      <Dot x={43} y={55} name="A" picked />
      <Dot x={141} y={55} name="B" />
      <Dot x={239} y={55} name="C" />
      <Dot x={337} y={55} name="D" picked />
      <text x="43" y="25">picked</text>
      <text x="337" y="25">picked</text>
      <path d="M160 70 v7 h60 v-7" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <text x="190" y="102">B–C has no picked endpoint.</text>
    </Diagram>
  ),
  'exam3-triangle': (
    <Diagram height={157} label="Original edge A–B on the left. On the right, keep A–B and add one new vertex X with edges A–X and B–X. The construction has not selected any dots.">
      <text x="75" y="23">Original edge</text>
      <path d="M32 91 H118" stroke="currentColor" strokeWidth="2" />
      <Dot x={32} y={91} name="A" />
      <Dot x={118} y={91} name="B" />
      <path d="M152 84 h33 m-8 -6 8 6 -8 6" fill="none" stroke="currentColor" strokeWidth="2" />
      <text x="287" y="23">Add one tip</text>
      <path d="M224 109 L287 55 L350 109" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M224 109 H350" stroke="currentColor" strokeWidth="3" />
      <Dot x={224} y={109} name="A" />
      <Dot x={350} y={109} name="B" />
      <Dot x={287} y={55} name="X" />
      <text x="287" y="146">Keep A–B</text>
    </Diagram>
  ),
  'exam3-midpoint': (
    <Diagram height={113} label="Configuration u reaches midpoint m within half the move budget. That same midpoint m reaches configuration v within the remaining half. Both checks must succeed.">
      <text x="104" y="24">≤ t/2 moves</text>
      <text x="276" y="24">≤ t/2 moves</text>
      <path d="M46 53 h117 m-8 -6 8 6 -8 6 M213 53 h117 m-8 -6 8 6 -8 6" stroke="currentColor" strokeWidth="2" fill="none" />
      <Dot x={26} y={53} name="u" />
      <Dot x={190} y={53} name="m" />
      <Dot x={354} y={53} name="v" />
      <text x="190" y="96">Both halves use this same m.</text>
    </Diagram>
  ),
};
