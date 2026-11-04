"use client";

import Link from "next/link";
import { useState } from "react";
import { flats } from "@/data/flats";
import { applyFilters, BOUNDS, DEFAULT_FILTERS, filtersToParams } from "@/lib/filters";
import { formatNumber, plural } from "@/lib/format";
import styles from "./QuickPick.module.css";

export function QuickPick() {
  const [rooms, setRooms] = useState<number[]>([]);
  const [priceMax, setPriceMax] = useState<number>(BOUNDS.price[1]);
  // тот же applyFilters, что и в каталоге, поэтому счётчик совпадает
  const f = { ...DEFAULT_FILTERS, rooms, priceMax };
  const count = applyFilters(flats, f).length;
  const qs = filtersToParams(f).toString();
  return (
    <form className={styles.box} onSubmit={(e) => e.preventDefault()} aria-label="Быстрый подбор">
      <fieldset className={styles.fs}>
        <legend>Комнатность</legend>
        <div className={styles.chips}>
          {[0, 1, 2, 3, 4].map((r) => (
            <button key={r} type="button" aria-pressed={rooms.includes(r)} onClick={() => setRooms(rooms.includes(r) ? rooms.filter((x) => x !== r) : [...rooms, r])}>
              {r === 0 ? "Студия" : r}
            </button>
          ))}
        </div>
      </fieldset>
      <div className={styles.fs}>
        <label htmlFor="qp-price">Цена до: <b>{formatNumber(priceMax)} BYN</b></label>
        <input id="qp-price" type="range" min={BOUNDS.price[0]} max={BOUNDS.price[1]} step={5000} value={priceMax} onChange={(e) => setPriceMax(Number(e.target.value))} />
      </div>
      <Link href={qs ? `/flats/?${qs}` : "/flats/"} className="btn lime">
        Показать {count} {plural(count, ["квартиру", "квартиры", "квартир"])}
      </Link>
    </form>
  );
}
