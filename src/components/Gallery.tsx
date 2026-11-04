"use client";

import { useState } from "react";
import { PROGRESS } from "@/data/complex";
import { formatDate } from "@/lib/format";
import { Modal } from "./Modal";
import { StageArt } from "./ProjectArt";
import styles from "./Gallery.module.css";

// Галерея хода строительства: «фото» — иллюстрации, нарисованные кодом по проценту готовности.
export function Gallery({ limit }: { limit?: number }) {
  const items = limit ? PROGRESS.slice(0, limit) : PROGRESS;
  const [open, setOpen] = useState<number | null>(null);
  const cur = open !== null ? items[open] : null;
  return (
    <>
      <ul className={styles.grid}>
        {items.map((p, i) => (
          <li key={p.date}>
            <button type="button" className={styles.item} onClick={() => setOpen(i)} aria-label={`Открыть: ${p.title}, ${formatDate(p.date)}`}>
              <StageArt percent={p.percent} label={p.title} />
              <span className={styles.cap}>
                <time dateTime={p.date}>{formatDate(p.date)}</time>
                <strong>{p.title}</strong>
              </span>
            </button>
          </li>
        ))}
      </ul>
      <Modal open={cur !== null} onClose={() => setOpen(null)} title={cur?.title ?? ""} wide>
        {cur && open !== null && (
          <>
            <StageArt percent={cur.percent} label={cur.title} />
            <p className="muted">{formatDate(cur.date)} · этап: {cur.stage} · готовность корпусов: {cur.percent.map((x, i) => `К${i + 1} ${x}%`).join(", ")}</p>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" className="btn small ghost" disabled={open === 0} onClick={() => setOpen(open - 1)}>Новее</button>
              <button type="button" className="btn small ghost" disabled={open === items.length - 1} onClick={() => setOpen(open + 1)}>Старше</button>
            </div>
          </>
        )}
      </Modal>
    </>
  );
}
