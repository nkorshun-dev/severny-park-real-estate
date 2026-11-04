import { BUILDINGS } from "@/data/buildings";
import { LAYOUT_BY_ID } from "@/data/layouts";
import type { Feature, Finish, Flat, Status } from "@/data/types";

// Цены и доли статусов. Меняйте здесь.
export const BASE_PPM2 = 4300; // BYN за м²
const BUILDING_BUMP = [0, 0.035, 0.07];
const FINISH_FACTOR: Record<Finish, number> = { none: 1, rough: 1.04, full: 1.09 };
const SOLD_BASE = [0.5, 0.34, 0.21];
const RESERVED_SHARE = 0.1;
const SIDES = ["Северо-восток", "Восток", "Юг", "Запад"];
const VIEWS = ["Уручский лес", "двор без машин", "двор без машин", "парк"];

// mulberry32: маленький детерминированный генератор случайных чисел
export function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickFinish(b: number, r: number): Finish {
  if (b === 1) return r < 0.7 ? "rough" : "full";
  if (b === 2) return r < 0.4 ? "none" : r < 0.8 ? "rough" : "full";
  return r < 0.7 ? "none" : "rough";
}

export function generateFlats(): Flat[] {
  const rnd = mulberry32(20260901);
  const out: Flat[] = [];
  for (const b of BUILDINGS) {
    for (let e = 0; e < b.entrances; e++) {
      for (let f = 1; f <= b.floors; f++) {
        for (let p = 0; p < 4; p++) {
          const layout = LAYOUT_BY_ID[b.patterns[e][p]];
          const number = (e * b.floors + (f - 1)) * 4 + p + 1;
          const forest = b.forestPositions.includes(p);
          const corner = (p === 0 && e === 0) || (p === 3 && e === b.entrances - 1);
          const features: Feature[] = [layout.balcony];
          if (layout.twoBath) features.push("twoBath");
          if (layout.wardrobe) features.push("wardrobe");
          if (forest) features.push("forest");
          if (corner) features.push("corner");
          const finish = pickFinish(b.id, rnd());
          // нижние и средние этажи раскупаются быстрее
          const mod = Math.max(0.5, 0.75 + 0.5 * (1 - Math.abs(f / b.floors - 0.4) / 0.6));
          const roll = rnd();
          const pSold = SOLD_BASE[b.id - 1] * mod;
          const status: Status = roll < pSold ? "sold" : roll < pSold + RESERVED_SHARE ? "reserved" : "free";
          const ppm2 =
            BASE_PPM2 * (1 + BUILDING_BUMP[b.id - 1]) *
            (f === 1 ? 0.93 : 1 + 0.008 * (f - 1)) * (f === b.floors ? 0.99 : 1) *
            (forest ? 1.05 : 1) * (corner ? 0.98 : 1) * FINISH_FACTOR[finish] *
            (1 + (rnd() - 0.5) * 0.03);
          let price = Math.round(layout.area * ppm2);
          if (price % 100 === 0) price += 37;
          out.push({
            id: `${b.id}-${String(number).padStart(3, "0")}`,
            number, building: b.id, entrance: e + 1, floor: f, floors: b.floors, position: p,
            layoutId: layout.id, rooms: layout.rooms, area: layout.area,
            price, ppm2: Math.round(price / layout.area), status, finish,
            deadline: b.deadline, features, side: SIDES[p],
            view: p === 0 && !forest ? "двор без машин" : VIEWS[p],
          });
        }
      }
    }
  }
  return out;
}
