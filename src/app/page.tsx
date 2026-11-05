import type { Metadata } from "next";
import Link from "next/link";
import { BUILDINGS } from "@/data/buildings";
import { BUY_METHODS, FACTS, INFRA, NEWS, SITE } from "@/data/complex";
import { flats } from "@/data/flats";
import { LAYOUTS } from "@/data/layouts";
import { Gallery } from "@/components/Gallery";
import { HeroArt } from "@/components/ProjectArt";
import { LayoutSvg } from "@/components/LayoutSvg";
import { LeadForm } from "@/components/LeadForm";
import { QuickPick } from "@/components/QuickPick";
import { formatArea, formatBYN, formatDate, roomsLabel } from "@/lib/format";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: { absolute: "Северный парк — квартиры у Уручского леса в Минске" },
  description: "Жилой комплекс «Северный парк» в Минске: 3 корпуса, 420 квартир, двор без машин, сдача I очереди в III квартале 2027. Каталог, шахматка, ипотека.",
  alternates: { canonical: "/" },
};

const BLD_POS = [
  { x: 60, y: 120, w: 150, h: 70 },
  { x: 250, y: 90, w: 150, h: 70 },
  { x: 150, y: 220, w: 190, h: 70 },
];

function Genplan() {
  return (
    <svg viewBox="0 0 600 340" role="group" aria-label="Генплан комплекса: три корпуса, парк, школа и детский сад" style={{ width: "100%", minWidth: 560, height: "auto", display: "block" }}>
      <rect width={600} height={340} rx={12} fill="#dfe8d5" />
      <path d="M0 40 Q150 20 300 40 T600 30 V0 H0Z" fill="#1f4d3a" opacity={0.85} />
      <text x={300} y={22} textAnchor="middle" fontSize={13} fontWeight={700} fill="#fff">Уручский лес</text>
      <path d="M0 310 H600" stroke="#9aa09a" strokeWidth={14} />
      <text x={20} y={330} fontSize={11} fill="#626862">Дорога</text>
      <ellipse cx={500} cy={190} rx={70} ry={50} fill="#bfd6a8" />
      <text x={500} y={194} textAnchor="middle" fontSize={12} fill="#1f4d3a">Парк</text>
      <rect x={430} y={90} width={90} height={40} rx={6} fill="#cfd3cb" />
      <text x={475} y={114} textAnchor="middle" fontSize={11}>Школа</text>
      <rect x={440} y={255} width={90} height={36} rx={6} fill="#cfd3cb" />
      <text x={485} y={277} textAnchor="middle" fontSize={11}>Детский сад</text>
      <rect x={30} y={225} width={90} height={55} rx={8} fill="#c9d9bb" />
      <text x={75} y={256} textAnchor="middle" fontSize={11}>Двор без машин</text>
      {BUILDINGS.map((b, i) => {
        const p = BLD_POS[i];
        return (
          <Link key={b.id} href={`/buildings/?b=${b.id}`} aria-label={`${b.name} ${b.floors} эт. · ${b.deadline}: открыть шахматку`}>
            <g style={{ cursor: "pointer" }}>
              <rect x={p.x} y={p.y} width={p.w} height={p.h} rx={6} fill="#1f4d3a" stroke="#fff" strokeWidth={3} />
              <text x={p.x + p.w / 2} y={p.y + p.h / 2 - 2} textAnchor="middle" fontSize={15} fontWeight={800} fill="#d7f171">{b.name}</text>
              <text x={p.x + p.w / 2} y={p.y + p.h / 2 + 16} textAnchor="middle" fontSize={11} fill="#fff">{b.floors} эт. · {b.deadline}</text>
            </g>
          </Link>
        );
      })}
    </svg>
  );
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ApartmentComplex",
  name: SITE.name,
  description: "Жилой комплекс у Уручского леса: 3 корпуса, 420 квартир.",
  url: SITE.url,
  numberOfAccommodationUnits: 420,
  address: { "@type": "PostalAddress", addressLocality: "Минск", addressCountry: "BY", streetAddress: SITE.address },
  geo: { "@type": "GeoCoordinates", latitude: SITE.lat, longitude: SITE.lon },
  telephone: SITE.phone,
};

export default function Home() {
  const free = flats.filter((f) => f.status === "free");
  const fromPrice = (id: string) => Math.min(...free.filter((f) => f.layoutId === id).map((f) => f.price));
  const layouts = LAYOUTS.filter((l) => free.some((f) => f.layoutId === l.id));
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className={styles.hero}>
        <div className={`container ${styles.heroGrid}`}>
          <div>
            <p className="tag">Минск, Уручье</p>
            <h1>Квартиры у <em>Уручского леса</em> — сдача I очереди в III квартале 2027</h1>
            <p>Три корпуса, двор без машин и лес в двух минутах пешком. Студии от {formatArea(LAYOUTS[0].area)} и квартиры до {formatArea(LAYOUTS[LAYOUTS.length - 1].area)}.</p>
          </div>
          <div className={styles.art}><HeroArt /></div>
        </div>
        <div className="container">
          <div className={styles.pick}><QuickPick /></div>
        </div>
      </section>
      <div className={styles.afterHero} />

      <section className="section" aria-labelledby="about">
        <div className="container">
          <h2 id="about">О проекте</h2>
          <ul className={styles.facts}>
            {FACTS.map((f) => (
              <li key={f.label} className={styles.fact}>
                <div className={styles.factV}>{f.value}</div>
                <p className={styles.factL}>{f.label}</p>
                <p className="muted">{f.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section soft" aria-labelledby="plan">
        <div className="container">
          <h2 id="plan">Генплан</h2>
          <p className="lead">Нажмите на корпус — откроется шахматка с квартирами.</p>
          <div className={styles.genplan}><Genplan /></div>
          <ul style={{ display: "flex", gap: 12, flexWrap: "wrap", listStyle: "none", padding: 0, marginTop: 16 }}>
            {BUILDINGS.map((b) => <li key={b.id}><Link className="btn small ghost" href={`/buildings/?b=${b.id}`}>{b.name}: шахматка</Link></li>)}
          </ul>
        </div>
      </section>

      <section className="section" aria-labelledby="infra">
        <div className="container">
          <h2 id="infra">Что рядом</h2>
          <ul className={styles.infra}>
            {INFRA.map((i) => (
              <li key={i.name} className={styles.infraItem} style={{ background: "var(--bg-soft)" }}>
                <div className={styles.min}>{i.minutes} мин</div>
                <h3>{i.name}</h3>
                <p className="muted">пешком. {i.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section soft" aria-labelledby="layouts">
        <div className="container">
          <div className={styles.head}>
            <h2 id="layouts">Планировки</h2>
            <Link href="/flats/" className="btn ghost">Все квартиры</Link>
          </div>
          <ul className={styles.layouts}>
            {layouts.map((l) => (
              <li key={l.id}>
                <Link href={`/flats/?rooms=${l.rooms}`} style={{ textDecoration: "none" }} className={styles.layoutCard}>
                  <LayoutSvg layout={l} labels="area" />
                  <h3>{roomsLabel(l.rooms)}, {formatArea(l.area)}</h3>
                  <span className="muted">{l.name}</span>
                  <span className={styles.from}>от {formatBYN(fromPrice(l.id))}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section" aria-labelledby="buy">
        <div className="container">
          <h2 id="buy">Как купить</h2>
          <ul className={styles.buy}>
            {BUY_METHODS.map((m) => (
              <li key={m.title} className={styles.buyItem}>
                <h3>{m.title}</h3>
                <p>{m.text}</p>
                {m.href && <Link href={m.href}>Рассчитать платёж</Link>}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section soft" aria-labelledby="progress">
        <div className="container">
          <div className={styles.head}>
            <h2 id="progress">Ход строительства</h2>
            <Link href="/progress/" className="btn ghost">Все этапы</Link>
          </div>
          <Gallery limit={3} />
        </div>
      </section>

      <section className="section" aria-labelledby="news">
        <div className="container">
          <h2 id="news">Новости</h2>
          <ul className={styles.news}>
            {NEWS.map((n) => (
              <li key={n.title} className={styles.newsItem}>
                <time dateTime={n.date}>{formatDate(n.date)}</time>
                <h3>{n.title}</h3>
                <p className="muted">{n.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section soft" aria-labelledby="contact">
        <div className={`container ${styles.contact}`}>
          <div>
            <h2 id="contact">Отдел продаж</h2>
            <p className="lead">Подберём квартиру под бюджет, покажем шоурум и посчитаем ипотеку.</p>
            <p><span className="demo-link" aria-label={`Телефон ${SITE.phone} (в демо не активно)`} title="Демо-проект: ссылка не активна"><b>{SITE.phone}</b></span></p>
            <p>{SITE.address}</p>
            <p className="muted">{SITE.hours}</p>
          </div>
          <LeadForm title="Подобрать квартиру с менеджером" />
        </div>
      </section>
    </>
  );
}
