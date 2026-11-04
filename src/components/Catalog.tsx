"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { flats } from "@/data/flats";
import { applyFilters, filtersToParams, parseFilters, SORTS, type Filters, type SortKey } from "@/lib/filters";
import { FINISH_LABEL, formatArea, plural, roomsLabel } from "@/lib/format";
import { useFavorites } from "@/lib/storage";
import { FlatCard } from "./FlatCard";
import { FlatFilters } from "./FlatFilters";
import { CurrencyToggle, Price, RateNote } from "./Price";
import styles from "./Catalog.module.css";

const PAGE_SIZE = 24;

// Состояние каталога целиком живёт в URL: фильтры, сортировка, вид и страница.
export function Catalog() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const fav = useFavorites();
  const filters = useMemo(() => parseFilters((k) => sp.get(k)), [sp]);
  const view = sp.get("view") === "table" ? "table" : "cards";
  const page = Math.max(1, Number(sp.get("page")) || 1);

  const result = useMemo(() => applyFilters(flats, filters, fav.list), [filters, fav.list]);
  const pages = Math.max(1, Math.ceil(result.length / PAGE_SIZE));
  const cur = Math.min(page, pages);
  const shown = result.slice((cur - 1) * PAGE_SIZE, cur * PAGE_SIZE);

  function go(f: Filters, extra: { view?: string; page?: number } = {}) {
    const p = filtersToParams(f);
    const v = extra.view ?? view;
    if (v === "table") p.set("view", "table");
    if (extra.page && extra.page > 1) p.set("page", String(extra.page));
    const qs = p.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }
  const hrefPage = (n: number) => {
    const p = filtersToParams(filters);
    if (view === "table") p.set("view", "table");
    if (n > 1) p.set("page", String(n));
    const qs = p.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  return (
    <div className={styles.layout}>
      <aside className={styles.aside}>
        <FlatFilters filters={filters} onChange={(f) => go(f)} found={result.length} />
      </aside>
      <div>
        <div className={styles.bar}>
          <p className={styles.count} aria-live="polite">
            Найдено {result.length} {plural(result.length, ["квартира", "квартиры", "квартир"])}
          </p>
          <label className={styles.sort}>
            <span>Сортировка</span>
            <select value={filters.sort} onChange={(e) => go({ ...filters, sort: e.target.value as SortKey })}>
              {SORTS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
          </label>
          <div role="group" aria-label="Вид" className={styles.views}>
            <button type="button" aria-pressed={view === "cards"} onClick={() => go(filters, { view: "cards" })}>Карточки</button>
            <button type="button" aria-pressed={view === "table"} onClick={() => go(filters, { view: "table" })}>Таблица</button>
          </div>
          <CurrencyToggle />
        </div>
        <p><RateNote /></p>
        <label className={styles.favOnly}>
          <input type="checkbox" checked={filters.fav} onChange={() => go({ ...filters, fav: !filters.fav })} />
          <span>Только избранное ({fav.list.length})</span>
        </label>

        {result.length === 0 ? (
          <div className={styles.empty}>
            <h2>Ничего не нашлось</h2>
            <p className="muted">{filters.fav ? "В избранном пока пусто или ничего не подходит под фильтры." : "Попробуйте расширить диапазон цены или убрать часть условий."}</p>
            <button type="button" className="btn" onClick={() => router.push(pathname, { scroll: false })}>Сбросить все фильтры</button>
          </div>
        ) : view === "cards" ? (
          <ul className={styles.grid}>
            {shown.map((f) => <li key={f.id}><FlatCard flat={f} /></li>)}
          </ul>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <caption className="sr-only">Квартиры</caption>
              <thead>
                <tr>
                  <th scope="col">Квартира</th><th scope="col">Комнат</th><th scope="col">Площадь</th><th scope="col">Этаж</th>
                  <th scope="col">Корпус</th><th scope="col">Отделка</th><th scope="col">Цена</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((f) => (
                  <tr key={f.id}>
                    <th scope="row"><Link href={`/flats/${f.id}/`}>№ {f.number}</Link></th>
                    <td>{roomsLabel(f.rooms)}</td><td>{formatArea(f.area)}</td><td>{f.floor}/{f.floors}</td>
                    <td>{f.building}</td><td>{FINISH_LABEL[f.finish]}</td><td><Price byn={f.price} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pages > 1 && (
          <nav aria-label="Страницы" className={styles.pager}>
            {cur > 1 && <Link href={hrefPage(cur - 1)} scroll={false} className="btn small ghost">Назад</Link>}
            {Array.from({ length: pages }).map((_, i) => (
              <Link key={i} href={hrefPage(i + 1)} scroll={false} aria-current={cur === i + 1 ? "page" : undefined}
                aria-label={`Страница ${i + 1}`} className={`${styles.pageLink} ${cur === i + 1 ? styles.active : ""}`}>{i + 1}</Link>
            ))}
            {cur < pages && <Link href={hrefPage(cur + 1)} scroll={false} className="btn small ghost">Дальше</Link>}
          </nav>
        )}
      </div>
    </div>
  );
}
