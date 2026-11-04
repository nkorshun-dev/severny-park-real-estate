"use client";

import { useState } from "react";
import { flatById } from "@/data/flats";
import type { Flat } from "@/data/types";
import { FINISH_LABEL, FEATURE_LABEL, formatArea, plural, roomsLabel } from "@/lib/format";
import { useCompare } from "@/lib/storage";
import { Modal } from "./Modal";
import { useMoney } from "./Price";
import Link from "next/link";
import styles from "./CompareBar.module.css";

export function CompareBar() {
  const { list, toggle, clear } = useCompare();
  const [open, setOpen] = useState(false);
  const money = useMoney();
  const items = list.map(flatById).filter((f): f is Flat => Boolean(f));
  if (!items.length) return null;
  const rows: [string, (f: Flat) => string][] = [
    ["Комнат", (f) => roomsLabel(f.rooms)],
    ["Площадь", (f) => formatArea(f.area)],
    ["Цена", (f) => money(f.price)],
    ["Цена за м²", (f) => money(f.ppm2)],
    ["Этаж", (f) => `${f.floor} из ${f.floors}`],
    ["Корпус, подъезд", (f) => `${f.building}, ${f.entrance}`],
    ["Отделка", (f) => FINISH_LABEL[f.finish]],
    ["Срок сдачи", (f) => f.deadline],
    ["Особенности", (f) => f.features.map((x) => FEATURE_LABEL[x]).join(", ")],
  ];
  return (
    <>
      <div className={styles.bar} role="region" aria-label="Сравнение квартир">
        <span>В сравнении: {items.length} {plural(items.length, ["квартира", "квартиры", "квартир"])} из 3</span>
        <span className={styles.btns}>
          <button type="button" className="btn small lime" onClick={() => setOpen(true)} disabled={items.length < 2}>Сравнить</button>
          <button type="button" className="btn small ghost" onClick={clear} style={{ background: "#fff" }}>Очистить</button>
        </span>
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title="Сравнение квартир" wide>
        <div className={styles.scroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col"><span className="sr-only">Параметр</span></th>
                {items.map((f) => (
                  <th scope="col" key={f.id}>
                    <Link href={`/flats/${f.id}/`}>Кв. {f.number}</Link>
                    <button type="button" className={styles.remove} onClick={() => toggle(f.id)}>Убрать</button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(([label, fn]) => (
                <tr key={label}>
                  <th scope="row">{label}</th>
                  {items.map((f) => <td key={f.id}>{fn(f)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>
    </>
  );
}
