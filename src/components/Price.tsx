"use client";

import { RATE } from "@/data/complex";
import { formatBYN, formatUSD } from "@/lib/format";
import { useCurrency } from "@/lib/storage";

export function useMoney() {
  const [cur] = useCurrency();
  return (byn: number) => (cur === "USD" ? formatUSD(byn / RATE.usd) : formatBYN(byn));
}

export function Price({ byn, className }: { byn: number; className?: string }) {
  const fmt = useMoney();
  return <span className={className}>{fmt(byn)}</span>;
}

export function CurrencyToggle() {
  const [cur, setCur] = useCurrency();
  return (
    <span role="group" aria-label="Валюта" style={{ display: "inline-flex", gap: 4 }}>
      {(["BYN", "USD"] as const).map((c) => (
        <button
          key={c} type="button" aria-pressed={cur === c} onClick={() => setCur(c)}
          style={{
            minHeight: 44, minWidth: 44, padding: "0 12px", borderRadius: 999, cursor: "pointer", fontWeight: 700,
            border: "1px solid var(--accent)", background: cur === c ? "var(--accent)" : "transparent",
            color: cur === c ? "#fff" : "var(--accent)",
          }}
        >
          {c}
        </button>
      ))}
    </span>
  );
}

export function RateNote() {
  return <span className="muted" style={{ fontSize: ".85rem" }}>Курс на {RATE.date}: 1 USD = {String(RATE.usd).replace(".", ",")} BYN</span>;
}
