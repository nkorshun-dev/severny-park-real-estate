"use client";

import { useState } from "react";
import { BUILDINGS, DEADLINES } from "@/data/buildings";
import type { Feature, Finish } from "@/data/types";
import { BOUNDS, DEFAULT_FILTERS, type Filters } from "@/lib/filters";
import { FEATURE_LABEL, FINISH_LABEL, formatNumber, roomsLabel } from "@/lib/format";
import { RangeSlider } from "./RangeSlider";
import styles from "./FlatFilters.module.css";

function toggle<T>(list: T[], v: T): T[] {
  return list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
}

function NumField({ label, value, min, max, onCommit }: { label: string; value: number; min: number; max: number; onCommit: (n: number) => void }) {
  const commit = (raw: string) => {
    const n = Number(raw);
    if (raw !== "" && Number.isFinite(n)) onCommit(Math.min(Math.max(Math.round(n), min), max));
  };
  return (
    <label className={styles.num}>
      <span>{label}</span>
      <input
        key={value} type="number" inputMode="numeric" defaultValue={value} min={min} max={max}
        onBlur={(e) => commit(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") commit(e.currentTarget.value); }}
      />
    </label>
  );
}

function Check({ checked, onChange, children }: { checked: boolean; onChange: () => void; children: React.ReactNode }) {
  return (
    <label className={styles.check}>
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span>{children}</span>
    </label>
  );
}

export function FlatFilters({ filters: f, onChange, found }: { filters: Filters; onChange: (f: Filters) => void; found: number }) {
  const [open, setOpen] = useState(false);
  const set = (patch: Partial<Filters>) => onChange({ ...f, ...patch });
  const [p0, p1] = BOUNDS.price, [a0, a1] = BOUNDS.area, [f0, f1] = BOUNDS.floor;
  return (
    <form className={styles.form} onSubmit={(e) => e.preventDefault()} aria-label="Фильтры квартир">
      <button type="button" className={`btn ghost ${styles.toggle}`} aria-expanded={open} aria-controls="filters-body" onClick={() => setOpen(!open)}>
        {open ? "Скрыть фильтры" : "Показать фильтры"}
      </button>
      <div id="filters-body" className={`${styles.body} ${open ? styles.shown : ""}`}>
        <fieldset className={styles.group}>
          <legend>Комнатность</legend>
          <div className={styles.chips}>
            {[0, 1, 2, 3, 4].map((r) => (
              <button key={r} type="button" aria-pressed={f.rooms.includes(r)} className={styles.chip} onClick={() => set({ rooms: toggle(f.rooms, r) })}>
                {r === 0 ? "Студия" : r}
                {r > 0 && <span className="sr-only"> {roomsLabel(r)}</span>}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset className={styles.group}>
          <legend>Цена, BYN</legend>
          <RangeSlider label="Цена" min={p0} max={p1} step={1000} value={[f.priceMin, f.priceMax]} format={formatNumber}
            onChange={([a, b]) => set({ priceMin: a, priceMax: b })} />
          <div className={styles.pair}>
            <NumField label="от" value={f.priceMin} min={p0} max={f.priceMax} onCommit={(n) => set({ priceMin: n })} />
            <NumField label="до" value={f.priceMax} min={f.priceMin} max={p1} onCommit={(n) => set({ priceMax: n })} />
          </div>
        </fieldset>
        <fieldset className={styles.group}>
          <legend>Площадь, м²</legend>
          <RangeSlider label="Площадь" min={a0} max={a1} value={[f.areaMin, f.areaMax]} onChange={([a, b]) => set({ areaMin: a, areaMax: b })} />
        </fieldset>
        <fieldset className={styles.group}>
          <legend>Этаж</legend>
          <div className={styles.pair}>
            <NumField label="от" value={f.floorMin} min={f0} max={f.floorMax} onCommit={(n) => set({ floorMin: n })} />
            <NumField label="до" value={f.floorMax} min={f.floorMin} max={f1} onCommit={(n) => set({ floorMax: n })} />
          </div>
          <Check checked={f.notFirst} onChange={() => set({ notFirst: !f.notFirst })}>Не первый</Check>
          <Check checked={f.notLast} onChange={() => set({ notLast: !f.notLast })}>Не последний</Check>
        </fieldset>
        <fieldset className={styles.group}>
          <legend>Корпус</legend>
          {BUILDINGS.map((b) => (
            <Check key={b.id} checked={f.buildings.includes(b.id)} onChange={() => set({ buildings: toggle(f.buildings, b.id) })}>{b.name}</Check>
          ))}
        </fieldset>
        <fieldset className={styles.group}>
          <legend>Срок сдачи</legend>
          {DEADLINES.map((d) => (
            <Check key={d} checked={f.deadlines.includes(d)} onChange={() => set({ deadlines: toggle(f.deadlines, d) })}>{d}</Check>
          ))}
        </fieldset>
        <fieldset className={styles.group}>
          <legend>Отделка</legend>
          {(Object.keys(FINISH_LABEL) as Finish[]).map((x) => (
            <Check key={x} checked={f.finishes.includes(x)} onChange={() => set({ finishes: toggle(f.finishes, x) })}>{FINISH_LABEL[x]}</Check>
          ))}
        </fieldset>
        <fieldset className={styles.group}>
          <legend>Особенности</legend>
          {(Object.keys(FEATURE_LABEL) as Feature[]).map((x) => (
            <Check key={x} checked={f.features.includes(x)} onChange={() => set({ features: toggle(f.features, x) })}>{FEATURE_LABEL[x]}</Check>
          ))}
        </fieldset>
        <button type="button" className="btn ghost small" onClick={() => onChange({ ...DEFAULT_FILTERS, sort: f.sort })}>Сбросить фильтры</button>
        <p className="muted" aria-live="polite">Найдено: {found}</p>
      </div>
    </form>
  );
}
