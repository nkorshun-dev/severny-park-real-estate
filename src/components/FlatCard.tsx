"use client";

import Link from "next/link";
import { LAYOUT_BY_ID } from "@/data/layouts";
import type { Flat } from "@/data/types";
import { FINISH_LABEL, STATUS_LABEL, formatArea, roomsLabel } from "@/lib/format";
import { useCompare, useFavorites } from "@/lib/storage";
import { LayoutSvg } from "./LayoutSvg";
import { Price, useMoney } from "./Price";
import { showToast } from "./Toast";
import styles from "./FlatCard.module.css";

export function FlatCard({ flat }: { flat: Flat }) {
  const fav = useFavorites();
  const cmp = useCompare();
  const money = useMoney();
  const layout = LAYOUT_BY_ID[flat.layoutId];
  const isFav = fav.list.includes(flat.id);
  const isCmp = cmp.list.includes(flat.id);
  const title = `${roomsLabel(flat.rooms)}, ${formatArea(flat.area)}, кв. ${flat.number}`;
  return (
    <article className={styles.card} aria-label={title}>
      <div className={styles.plan}>
        <span className={`${styles.status} ${styles[flat.status]}`}>{STATUS_LABEL[flat.status]}</span>
        <LayoutSvg layout={layout} labels="area" title={`Планировка квартиры ${flat.number}`} />
      </div>
      <div className={styles.body}>
        <h3 className={styles.title}>{roomsLabel(flat.rooms)}, {formatArea(flat.area)}</h3>
        <p className={styles.meta}>
          Корпус {flat.building} · {flat.floor}/{flat.floors} этаж · {FINISH_LABEL[flat.finish].toLowerCase()}
        </p>
        <p className={styles.price}><Price byn={flat.price} /></p>
        <p className={styles.meta}>{money(flat.ppm2)} за м² · сдача {flat.deadline}</p>
        <div className={styles.actions}>
          <Link href={`/flats/${flat.id}/`} className="btn small">Подробнее</Link>
          <button type="button" className={`${styles.icon} ${isFav ? styles.on : ""}`} aria-pressed={isFav}
            onClick={() => { fav.toggle(flat.id); showToast(isFav ? "Убрано из избранного" : "Добавлено в избранное"); }}>
            {isFav ? "♥" : "♡"}<span className="sr-only">В избранное, квартира {flat.number}</span>
          </button>
          <button type="button" className={`${styles.cmp} ${isCmp ? styles.on : ""}`} aria-pressed={isCmp}
            onClick={() => { if (!cmp.toggle(flat.id)) showToast("В сравнении не больше 3 квартир"); }}>
            {isCmp ? "В сравнении" : "Сравнить"}<span className="sr-only"> квартиру {flat.number}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
