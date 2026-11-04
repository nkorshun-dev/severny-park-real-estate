export type RoomKind = "studio" | "living" | "bed" | "kitchen" | "bath" | "hall" | "wardrobe";
export type Side = "t" | "b" | "l" | "r";

export interface RoomRect {
  name: string;
  kind: RoomKind;
  x: number; y: number; w: number; h: number; // метры
  area: number;
  windows: Side[];
  door: Side;
}

export interface Layout {
  id: string;
  name: string;
  rooms: number; // 0 = студия
  area: number;
  width: number;
  height: number;
  rects: RoomRect[];
  balcony: "balcony" | "loggia";
  balconyX: number; // метры
  balconyW: number;
  twoBath: boolean;
  wardrobe: boolean;
}

interface Spec {
  id: string; name: string; rooms: number;
  top: [string, number][]; topH: number;
  bottom: [string, number][]; botH: number;
  balcony: "balcony" | "loggia";
}

const kindOf = (n: string): RoomKind =>
  n === "Прихожая" ? "hall" : n === "Санузел" ? "bath" : n === "Гардеробная" ? "wardrobe"
  : n === "Кухня" ? "kitchen" : n === "Студия" ? "studio"
  : n === "Спальня" || n === "Детская" ? "bed" : "living";

const round1 = (n: number) => Math.round(n * 10) / 10;

// Квартира = верхний ряд комнат (фасад) + нижний ряд (прихожая, санузлы, кухня).
function build(s: Spec): Layout {
  const width = round1(s.top.reduce((a, [, w]) => a + w, 0));
  const rects: RoomRect[] = [];
  let x = 0;
  for (const [name, w] of s.top) {
    rects.push({ name, kind: kindOf(name), x, y: 0, w, h: s.topH, area: round1(w * s.topH), windows: ["t"], door: "b" });
    x += w;
  }
  x = 0;
  s.bottom.forEach(([name, w], i) => {
    const kind = kindOf(name);
    rects.push({
      name, kind, x, y: s.topH, w, h: s.botH, area: round1(w * s.botH),
      windows: kind === "kitchen" && i === 0 ? ["l"] : [],
      door: kind === "hall" ? "b" : "t",
    });
    x += w;
  });
  const main = rects.find((r) => r.y === 0 && (r.kind === "studio" || r.kind === "living")) ?? rects[0];
  const balconyW = round1(Math.min(main.w - 0.6, s.balcony === "balcony" ? 3 : 3.6));
  return {
    id: s.id, name: s.name, rooms: s.rooms,
    area: round1(rects.reduce((a, r) => a + r.area, 0)),
    width, height: round1(s.topH + s.botH), rects, balcony: s.balcony,
    balconyX: round1(main.x + 0.3), balconyW,
    twoBath: rects.filter((r) => r.kind === "bath").length > 1,
    wardrobe: rects.some((r) => r.kind === "wardrobe"),
  };
}

const SPECS: Spec[] = [
  { id: "S1", name: "Студия", rooms: 0, top: [["Студия", 5]], topH: 3.9, bottom: [["Санузел", 2], ["Прихожая", 3]], botH: 1.7, balcony: "balcony" },
  { id: "S2", name: "Студия с лоджией", rooms: 0, top: [["Студия", 5.4]], topH: 4.2, bottom: [["Санузел", 2.4], ["Прихожая", 3]], botH: 1.8, balcony: "loggia" },
  { id: "1A", name: "Однокомнатная с балконом", rooms: 1, top: [["Комната", 3.4], ["Кухня", 2.6]], topH: 4.4, bottom: [["Санузел", 2], ["Прихожая", 4]], botH: 2.4, balcony: "balcony" },
  { id: "1B", name: "Однокомнатная с гардеробной", rooms: 1, top: [["Комната", 3.8], ["Кухня", 2.6]], topH: 4.6, bottom: [["Гардеробная", 1.6], ["Санузел", 2.2], ["Прихожая", 2.6]], botH: 2.4, balcony: "loggia" },
  { id: "2A", name: "Двухкомнатная классическая", rooms: 2, top: [["Гостиная", 4.2], ["Спальня", 3.4]], topH: 4.4, bottom: [["Кухня", 3.4], ["Санузел", 1.8], ["Прихожая", 2.4]], botH: 3, balcony: "balcony" },
  { id: "2B", name: "Двухкомнатная с кухней-гостиной", rooms: 2, top: [["Гостиная", 4.8], ["Спальня", 3.4]], topH: 4.6, bottom: [["Гардеробная", 1.8], ["Санузел", 2.2], ["Прихожая", 4.2]], botH: 2.8, balcony: "loggia" },
  { id: "2C", name: "Двухкомнатная просторная", rooms: 2, top: [["Гостиная", 4.4], ["Спальня", 4.2]], topH: 4.8, bottom: [["Кухня", 3.8], ["Санузел", 2], ["Прихожая", 2.8]], botH: 3.2, balcony: "balcony" },
  { id: "3A", name: "Трёхкомнатная семейная", rooms: 3, top: [["Спальня", 3], ["Гостиная", 3.6], ["Детская", 2.8]], topH: 4.8, bottom: [["Кухня", 3.4], ["Санузел", 2.2], ["Прихожая", 3.8]], botH: 3.4, balcony: "balcony" },
  { id: "3B", name: "Трёхкомнатная с двумя санузлами", rooms: 3, top: [["Спальня", 3.4], ["Гостиная", 3.8], ["Детская", 3]], topH: 5, bottom: [["Кухня", 3.8], ["Санузел", 1.8], ["Санузел", 1.8], ["Прихожая", 2.8]], botH: 3.6, balcony: "loggia" },
  { id: "3C", name: "Трёхкомнатная с гардеробной", rooms: 3, top: [["Спальня", 3.6], ["Гостиная", 4], ["Детская", 3]], topH: 5.2, bottom: [["Кухня", 3.6], ["Санузел", 1.8], ["Санузел", 1.6], ["Гардеробная", 1.6], ["Прихожая", 2]], botH: 3.8, balcony: "loggia" },
  { id: "4A", name: "Четырёхкомнатная", rooms: 4, top: [["Спальня", 3.4], ["Гостиная", 4.2], ["Детская", 2.4], ["Детская", 2]], topH: 5.2, bottom: [["Кухня", 4], ["Санузел", 2.2], ["Санузел", 2], ["Прихожая", 3.8]], botH: 4, balcony: "balcony" },
  { id: "4B", name: "Четырёхкомнатная премиум", rooms: 4, top: [["Спальня", 3.6], ["Гостиная", 4.6], ["Детская", 2.6], ["Детская", 2.4]], topH: 5.4, bottom: [["Кухня", 4.2], ["Санузел", 2.2], ["Санузел", 2], ["Гардеробная", 2], ["Прихожая", 2.8]], botH: 4.2, balcony: "loggia" },
];

export const LAYOUTS: Layout[] = SPECS.map(build);
export const LAYOUT_BY_ID: Record<string, Layout> = Object.fromEntries(LAYOUTS.map((l) => [l.id, l]));
