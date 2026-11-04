"use client";

import { useId, useMemo, useState } from "react";
import { BANKS, RATE } from "@/data/complex";
import { formatBYN, formatNumber, formatUSD } from "@/lib/format";
import { calcMortgage, downPaymentValue, requiredIncome, type PaymentType } from "@/lib/mortgage";
import { PaymentSchedule } from "./PaymentSchedule";
import { useCurrency } from "@/lib/storage";
import styles from "./MortgageCalculator.module.css";

const num = (s: string) => {
  const n = Number(s.replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
};

export function MortgageCalculator({ initialPrice = 250000, full = false, showPrograms = false }: {
  initialPrice?: number; full?: boolean; showPrograms?: boolean;
}) {
  const uid = useId();
  const [price, setPrice] = useState(String(initialPrice));
  const [downMode, setDownMode] = useState<"byn" | "pct">("pct");
  const [down, setDown] = useState("20");
  const [years, setYears] = useState("20");
  const [rate, setRate] = useState("12.5");
  const [type, setType] = useState<PaymentType>("annuity");
  const [cur] = useCurrency();

  const r = useMemo(() => {
    const p = Math.max(num(price), 0);
    const d = downPaymentValue(p, num(down), downMode);
    const months = Math.min(Math.max(Math.round(num(years) * 12), 0), 600);
    const loan = p - d;
    return { p, d, loan, months, res: calcMortgage({ loan, months, ratePct: Math.max(num(rate), 0), type }) };
  }, [price, down, downMode, years, rate, type]);

  const money = (n: number) => (cur === "USD" ? formatUSD(n / RATE.usd) : formatBYN(n));
  const downPct = r.p ? Math.round((r.d / r.p) * 100) : 0;

  return (
    <div className={styles.wrap}>
      <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
        <div className={styles.field}>
          <label htmlFor={`${uid}p`}>Стоимость квартиры, BYN</label>
          <input id={`${uid}p`} inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value)} />
        </div>
        <div className={styles.field}>
          <label htmlFor={`${uid}d`}>Первый взнос</label>
          <div className={styles.inline}>
            <input id={`${uid}d`} inputMode="decimal" value={down} onChange={(e) => setDown(e.target.value)} />
            <div role="group" aria-label="Единицы первого взноса" className={styles.seg}>
              <button type="button" aria-pressed={downMode === "pct"} onClick={() => { setDownMode("pct"); setDown(String(downPct)); }}>%</button>
              <button type="button" aria-pressed={downMode === "byn"} onClick={() => { setDownMode("byn"); setDown(String(Math.round(r.d))); }}>BYN</button>
            </div>
          </div>
          <small className="muted">{downMode === "pct" ? `= ${formatNumber(r.d)} BYN` : `= ${downPct}% от стоимости`}</small>
        </div>
        <div className={styles.two}>
          <div className={styles.field}>
            <label htmlFor={`${uid}y`}>Срок, лет</label>
            <input id={`${uid}y`} inputMode="numeric" value={years} onChange={(e) => setYears(e.target.value)} />
          </div>
          <div className={styles.field}>
            <label htmlFor={`${uid}r`}>Ставка, % годовых</label>
            <input id={`${uid}r`} inputMode="decimal" value={rate} onChange={(e) => setRate(e.target.value)} />
          </div>
        </div>
        <fieldset className={styles.type}>
          <legend>Тип платежа</legend>
          <label><input type="radio" name={`${uid}t`} checked={type === "annuity"} onChange={() => setType("annuity")} />Аннуитетный</label>
          <label><input type="radio" name={`${uid}t`} checked={type === "diff"} onChange={() => setType("diff")} />Дифференцированный</label>
        </fieldset>
      </form>

      <div className={styles.result} aria-live="polite">
        <p className={styles.label}>{type === "annuity" ? "Платёж в месяц" : "Первый платёж в месяц"}</p>
        <p className={styles.big}>{r.res.schedule.length ? money(r.res.firstPayment) : "—"}</p>
        {type === "diff" && r.res.schedule.length > 0 && <p className="muted">Последний платёж: {money(r.res.lastPayment)}</p>}
        <dl className={styles.dl}>
          <div><dt>Сумма кредита</dt><dd>{money(r.loan)}</dd></div>
          <div><dt>Переплата</dt><dd>{money(r.res.overpay)}</dd></div>
          <div><dt>Всего выплат</dt><dd>{money(r.res.total)}</dd></div>
          <div><dt>Необходимый доход</dt><dd>{r.res.schedule.length ? money(requiredIncome(r.res.firstPayment)) : "—"}</dd></div>
        </dl>
        <p className="muted" style={{ fontSize: ".85rem" }}>Расчёт ориентировочный, условия уточняйте в банке. Доход рассчитан при нагрузке платежа до 40%.</p>
      </div>

      {showPrograms && (
        <section className={styles.programs} aria-labelledby={`${uid}pr`}>
          <h2 id={`${uid}pr`}>Программы банков</h2>
          <p className="muted">Вымышленные условия для демонстрации.</p>
          <ul className={styles.progList}>
            {BANKS.map((b) => (
              <li key={b.name} className={styles.prog}>
                <h3>{b.name}</h3>
                <p className="muted">{b.bank}</p>
                <p>Ставка {String(b.rate).replace(".", ",")}% · взнос от {b.minDown}% · до {b.maxYears} лет</p>
                <button type="button" className="btn small ghost" onClick={() => {
                  setRate(String(b.rate)); setDownMode("pct"); setDown(String(Math.max(b.minDown, downMode === "pct" ? num(down) : 0)));
                  setYears(String(Math.min(b.maxYears, num(years) || b.maxYears)));
                }}>Применить</button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {full && (
        <div className={styles.schedule}>
          <PaymentSchedule rows={r.res.schedule} loan={r.loan} />
        </div>
      )}
    </div>
  );
}
