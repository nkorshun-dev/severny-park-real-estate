export type PaymentType = "annuity" | "diff";

export interface MortgageInput {
  loan: number;
  months: number;
  ratePct: number; // годовая ставка, %
  type: PaymentType;
}

export interface PaymentRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export interface MortgageResult {
  schedule: PaymentRow[];
  firstPayment: number;
  lastPayment: number;
  total: number;
  overpay: number;
}

/** Максимальная доля дохода, которую банк разрешает тратить на платёж. */
export const MAX_LOAD = 0.4;

export const monthlyRate = (ratePct: number) => ratePct / 12 / 100;

/** Аннуитет: P·r / (1 − (1+r)^−n). При r = 0 — просто P/n. */
export function annuityPayment(loan: number, months: number, ratePct: number) {
  const r = monthlyRate(ratePct);
  if (months <= 0) return 0;
  if (r === 0) return loan / months;
  return (loan * r) / (1 - Math.pow(1 + r, -months));
}

export function buildSchedule({ loan, months, ratePct, type }: MortgageInput): PaymentRow[] {
  const r = monthlyRate(ratePct);
  const rows: PaymentRow[] = [];
  const annuity = annuityPayment(loan, months, ratePct);
  let balance = loan;
  for (let m = 1; m <= months; m++) {
    const interest = balance * r;
    const principal = m === months ? balance : type === "annuity" ? annuity - interest : loan / months;
    balance = m === months ? 0 : balance - principal;
    rows.push({ month: m, payment: principal + interest, principal, interest, balance });
  }
  return rows;
}

export function calcMortgage(input: MortgageInput): MortgageResult {
  const schedule = input.loan > 0 && input.months > 0 ? buildSchedule(input) : [];
  const total = schedule.reduce((s, r) => s + r.payment, 0);
  return {
    schedule,
    firstPayment: schedule[0]?.payment ?? 0,
    lastPayment: schedule[schedule.length - 1]?.payment ?? 0,
    total,
    overpay: total - Math.max(input.loan, 0),
  };
}

/** Доход, при котором самый большой платёж не превышает MAX_LOAD. */
export const requiredIncome = (maxPayment: number) => maxPayment / MAX_LOAD;

export function downPaymentValue(price: number, value: number, mode: "byn" | "pct") {
  const down = mode === "pct" ? (price * value) / 100 : value;
  return Math.min(Math.max(down, 0), price);
}
