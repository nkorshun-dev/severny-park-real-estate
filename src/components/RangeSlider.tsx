"use client";

import { useState } from "react";
import styles from "./RangeSlider.module.css";

interface Props {
  label: string;
  min: number;
  max: number;
  step?: number;
  value: [number, number];
  onChange: (v: [number, number]) => void; // вызывается, когда пользователь закончил движение
  format?: (n: number) => string;
}

// Двойной ползунок: два накладывающихся input[type=range]. Работает с клавиатурой (стрелки, Home/End).
// Пока ползунок тянут, значение живёт в локальном состоянии, в URL оно уходит по окончании.
export function RangeSlider({ label, min, max, step = 1, value, onChange, format = String }: Props) {
  // Черновик действует, пока значение из URL не изменилось: иначе быстрые нажатия стрелок теряют шаги.
  const [d, setD] = useState<{ v: [number, number]; base: string } | null>(null);
  const base = value.join();
  const draft = d && d.base === base ? d.v : null;
  const setDraft = (v: [number, number]) => setD({ v, base });
  const [lo, hi] = draft ?? value;
  const pct = (n: number) => ((n - min) / (max - min)) * 100;
  const commit = () => {
    if (draft && (draft[0] !== value[0] || draft[1] !== value[1])) onChange(draft);
  };
  return (
    <div className={styles.wrap} role="group" aria-label={label}>
      <div className={styles.values}>
        <span>{format(lo)}</span>
        <span>{format(hi)}</span>
      </div>
      <div className={styles.track}>
        <div className={styles.fill} style={{ left: `${pct(lo)}%`, right: `${100 - pct(hi)}%` }} />
        <input
          type="range" min={min} max={max} step={step} value={lo} aria-label={`${label}: от`}
          onChange={(e) => setDraft([Math.min(Number(e.target.value), hi), hi])}
          onPointerUp={commit} onKeyUp={commit} onBlur={commit}
        />
        <input
          type="range" min={min} max={max} step={step} value={hi} aria-label={`${label}: до`}
          onChange={(e) => setDraft([lo, Math.max(Number(e.target.value), lo)])}
          onPointerUp={commit} onKeyUp={commit} onBlur={commit}
        />
      </div>
    </div>
  );
}
