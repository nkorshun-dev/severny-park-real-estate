import { describe, expect, it } from "vitest";
import { flats } from "@/data/flats";
import { LAYOUTS } from "@/data/layouts";
import { generateFlats } from "./generate-flats";
import { applyFilters, DEFAULT_FILTERS, filtersToParams, parseFilters } from "./filters";
import { maskPhone, isCompletePhone, editPhone } from "./phone-mask";
import { validateLead } from "./validation";

describe("генерация квартир", () => {
  it("детерминирована", () => {
    expect(generateFlats()).toEqual(generateFlats());
  });
  it("около 420 квартир с уникальными id", () => {
    expect(flats).toHaveLength(420);
    expect(new Set(flats.map((f) => f.id)).size).toBe(420);
  });
  it("доли статусов близки к 55/10/35", () => {
    const share = (s: string) => flats.filter((f) => f.status === s).length / flats.length;
    expect(share("free")).toBeGreaterThan(0.48);
    expect(share("free")).toBeLessThan(0.62);
    expect(share("reserved")).toBeGreaterThan(0.06);
    expect(share("reserved")).toBeLessThan(0.14);
    expect(share("sold")).toBeGreaterThan(0.28);
    expect(share("sold")).toBeLessThan(0.42);
  });
  it("первый этаж дешевле за м², чем второй (в среднем)", () => {
    const avg = (fl: number) => {
      const l = flats.filter((f) => f.floor === fl && f.building === 1);
      return l.reduce((s, f) => s + f.ppm2, 0) / l.length;
    };
    expect(avg(1)).toBeLessThan(avg(2));
  });
  it("планировки замкнуты: ряды одной ширины, площади с десятыми", () => {
    for (const l of LAYOUTS) {
      const top = l.rects.filter((r) => r.y === 0).reduce((s, r) => s + r.w, 0);
      const bottom = l.rects.filter((r) => r.y > 0).reduce((s, r) => s + r.w, 0);
      expect(Math.abs(top - bottom)).toBeLessThan(1e-9);
    }
  });
});

describe("фильтры", () => {
  it("не показывают проданные", () => {
    expect(applyFilters(flats, DEFAULT_FILTERS).every((f) => f.status !== "sold")).toBe(true);
  });
  it("комбинируются", () => {
    const f = { ...DEFAULT_FILTERS, rooms: [2], notFirst: true, features: ["balcony" as const], buildings: [2] };
    const res = applyFilters(flats, f);
    expect(res.length).toBeGreaterThan(0);
    expect(res.every((x) => x.rooms === 2 && x.floor > 1 && x.building === 2 && x.features.includes("balcony"))).toBe(true);
  });
  it("туда-обратно через URL", () => {
    const f = { ...DEFAULT_FILTERS, rooms: [1, 2], priceMax: 300000, notLast: true, sort: "area-desc" as const, deadlines: ["III кв. 2027"] };
    const p = filtersToParams(f);
    expect(parseFilters((k) => p.get(k))).toEqual(f);
    expect(filtersToParams(DEFAULT_FILTERS).toString()).toBe("");
  });
  it("мусор в URL заменяется значениями по умолчанию", () => {
    const p = new URLSearchParams("rooms=9,x&priceMin=abc&sort=zzz&b=77");
    expect(parseFilters((k) => p.get(k))).toEqual(DEFAULT_FILTERS);
  });
  it("сортировка по цене", () => {
    const res = applyFilters(flats, { ...DEFAULT_FILTERS, sort: "price-desc" });
    expect(res[0].price).toBeGreaterThanOrEqual(res[1].price);
  });
});

describe("телефон и валидация", () => {
  it("маска", () => {
    expect(maskPhone("291234567")).toBe("+375 (29) 123-45-67");
    expect(maskPhone("+375291234567")).toBe("+375 (29) 123-45-67");
    expect(maskPhone("8029")).toBe("+375 (29)");
    expect(isCompletePhone("+375 (29) 123-45-6")).toBe(false);
  });
  it("Backspace через «)» стирает цифру перед ней, каретка на месте", () => {
    expect(editPhone("+375 (29 123-45-67", 8, "+375 (29) 123-45-67")).toEqual({ value: "+375 (21) 234-56-7", caret: 7 });
    expect(editPhone("+375 (29) 123-45-67", 5, "+375 (29) 123-45-67").value).toBe("+375 (29) 123-45-67");
  });
  it("ошибки формы", () => {
    const e = validateLead({ name: "", phone: "", time: "", comment: "", consent: false });
    expect(Object.keys(e).sort()).toEqual(["consent", "name", "phone"]);
    expect(validateLead({ name: "Анна", phone: "+375 (29) 123-45-67", time: "", comment: "", consent: true })).toEqual({});
  });
});
