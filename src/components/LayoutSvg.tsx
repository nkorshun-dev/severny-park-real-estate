import type { Layout, RoomKind, RoomRect, Side } from "@/data/layouts";
import { formatArea } from "@/lib/format";

const FILL: Record<RoomKind, string> = {
  studio: "#eef3e4", living: "#eef3e4", bed: "#f3efe4", kitchen: "#f6ecd6",
  bath: "#dfeaf0", hall: "#ecedea", wardrobe: "#e6e8e2",
};
const U = 10; // 1 м = 10 единиц SVG
const WALL = "#121512";

function Door({ r, side }: { r: RoomRect; side: Side }) {
  const d = Math.min(8, (side === "t" || side === "b" ? r.w : r.h) * U - 4);
  const x = r.x * U, y = r.y * U, w = r.w * U, h = r.h * U;
  // позиция двери вдоль стены: у края комнаты, чтобы не упираться в окно
  let gap: [number, number, number, number], leaf: string;
  if (side === "b" || side === "t") {
    const cx = x + (side === "b" ? w / 2 - d / 2 : 3);
    const wy = side === "b" ? y + h : y;
    gap = [cx, wy - 1.4, d, 2.8];
    leaf = side === "b"
      ? `M${cx} ${wy} v${-d} A${d} ${d} 0 0 1 ${cx + d} ${wy}`
      : `M${cx} ${wy} v${d} A${d} ${d} 0 0 0 ${cx + d} ${wy}`;
  } else {
    const cy = y + h / 2 - d / 2;
    const wx = side === "r" ? x + w : x;
    gap = [wx - 1.4, cy, 2.8, d];
    leaf = side === "r"
      ? `M${wx} ${cy} h${-d} A${d} ${d} 0 0 0 ${wx} ${cy + d}`
      : `M${wx} ${cy} h${d} A${d} ${d} 0 0 1 ${wx} ${cy + d}`;
  }
  return (
    <g>
      <rect x={gap[0]} y={gap[1]} width={gap[2]} height={gap[3]} fill="#fff" />
      <path d={leaf} fill="none" stroke={WALL} strokeWidth={0.8} />
    </g>
  );
}

function Win({ r, side }: { r: RoomRect; side: Side }) {
  const x = r.x * U, y = r.y * U, w = r.w * U, h = r.h * U;
  const horizontal = side === "t" || side === "b";
  const len = Math.min((horizontal ? w : h) * 0.6, 34);
  const props = horizontal
    ? { x: x + (w - len) / 2, y: (side === "t" ? y : y + h) - 1.8, width: len, height: 3.6 }
    : { x: (side === "l" ? x : x + w) - 1.8, y: y + (h - len) / 2, width: 3.6, height: len };
  return <rect {...props} fill="#9fd0e6" stroke={WALL} strokeWidth={0.8} />;
}

export function LayoutSvg({ layout, labels = "full", title }: {
  layout: Layout; labels?: "full" | "area" | "none"; title?: string;
}) {
  const bd = (layout.balcony === "loggia" ? 13 : 10);
  const pad = 8;
  const W = layout.width * U, H = layout.height * U;
  const vb = `${-pad} ${-pad - bd} ${W + pad * 2} ${H + pad * 2 + bd}`;
  const fs = labels === "full" ? 3.8 : 4.2;
  return (
    <svg viewBox={vb} role="img" aria-label={title ?? `Планировка: ${layout.name}, ${formatArea(layout.area)}`} style={{ width: "100%", height: "auto", display: "block" }}>
      {/* балкон / лоджия */}
      <rect
        x={layout.balconyX * U} y={-bd} width={layout.balconyW * U} height={bd}
        fill={layout.balcony === "loggia" ? "#e9ece6" : "#f4f5f2"} stroke={WALL}
        strokeWidth={layout.balcony === "loggia" ? 2.4 : 1.2} strokeDasharray={layout.balcony === "loggia" ? undefined : "3 2"}
      />
      {labels !== "none" && (
        <text x={(layout.balconyX + layout.balconyW / 2) * U} y={-bd / 2 + 1.5} textAnchor="middle" fontSize={3.4} fill="#626862">
          {layout.balcony === "loggia" ? "лоджия" : "балкон"}
        </text>
      )}
      {layout.rects.map((r, i) => (
        <g key={i}>
          <rect x={r.x * U} y={r.y * U} width={r.w * U} height={r.h * U} fill={FILL[r.kind]} stroke={WALL} strokeWidth={1} />
          {labels !== "none" && r.w * r.h > 3 && (
            <text textAnchor="middle" fill={WALL}>
              {labels === "full" && (
                <tspan x={(r.x + r.w / 2) * U} y={(r.y + r.h / 2) * U - 1} fontSize={fs} fontWeight={700}>{r.w < 2.2 ? r.name.slice(0, 5) + "." : r.name}</tspan>
              )}
              <tspan x={(r.x + r.w / 2) * U} y={(r.y + r.h / 2) * U + (labels === "full" ? 4.6 : 1.5)} fontSize={fs - 0.4} fill="#626862">{formatArea(r.area).replace(" м²", "")}</tspan>
            </text>
          )}
        </g>
      ))}
      {/* наружные стены */}
      <rect x={0} y={0} width={W} height={H} fill="none" stroke={WALL} strokeWidth={3} />
      {layout.rects.map((r, i) => (
        <g key={`o${i}`}>
          {r.windows.map((s) => <Win key={s} r={r} side={s} />)}
          <Door r={r} side={r.door} />
        </g>
      ))}
    </svg>
  );
}
