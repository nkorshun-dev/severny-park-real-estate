import type { Flat } from "@/data/types";
import { roomsLabel } from "@/lib/format";

// Схема этажа подъезда: 4 квартиры вокруг лестнично-лифтового узла. Подсвечена текущая.
const CELLS = [
  { x: 4, y: 20, w: 88, h: 46 },
  { x: 108, y: 20, w: 88, h: 46 },
  { x: 4, y: 94, w: 88, h: 46 },
  { x: 108, y: 94, w: 88, h: 46 },
];

export function FloorPlan({ current, floorFlats }: { current: Flat; floorFlats: Flat[] }) {
  return (
    <svg viewBox="0 0 200 150" role="img" aria-label={`Расположение на этаже: квартира ${current.number}, ${current.floor} этаж, подъезд ${current.entrance}`} style={{ width: "100%", height: "auto", display: "block" }}>
      <text x={100} y={11} textAnchor="middle" fontSize={7} fill="#626862">Север</text>
      <path d="M100 13 l-3 4 h6z" fill="#626862" />
      <rect x={92} y={66} width={16} height={28} fill="#ecedea" stroke="#121512" strokeWidth={0.8} />
      <text x={100} y={82} textAnchor="middle" fontSize={4.5} fill="#626862">лифт</text>
      <rect x={4} y={66} width={88} height={28} fill="#f4f5f2" />
      <rect x={108} y={66} width={88} height={28} fill="#f4f5f2" />
      <text x={48} y={82} textAnchor="middle" fontSize={5} fill="#626862">коридор</text>
      <text x={152} y={82} textAnchor="middle" fontSize={5} fill="#626862">коридор</text>
      {CELLS.map((c, i) => {
        const f = floorFlats.find((x) => x.position === i);
        const active = f?.id === current.id;
        return (
          <g key={i}>
            <rect x={c.x} y={c.y} width={c.w} height={c.h} rx={2} fill={active ? "#1f4d3a" : "#e7e9e4"} stroke="#121512" strokeWidth={active ? 1.6 : 0.8} />
            {f && (
              <text x={c.x + c.w / 2} y={c.y + c.h / 2 - 2} textAnchor="middle" fontSize={8} fontWeight={800} fill={active ? "#d7f171" : "#121512"}>№ {f.number}</text>
            )}
            {f && (
              <text x={c.x + c.w / 2} y={c.y + c.h / 2 + 8} textAnchor="middle" fontSize={6} fill={active ? "#fff" : "#626862"}>{roomsLabel(f.rooms)}, {f.area.toFixed(1).replace(".", ",")} м²</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
