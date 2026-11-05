"use client";

import { useId, useMemo, useState } from "react";
import { BANKS, RATE } from "@/data/complex";
import { formatBYN, formatNumber, formatUSD } from "@/lib/format";
import { calcMortgage, downPaymentValue, requiredIncome, validateMortgage, type MortgageFields, type PaymentType } from "@/lib/mortgage";
import { PaymentSchedule } from "./PaymentSchedule";
import { useCurrency } from "@/lib/storage";
import styles from "./MortgageCalculator.module.css";

// Пустое поле или не число — NaN, чтобы валидация отличала его от 0.
const num = (s: string) => (s.trim() === "" ? NaN : Number(s.replace(/\s/g, "").replace(",", ".")));

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
    const f = { price: num(price), down: num(down), years: num(years), ratePct: num(rate) };
    const errors = validateMortgage(f, downMode);
    const ok = Object.keys(errors).length === 0;
    const p = errors.price ? 0 : f.price;
    const d = p && !errors.down ? downPaymentValue(p, f.down, downMode) : 0;
    const loan = p - d;
    const months = ok ? Math.round(f.years * 12) : 0;
    return { p, d, loan, ok, errors, res: calcMortgage({ loan, months, ratePct: f.ratePct, type }) };
  }, [price, down, downMode, years, rate, type]);

  const money = (n: number) => (cur === "USD" ? formatUSD(n / RATE.usd) : formatBYN(n));
  const shown = (n: number) => (r.ok ? money(n) : "—");
  const downPct = r.p ? Math.round((r.d / r.p) * 100) : 0;
  // Ошибка у поля: aria-invalid + aria-describedby на текст ошибки.
  const errId = (k: keyof MortgageFields) => `${uid}${k}-e`;
  const invalid = (k: keyof MortgageFields) => ({ "aria-invalid": Boolean(r.errors[k]), "aria-describedby": r.errors[k] ? errId(k) : undefined });
  const error = (k: keyof MortgageFields) => r.errors[k] && <p id={errId(k)} className={styles.err}>{r.errors[k]}</p>;

  return (
    <div className={styles.wrap}>
      <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
        <div className={styles.field}>
          <label htmlFor={`${uid}p`}>Стоимость квартиры, BYN</label>
          <input id={`${uid}p`} inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value)} {...invalid("price")} />
          {error("price")}
        </div>
        <div className={styles.field}>
          <label htmlFor={`${uid}d`}>Первый взнос</label>
          <div className={styles.inline}>
            <input id={`${uid}d`} inputMode="decimal" value={down} onChange={(e) => setDown(e.target.value)} {...invalid("down")} />
            <div role="group" aria-label="Единицы первого взноса" className={styles.seg}>
              <button type="button" aria-pressed={downMode === "pct"} onClick={() => { setDownMode("pct"); if (!r.errors.down) setDown(String(downPct)); }}>%</button>
              <button type="button" aria-pressed={downMode === "byn"} onClick={() => { setDownMode("byn"); if (!r.errors.down) setDown(String(Math.round(r.d))); }}>BYN</button>
            </div>
          </div>
          {error("down") || (r.p > 0 && <small className="muted">{downMode === "pct" ? `= ${formatNumber(r.d)} BYN` : `= ${downPct}% от стоимости`}</small>)}
        </div>
        <div className={styles.two}>
          <div className={styles.field}>
            <label htmlFor={`${uid}y`}>Срок, лет</label>
            <input id={`${uid}y`} inputMode="numeric" value={years} onChange={(e) => setYears(e.target.value)} {...invalid("years")} />
            {error("years")}
          </div>
          <div className={styles.field}>
            <label htmlFor={`${uid}r`}>Ставка, % годовых</label>
            <input id={`${uid}r`} inputMode="decimal" value={rate} onChange={(e) => setRate(e.target.value)} {...invalid("ratePct")} />
            {error("ratePct")}
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
        <p className={styles.big}>{shown(r.res.firstPayment)}</p>
        {type === "diff" && r.ok && <p className="muted">Последний платёж: {money(r.res.lastPayment)}</p>}
        <dl className={styles.dl}>
          <div><dt>Сумма кредита</dt><dd>{shown(r.loan)}</dd></div>
          <div><dt>Переплата</dt><dd>{shown(r.res.overpay)}</dd></div>
          <div><dt>Всего выплат</dt><dd>{shown(r.res.total)}</dd></div>
          <div><dt>Необходимый доход</dt><dd>{shown(requiredIncome(r.res.firstPayment))}</dd></div>
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
                  setRate(String(b.rate)); setDownMode("pct"); setDown(String(Math.max(b.minDown, downMode === "pct" ? num(down) || 0 : 0)));
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
