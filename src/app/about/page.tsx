import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SITE } from "@/data/complex";
import styles from "../inner.module.css";

export const metadata: Metadata = {
  title: "О застройщике",
  description: "СеверСтрой Девелопмент — вымышленный застройщик ЖК «Северный парк». Как мы строим и чем отвечаем за сроки.",
  alternates: { canonical: "/about/" },
};

const STATS = [
  { v: "14 лет", t: "на рынке" },
  { v: "11", t: "сданных домов" },
  { v: "3 800", t: "семей получили ключи" },
  { v: "0", t: "переносов сдачи в последних трёх домах" },
];

export default function AboutPage() {
  return (
    <div className="container">
      <Breadcrumbs items={[{ label: "О застройщике" }]} />
      <div className={styles.head}>
        <h1>{SITE.developer}</h1>
        <p className="lead">Строим жильё в Минске и области с 2012 года. «Северный парк» — наш первый комплекс с целым кварталом без машин во дворе.</p>
      </div>
      <ul className={styles.cards}>
        {STATS.map((s) => (
          <li key={s.t} className={styles.card}><div className={styles.stat}>{s.v}</div><p>{s.t}</p></li>
        ))}
      </ul>
      <div className={`${styles.prose}`} style={{ margin: "48px 0 96px" }}>
        <h2>Как мы работаем</h2>
        <p>Договор долевого участия, средства на эскроу-счёте, фиксированная цена за квадратный метр на весь срок строительства. Если мы сдвигаем срок, вы узнаёте об этом первыми и получаете компенсацию по договору.</p>
        <h2>Что мы строим сами</h2>
        <p>Монолитный каркас, кладку и инженерию ведёт собственная бригада. Субподрядчики отвечают за лифты, остекление и благоустройство, а приёмку каждого этапа проводит технадзор застройщика.</p>
        <h2>Подход к дворам</h2>
        <p>Машины остаются на периметре и в подземном паркинге. Во дворе — дорожки, площадки и сосны, которые мы сохранили при расчистке участка.</p>
        <p className="muted">Демо-проект для портфолио: застройщик, цифры и тексты вымышлены.</p>
      </div>
    </div>
  );
}
