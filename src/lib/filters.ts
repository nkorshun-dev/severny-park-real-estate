import { flats } from "@/data/flats";
import { BUILDINGS, DEADLINES } from "@/data/buildings";
import type { Feature, Finish, Flat } from "@/data/types";

export type SortKey = "price-asc" | "price-desc" | "area-asc" | "area-desc" | "ppm2" | "floor";

export const SORTS: { key: SortKey; label: string }[] = [
  { key: "price-asc", label: "Цена: по возрастанию" },
  { key: "price-desc", label: "Цена: по убыванию" },
  { key: "area-asc", label: "Площадь: по возрастанию" },
  { key: "area-desc", label: "Площадь: по убыванию" },
  { key: "ppm2", label: "Цена за м²" },
  { key: "floor", label: "Этаж: выше" },
];

export interface Filters {
  rooms: number[];
  priceMin: number;
  priceMax: number;
  areaMin: number;
  areaMax: number;
  floorMin: number;
  floorMax: number;
  notFirst: boolean;
  notLast: boolean;
  buildings: number[];
  deadlines: string[];
  finishes: Finish[];
  features: Feature[];
  fav: boolean;
  sort: SortKey;
}

export const BOUNDS = {
  price: [Math.floor(Math.min(...flats.map((f) => f.price)) / 1000) * 1000, Math.ceil(Math.max(...flats.map((f) => f.price)) / 1000) * 1000],
  area: [Math.floor(Math.min(...flats.map((f) => f.area))), Math.ceil(Math.max(...flats.map((f) => f.area)))],
  floor: [1, Math.max(...BUILDINGS.map((b) => b.floors))],
} as const;

export const DEFAULT_FILTERS: Filters = {
  rooms: [], priceMin: BOUNDS.price[0], priceMax: BOUNDS.price[1],
  areaMin: BOUNDS.area[0], areaMax: BOUNDS.area[1],
  floorMin: BOUNDS.floor[0], floorMax: BOUNDS.floor[1],
  notFirst: false, notLast: false, buildings: [], deadlines: [], finishes: [], features: [], fav: false, sort: "price-asc",
};

const FINISHES: Finish[] = ["none", "rough", "full"];
const FEATURES: Feature[] = ["balcony", "loggia", "twoBath", "wardrobe", "forest", "corner"];

const num = (v: string | null, def: number, lo: number, hi: number) => {
  const n = v === null || v === "" ? NaN : Number(v);
  return Number.isFinite(n) ? Math.min(Math.max(n, lo), hi) : def;
};
const list = (v: string | null) => (v ? v.split(",").filter(Boolean) : []);

/** Читает фильтры из query-строки. Некорректные значения заменяются значениями по умолчанию. */
export function parseFilters(get: (k: string) => string | null): Filters {
  const d = DEFAULT_FILTERS;
  const sort = get("sort") as SortKey | null;
  return {
    rooms: list(get("rooms")).map(Number).filter((n) => Number.isInteger(n) && n >= 0 && n <= 4),
    priceMin: num(get("priceMin"), d.priceMin, d.priceMin, d.priceMax),
    priceMax: num(get("priceMax"), d.priceMax, d.priceMin, d.priceMax),
    areaMin: num(get("areaMin"), d.areaMin, d.areaMin, d.areaMax),
    areaMax: num(get("areaMax"), d.areaMax, d.areaMin, d.areaMax),
    floorMin: num(get("floorMin"), d.floorMin, d.floorMin, d.floorMax),
    floorMax: num(get("floorMax"), d.floorMax, d.floorMin, d.floorMax),
    notFirst: get("notFirst") === "1",
    notLast: get("notLast") === "1",
    buildings: list(get("b")).map(Number).filter((n) => BUILDINGS.some((b) => b.id === n)),
    deadlines: list(get("deadline")).filter((x) => DEADLINES.includes(x)),
    finishes: list(get("finish")).filter((x): x is Finish => FINISHES.includes(x as Finish)),
    features: list(get("features")).filter((x): x is Feature => FEATURES.includes(x as Feature)),
    fav: get("fav") === "1",
    sort: SORTS.some((s) => s.key === sort) ? (sort as SortKey) : d.sort,
  };
}

/** Собирает query-строку: в неё попадает только то, что отличается от значений по умолчанию. */
export function filtersToParams(f: Filters): URLSearchParams {
  const d = DEFAULT_FILTERS;
  const p = new URLSearchParams();
  if (f.rooms.length) p.set("rooms", [...f.rooms].sort().join(","));
  (["priceMin", "priceMax", "areaMin", "areaMax", "floorMin", "floorMax"] as const).forEach((k) => {
    if (f[k] !== d[k]) p.set(k, String(f[k]));
  });
  if (f.notFirst) p.set("notFirst", "1");
  if (f.notLast) p.set("notLast", "1");
  if (f.buildings.length) p.set("b", [...f.buildings].sort().join(","));
  if (f.deadlines.length) p.set("deadline", f.deadlines.join(","));
  if (f.finishes.length) p.set("finish", f.finishes.join(","));
  if (f.features.length) p.set("features", f.features.join(","));
  if (f.fav) p.set("fav", "1");
  if (f.sort !== d.sort) p.set("sort", f.sort);
  return p;
}

export function sortFlats(list: Flat[], sort: SortKey): Flat[] {
  const by: Record<SortKey, (a: Flat, b: Flat) => number> = {
    "price-asc": (a, b) => a.price - b.price,
    "price-desc": (a, b) => b.price - a.price,
    "area-asc": (a, b) => a.area - b.area,
    "area-desc": (a, b) => b.area - a.area,
    ppm2: (a, b) => a.ppm2 - b.ppm2,
    floor: (a, b) => b.floor - a.floor,
  };
  return [...list].sort((a, b) => by[sort](a, b) || a.id.localeCompare(b.id));
}

/** В каталоге показываются свободные и забронированные квартиры; проданные скрыты. */
export function applyFilters(list: Flat[], f: Filters, favorites: string[] = []): Flat[] {
  const out = list.filter(
    (x) =>
      x.status !== "sold" &&
      (!f.rooms.length || f.rooms.includes(x.rooms)) &&
      x.price >= f.priceMin && x.price <= f.priceMax &&
      x.area >= f.areaMin && x.area <= f.areaMax &&
      x.floor >= f.floorMin && x.floor <= f.floorMax &&
      (!f.notFirst || x.floor !== 1) &&
      (!f.notLast || x.floor !== x.floors) &&
      (!f.buildings.length || f.buildings.includes(x.building)) &&
      (!f.deadlines.length || f.deadlines.includes(x.deadline)) &&
      (!f.finishes.length || f.finishes.includes(x.finish)) &&
      f.features.every((ft) => x.features.includes(ft)) &&
      (!f.fav || favorites.includes(x.id)),
  );
  return sortFlats(out, f.sort);
}
