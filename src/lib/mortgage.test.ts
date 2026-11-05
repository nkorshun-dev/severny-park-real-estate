import { describe, expect, it } from "vitest";
import { annuityPayment, calcMortgage, downPaymentValue, requiredIncome, validateMortgage } from "./mortgage";

// Ручная формула: P·r·(1+r)^n / ((1+r)^n − 1)
const manualAnnuity = (p: number, r: number, n: number) => (p * r * (1 + r) ** n) / ((1 + r) ** n - 1);

describe("аннуитет", () => {
  it("сценарий 1: 100 000 BYN, 12% годовых, 12 мес.", () => {
    const pay = annuityPayment(100000, 12, 12);
    expect(pay).toBeCloseTo(manualAnnuity(100000, 0.01, 12), 6);
    expect(pay).toBeCloseTo(8884.88, 2);
    const res = calcMortgage({ loan: 100000, months: 12, ratePct: 12, type: "annuity" });
    expect(res.total).toBeCloseTo(pay * 12, 4);
    expect(res.schedule.at(-1)!.balance).toBe(0);
  });

  it("сценарий 2: 250 000 BYN, 9,9% годовых, 20 лет", () => {
    const r = 9.9 / 1200;
    const res = calcMortgage({ loan: 250000, months: 240, ratePct: 9.9, type: "annuity" });
    expect(res.firstPayment).toBeCloseTo(manualAnnuity(250000, r, 240), 6);
    expect(res.overpay).toBeCloseTo(manualAnnuity(250000, r, 240) * 240 - 250000, 3);
    // сумма платежей графика = кредит + переплата
    const sum = res.schedule.reduce((s, x) => s + x.payment, 0);
    expect(sum).toBeCloseTo(250000 + res.overpay, 6);
    // сумма погашений тела долга = кредит
    expect(res.schedule.reduce((s, x) => s + x.principal, 0)).toBeCloseTo(250000, 6);
  });

  it("нулевая ставка (рассрочка)", () => {
    const res = calcMortgage({ loan: 24000, months: 24, ratePct: 0, type: "annuity" });
    expect(res.firstPayment).toBeCloseTo(1000, 9);
    expect(res.overpay).toBeCloseTo(0, 9);
  });
});

describe("дифференцированный платёж", () => {
  it("сценарий 1: 120 000 BYN, 12%, 12 мес.", () => {
    const res = calcMortgage({ loan: 120000, months: 12, ratePct: 12, type: "diff" });
    expect(res.firstPayment).toBeCloseTo(10000 + 120000 * 0.01, 6); // 11 200
    expect(res.lastPayment).toBeCloseTo(10000 + 10000 * 0.01, 6); // 10 100
    // переплата = P·r·(n+1)/2
    expect(res.overpay).toBeCloseTo(120000 * 0.01 * 6.5, 6); // 7 800
  });

  it("сценарий 2: 180 000 BYN, 10,8%, 15 лет", () => {
    const n = 180;
    const r = 10.8 / 1200;
    const res = calcMortgage({ loan: 180000, months: n, ratePct: 10.8, type: "diff" });
    expect(res.firstPayment).toBeCloseTo(180000 / n + 180000 * r, 6);
    expect(res.overpay).toBeCloseTo((180000 * r * (n + 1)) / 2, 4);
    expect(res.schedule.reduce((s, x) => s + x.payment, 0)).toBeCloseTo(180000 + res.overpay, 6);
    expect(res.schedule.every((x, i, a) => i === 0 || x.payment <= a[i - 1].payment)).toBe(true);
  });
});

describe("прочее", () => {
  it("пустой кредит даёт пустой график", () => {
    expect(calcMortgage({ loan: 0, months: 12, ratePct: 10, type: "annuity" }).schedule).toHaveLength(0);
  });
  it("необходимый доход = платёж / 0,4", () => {
    expect(requiredIncome(800)).toBe(2000);
  });
  it("нулевой срок: пустой график и нулевая переплата, а не «−кредит»", () => {
    const res = calcMortgage({ loan: 90000, months: 0, ratePct: 12.5, type: "annuity" });
    expect(res.schedule).toHaveLength(0);
    expect(res.overpay).toBe(0);
    expect(calcMortgage({ loan: 90000, months: -60, ratePct: 12.5, type: "diff" }).overpay).toBe(0);
  });
  it("первый взнос в % и в BYN", () => {
    expect(downPaymentValue(200000, 20, "pct")).toBe(40000);
    expect(downPaymentValue(200000, 50000, "byn")).toBe(50000);
    expect(downPaymentValue(200000, 999999, "byn")).toBe(200000);
  });
});

describe("валидация калькулятора", () => {
  const ok = { price: 250000, down: 20, years: 20, ratePct: 12.5 };
  const v = (patch: Partial<typeof ok>, mode: "pct" | "byn" = "pct") => validateMortgage({ ...ok, ...patch }, mode);

  it("корректные данные — без ошибок, включая ставку 0% и взнос 0", () => {
    expect(v({})).toEqual({});
    expect(v({ price: 120000, down: 0, years: 10, ratePct: 0 })).toEqual({});
    expect(v({ years: 1 })).toEqual({});
    expect(v({ years: 30 })).toEqual({});
  });

  it.each([0, NaN, -5, 0.5, 31])("срок %s — ошибка", (years) => {
    expect(v({ years }).years).toBeTruthy();
  });

  it.each([0, NaN, -100000])("стоимость %s — ошибка", (price) => {
    expect(v({ price }).price).toBeTruthy();
  });

  it("взнос: пусто, отрицательный, ≥ стоимости", () => {
    expect(v({ down: NaN }).down).toBeTruthy();
    expect(v({ down: -5 }).down).toBeTruthy();
    expect(v({ down: 100 }).down).toBeTruthy();
    expect(v({ down: 120 }).down).toBeTruthy();
    expect(v({ down: 99 }).down).toBeUndefined();
    expect(v({ down: 250000 }, "byn").down).toBeTruthy();
    expect(v({ down: 249999 }, "byn").down).toBeUndefined();
  });

  it("ставка: пусто и отрицательная — ошибка", () => {
    expect(v({ ratePct: NaN }).ratePct).toBeTruthy();
    expect(v({ ratePct: -1 }).ratePct).toBeTruthy();
  });

  it("проверенные примеры: 2272 и 1000 BYN в месяц", () => {
    expect(Math.round(calcMortgage({ loan: 200000, months: 240, ratePct: 12.5, type: "annuity" }).firstPayment)).toBe(2272);
    expect(calcMortgage({ loan: 120000, months: 120, ratePct: 0, type: "annuity" }).firstPayment).toBeCloseTo(1000, 9);
  });
});
