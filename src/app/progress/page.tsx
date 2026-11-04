import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Gallery } from "@/components/Gallery";
import { BUILDINGS } from "@/data/buildings";
import styles from "../inner.module.css";

export const metadata: Metadata = {
  title: "Ход строительства",
  description: "Как строится ЖК «Северный парк»: фотоотчёты по месяцам и готовность каждого корпуса.",
  alternates: { canonical: "/progress/" },
};

export default function ProgressPage() {
  return (
    <div className="container">
      <Breadcrumbs items={[{ label: "Ход строительства" }]} />
      <div className={styles.head}>
        <h1>Ход строительства</h1>
        <p className="lead">Обновляем раздел раз в месяц. Иллюстрации показывают этап работ на дату записи.</p>
      </div>
      <ul className={styles.cards} aria-label="Готовность корпусов">
        {BUILDINGS.map((b) => (
          <li key={b.id} className={styles.card}>
            <h2 style={{ fontSize: "1.2rem" }}>{b.name}</h2>
            <div className={styles.stat}>{b.progress}%</div>
            <div className={styles.bar} role="progressbar" aria-valuenow={b.progress} aria-valuemin={0} aria-valuemax={100} aria-label={`Готовность ${b.name}`}>
              <i style={{ width: `${b.progress}%` }} />
            </div>
            <p className="muted">Сдача {b.deadline}</p>
          </li>
        ))}
      </ul>
      <h2 style={{ margin: "48px 0 20px" }}>По месяцам</h2>
      <Gallery />
      <div style={{ height: 96 }} />
    </div>
  );
}
