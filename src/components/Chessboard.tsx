"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { BUILDINGS } from "@/data/buildings";
import { flats } from "@/data/flats";
import type { Flat } from "@/data/types";
import { FINISH_LABEL, STATUS_LABEL, formatArea, formatNumber, roomsLabel } from "@/lib/format";
import { useMoney } from "./Price";
import styles from "./Chessboard.module.css";

export function Chessboard() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const money = useMoney();
  const bId = Number(sp.get("b"));
  const building = BUILDINGS.find((b) => b.id === bId) ?? BUILDINGS[0];
  const [entrance, setEntrance] = useState(0); // 0 = все подъезды
  const [rooms, setRooms] = useState<number[]>([]);
  const [selected, setSelected] = useState<Flat | null>(null);

  const list = flats.filter((f) => f.building === building.id);
  const entrances = entrance ? [entrance] : Array.from({ length: building.entrances }, (_, i) => i + 1);
  const floors = Array.from({ length: building.floors }, (_, i) => building.floors - i);
  const find = (e: number, fl: number, p: number) => list.find((f) => f.entrance === e && f.floor === fl && f.position === p)!;

  function pickBuilding(id: number) {
    setSelected(null);
    setEntrance(0);
    router.replace(`${pathname}?b=${id}`, { scroll: false });
  }

  // Стрелки двигают фокус по ячейкам, пропуская проданные и забронированные (они отключены).
  function arrows(e: React.KeyboardEvent<HTMLDivElement>) {
    const cols = entrances.length * 4;
    const step = ({ ArrowLeft: -1, ArrowRight: 1, ArrowUp: -cols, ArrowDown: cols } as Record<string, number>)[e.key];
    if (!step || !(e.target instanceof HTMLButtonElement)) return;
    const cells = [...e.currentTarget.querySelectorAll<HTMLButtonElement>("button[aria-pressed]")];
    let j = cells.indexOf(e.target) + step;
    while (cells[j]?.disabled) j += step;
    if (cells[j]) { e.preventDefault(); cells[j].focus(); }
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.controls}>
        <div role="group" aria-label="Корпус" className={styles.seg}>
          {BUILDINGS.map((b) => (
            <button key={b.id} type="button" aria-pressed={b.id === building.id} onClick={() => pickBuilding(b.id)}>{b.name}</button>
          ))}
        </div>
        <div role="group" aria-label="Подъезд" className={styles.seg}>
          {[0, ...Array.from({ length: building.entrances }, (_, i) => i + 1)].map((e) => (
            <button key={e} type="button" aria-pressed={entrance === e} onClick={() => { setEntrance(e); setSelected(null); }}>
              {e === 0 ? "Все подъезды" : `Подъезд ${e}`}
            </button>
          ))}
        </div>
        <div role="group" aria-label="Комнатность" className={styles.seg}>
          {[0, 1, 2, 3, 4].map((r) => (
            <button key={r} type="button" aria-pressed={rooms.includes(r)}
              onClick={() => setRooms(rooms.includes(r) ? rooms.filter((x) => x !== r) : [...rooms, r])}>
              {r === 0 ? "Студия" : `${r}-комн.`}
            </button>
          ))}
        </div>
      </div>
      <p className="muted">
        {building.name}: {building.floors} этажей, сдача {building.deadline}, готовность {building.progress}%.
        Фильтр по комнатности приглушает неподходящие квартиры.
      </p>
      <ul className={styles.legend} aria-label="Легенда">
        <li><i style={{ background: "var(--free)" }} />Свободна</li>
        <li><i style={{ background: "var(--reserved)" }} />Бронь</li>
        <li><i style={{ background: "var(--sold)" }} />Продана</li>
      </ul>

      <div className={styles.cols}>
        <div className={styles.scroll} tabIndex={0} role="region" onKeyDown={arrows} aria-label={`Шахматка: ${building.name}`}>
          <div className={styles.grid} style={{ gridTemplateColumns: `48px repeat(${entrances.length * 4}, minmax(84px, 1fr))` }}>
            <div className={`${styles.floorHead} ${styles.sticky}`} aria-hidden="true">Этаж</div>
            {entrances.map((e) => (
              <div key={e} className={styles.entHead} style={{ gridColumn: "span 4" }}>Подъезд {e}</div>
            ))}
            {floors.map((fl) => (
              <Row key={fl} floor={fl} entrances={entrances} find={find} rooms={rooms} selected={selected} onPick={setSelected} money={money} />
            ))}
          </div>
        </div>

        <aside className={styles.panel} aria-live="polite">
          {selected ? (
            <>
              <p className="tag">Свободна</p>
              <h2 className={styles.pTitle}>{roomsLabel(selected.rooms)}, {formatArea(selected.area)}</h2>
              <p className="muted">Кв. {selected.number}, {selected.floor} этаж из {selected.floors}, подъезд {selected.entrance}</p>
              <p className={styles.pPrice}>{money(selected.price)}</p>
              <p className="muted">{money(selected.ppm2)} за м² · {FINISH_LABEL[selected.finish].toLowerCase()} · сдача {selected.deadline}</p>
              <Link href={`/flats/${selected.id}/`} className="btn">Открыть квартиру</Link>
            </>
          ) : (
            <p className="muted">Выберите свободную квартиру в шахматке — здесь появится карточка.</p>
          )}
        </aside>
      </div>
    </div>
  );
}

function Row({ floor, entrances, find, rooms, selected, onPick, money }: {
  floor: number; entrances: number[]; find: (e: number, f: number, p: number) => Flat; rooms: number[];
  selected: Flat | null; onPick: (f: Flat) => void; money: (n: number) => string;
}) {
  return (
    <>
      <div className={`${styles.floorNum} ${styles.sticky}`}>{floor}</div>
      {entrances.flatMap((e) =>
        [0, 1, 2, 3].map((p) => {
          const f = find(e, floor, p);
          const free = f.status === "free";
          const dim = rooms.length > 0 && !rooms.includes(f.rooms);
          return (
            <button
              key={f.id} type="button" disabled={!free}
              aria-pressed={selected?.id === f.id}
              aria-label={`Квартира ${f.number}, ${roomsLabel(f.rooms)}, ${formatArea(f.area)}, ${f.floor} этаж, подъезд ${e}, ${STATUS_LABEL[f.status].toLowerCase()}${free ? `, ${formatNumber(f.price)} BYN` : ""}`}
              className={`${styles.cell} ${styles[f.status]} ${dim ? styles.dim : ""} ${selected?.id === f.id ? styles.sel : ""}`}
              onClick={() => onPick(f)}
            >
              <b>{f.rooms === 0 ? "Ст" : `${f.rooms}к`} · {f.area.toFixed(1).replace(".", ",")}</b>
              <span>{free ? money(f.price).replace(" BYN", "") : STATUS_LABEL[f.status]}</span>
            </button>
          );
        })
      )}
    </>
  );
}
