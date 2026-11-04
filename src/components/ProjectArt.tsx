// Иллюстрации, нарисованные кодом: рендер комплекса и стадии стройки. Растровых картинок нет.
const GREEN = "#1f4d3a";

function Pine({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-2} y={-6} width={4} height={10} fill="#3b3a2c" />
      <path d="M0 -62 L16 -28 H8 L20 -4 H-20 L-8 -28 H-16 Z" fill="#1c4433" />
    </g>
  );
}

function Tower({ x, w, h, floors, ground, built = 1 }: { x: number; w: number; h: number; floors: number; ground: number; built?: number }) {
  const bh = h * built;
  const rows = Math.max(1, Math.round(floors * built));
  return (
    <g>
      <rect x={x} y={ground - bh} width={w} height={bh} fill={built < 1 ? "#cfd3cb" : "#f7f8f4"} stroke="#121512" strokeWidth={1} />
      {Array.from({ length: rows }).map((_, r) =>
        Array.from({ length: Math.floor(w / 14) }).map((__, c) => (
          <rect key={`${r}-${c}`} x={x + 6 + c * 14} y={ground - bh + 8 + r * (h / floors)} width={8} height={Math.max(4, h / floors - 8)}
            fill={built < 1 ? "none" : "#7aa7bd"} stroke={built < 1 ? "#9aa09a" : "none"} strokeWidth={0.8} />
        ))
      )}
      {built < 1 && <path d={`M${x + w} ${ground - bh} l12 -20 M${x + w + 12} ${ground - bh - 20} h-30`} stroke="#e0a83a" strokeWidth={2} fill="none" />}
    </g>
  );
}

export function HeroArt() {
  return (
    <svg viewBox="0 0 800 440" role="img" aria-label="Рендер жилого комплекса «Северный парк»: три корпуса среди сосен" style={{ width: "100%", height: "auto", display: "block" }} preserveAspectRatio="xMidYMax slice">
      <defs>
        <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#e3ecd9" />
          <stop offset="1" stopColor="#f4f5f2" />
        </linearGradient>
      </defs>
      <rect width={800} height={440} fill="url(#sky)" />
      <circle cx={660} cy={80} r={42} fill="#d7f171" />
      <path d="M0 330 Q200 290 400 320 T800 300 V440 H0Z" fill="#9fb98f" />
      {[20, 60, 100, 150, 700, 745, 785].map((x, i) => <Pine key={x} x={x} y={330 + (i % 3) * 6} s={1.1 + (i % 3) * 0.25} />)}
      <Tower x={190} w={126} h={190} floors={10} ground={350} />
      <Tower x={340} w={126} h={250} floors={12} ground={350} />
      <Tower x={490} w={126} h={280} floors={13} ground={350} />
      <rect y={350} width={800} height={90} fill={GREEN} />
      <rect y={350} width={800} height={6} fill="#d7f171" />
      {[240, 400, 560, 330, 480].map((x, i) => <Pine key={x} x={x} y={400 + (i % 2) * 18} s={0.8 + (i % 2) * 0.3} />)}
    </svg>
  );
}

/** Стройка в процентах готовности: растёт «каркас» корпусов. */
export function StageArt({ percent, label }: { percent: number[]; label: string }) {
  const hs = [190, 250, 280];
  return (
    <svg viewBox="0 0 640 300" role="img" aria-label={label} style={{ width: "100%", height: "auto", display: "block" }}>
      <rect width={640} height={300} fill="#eef1e8" />
      <rect y={250} width={640} height={50} fill="#8b9486" />
      {[0, 1, 2].map((i) => (
        <Tower key={i} x={70 + i * 190} w={110} h={hs[i] * 0.78} floors={[10, 12, 13][i]} ground={250} built={Math.max(0.08, percent[i] / 100)} />
      ))}
      <Pine x={25} y={254} s={0.9} />
      <Pine x={620} y={254} s={0.9} />
    </svg>
  );
}
