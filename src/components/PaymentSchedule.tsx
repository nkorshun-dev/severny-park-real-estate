"use client";

import { useState } from "react";
import { formatNumber } from "@/lib/format";
import type { PaymentRow } from "@/lib/mortgage";
import styles from "./PaymentSchedule.module.css";

const PER_PAGE = 12;

function BalanceChart({ rows, loan }: { rows: PaymentRow[]; loan: number }) {
  const W = 600, H = 220, L = 8, B = 20;
  const n = rows.length;
  const pts = [[0, loan], ...rows.map((r) => [r.month, r.balance])];
  const d = pts.map(([m, b], i) => `${i ? "L" : "M"}${L + (m / n) * (W - L * 2)} ${H - B - (b / loan) * (H - B - 10)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`График остатка долга: от ${formatNumber(loan)} BYN до нуля за ${n} мес.`} style={{ width: "100%", height: "auto" }}>
      <path d={`${d} L${W - L} ${H - B} L${L} ${H - B} Z`} fill="#d7f171" opacity={0.45} />
      <path d={d} fill="none" stroke="#1f4d3a" strokeWidth={2.5} />
      <line x1={L} x2={W - L} y1={H - B} y2={H - B} stroke="#626862" />
      <text x={L} y={H - 4} fontSize={11} fill="#626862">0</text>
      <text x={W - L} y={H - 4} fontSize={11} fill="#626862" textAnchor="end">{n} мес.</text>
      <text x={L + 4} y={14} fontSize={11} fill="#626862">{formatNumber(loan)} BYN</text>
    </svg>
  );
}

export function PaymentSchedule({ rows, loan }: { rows: PaymentRow[]; loan: number }) {
  const [page, setPage] = useState(0);
  const pages = Math.ceil(rows.length / PER_PAGE);
  const cur = Math.min(page, Math.max(pages - 1, 0));
  const shown = rows.slice(cur * PER_PAGE, (cur + 1) * PER_PAGE);
  if (!rows.length) return null;
  return (
    <div>
      <h3>Остаток долга</h3>
      <BalanceChart rows={rows} loan={loan} />
      <h3 style={{ marginTop: 24 }}>График платежей</h3>
      <div className={styles.wrap}>
        <table className={styles.table}>
          <thead>
            <tr><th scope="col">Месяц</th><th scope="col">Платёж</th><th scope="col">Основной долг</th><th scope="col">Проценты</th><th scope="col">Остаток</th></tr>
          </thead>
          <tbody>
            {shown.map((r) => (
              <tr key={r.month}>
                <th scope="row">{r.month}</th>
                <td>{formatNumber(r.payment)}</td><td>{formatNumber(r.principal)}</td><td>{formatNumber(r.interest)}</td><td>{formatNumber(r.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={styles.pager}>
        <button type="button" className="btn small ghost" disabled={cur === 0} onClick={() => setPage(cur - 1)}>Назад</button>
        <span>Месяцы {cur * PER_PAGE + 1}–{Math.min((cur + 1) * PER_PAGE, rows.length)} из {rows.length}</span>
        <button type="button" className="btn small ghost" disabled={cur >= pages - 1} onClick={() => setPage(cur + 1)}>Дальше</button>
      </div>
      <p className="muted" style={{ fontSize: ".85rem" }}>Суммы в BYN.</p>
    </div>
  );
}
