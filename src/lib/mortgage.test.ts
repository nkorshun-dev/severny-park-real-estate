import { describe, expect, it } from "vitest";
import { annuityPayment, calcMortgage, downPaymentValue, requiredIncome } from "./mortgage";

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
  it("первый взнос в % и в BYN", () => {
    expect(downPaymentValue(200000, 20, "pct")).toBe(40000);
    expect(downPaymentValue(200000, 50000, "byn")).toBe(50000);
    expect(downPaymentValue(200000, 999999, "byn")).toBe(200000);
  });
});
