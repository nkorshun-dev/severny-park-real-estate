import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BUILDINGS } from "@/data/buildings";
import { SITE } from "@/data/complex";
import { flatById, flats } from "@/data/flats";
import { LAYOUT_BY_ID } from "@/data/layouts";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FloorPlan } from "@/components/FloorPlan";
import { FlatCard } from "@/components/FlatCard";
import { LayoutSvg } from "@/components/LayoutSvg";
import { LeadForm } from "@/components/LeadForm";
import { MortgageCalculator } from "@/components/MortgageCalculator";
import { Price, RateNote } from "@/components/Price";
import { FEATURE_LABEL, FINISH_LABEL, STATUS_LABEL, formatArea, formatBYN, formatNumber, roomsLabel } from "@/lib/format";
import styles from "../../inner.module.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return flats.map((f) => ({ id: f.id }));
}

type Props = { params: Promise<{ id: string }> };

const titleOf = (f: NonNullable<ReturnType<typeof flatById>>) =>
  `${f.rooms === 0 ? "Студия" : `${f.rooms}-комнатная квартира`} ${formatArea(f.area)}, ${f.floor} этаж, корпус ${f.building}`;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const f = flatById(id);
  if (!f) return {};
  const title = `${titleOf(f)} — кв. ${f.number}`;
  const description = `${titleOf(f)}. ${formatBYN(f.price)}, ${formatNumber(f.ppm2)} BYN за м², ${FINISH_LABEL[f.finish].toLowerCase()}, сдача ${f.deadline}. ЖК «Северный парк», Минск.`;
  return {
    title, description,
    alternates: { canonical: `/flats/${f.id}/` },
    openGraph: { title, description, type: "website", url: `/flats/${f.id}/` },
  };
}

export default async function FlatPage({ params }: Props) {
  const { id } = await params;
  const flat = flatById(id);
  if (!flat) notFound();
  const layout = LAYOUT_BY_ID[flat.layoutId];
  const building = BUILDINGS.find((b) => b.id === flat.building)!;
  const floorFlats = flats.filter((f) => f.building === flat.building && f.entrance === flat.entrance && f.floor === flat.floor);
  const similar = flats
    .filter((f) => f.id !== flat.id && f.status !== "sold" && f.rooms === flat.rooms)
    .sort((a, b) => Math.abs(a.price - flat.price) - Math.abs(b.price - flat.price))
    .slice(0, 3);
  const sold = flat.status === "sold";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Apartment",
    name: titleOf(flat),
    url: `${SITE.url}/flats/${flat.id}/`,
    numberOfRooms: flat.rooms || 1,
    floorSize: { "@type": "QuantitativeValue", value: flat.area, unitCode: "MTK" },
    floorLevel: String(flat.floor),
    address: { "@type": "PostalAddress", addressLocality: "Минск", addressCountry: "BY", streetAddress: SITE.address },
    offers: {
      "@type": "Offer", price: flat.price, priceCurrency: "BYN",
      availability: sold ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
    },
  };

  return (
    <div className="container">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumbs items={[{ label: "Квартиры", href: "/flats/" }, { label: `Кв. ${flat.number}, корпус ${flat.building}` }]} />
      <div className={styles.head}>
        <h1>{roomsLabel(flat.rooms)}, {formatArea(flat.area)}</h1>
        <p className="lead">Квартира № {flat.number}, {building.name.toLowerCase()}, подъезд {flat.entrance}, {flat.floor} этаж из {flat.floors}</p>
      </div>

      {sold && (
        <div className={styles.notice} role="status">
          Эта квартира продана. Ниже — похожие варианты, которые ещё в продаже.
        </div>
      )}

      <div className={styles.flat}>
        <div>
          <figure className={styles.planBox} style={{ margin: 0 }}>
            <LayoutSvg layout={layout} />
            <figcaption>Схема планировки «{layout.name}», не в масштабе. Площади комнат указаны в м².</figcaption>
          </figure>
          <h2 style={{ marginTop: 40, fontSize: "1.5rem" }}>Расположение на этаже</h2>
          <div className={styles.planBox} style={{ maxWidth: 520 }}>
            <FloorPlan current={flat} floorFlats={floorFlats} />
          </div>
        </div>

        <div className={styles.sticky}>
          <span className="tag">{STATUS_LABEL[flat.status]}</span>
          <p className={styles.price}><Price byn={flat.price} /></p>
          <p className="muted"><Price byn={flat.ppm2} /> за м² · <RateNote /></p>
          <dl className={styles.specs}>
            <div><dt>Общая площадь</dt><dd>{formatArea(flat.area)}</dd></div>
            <div><dt>Комнат</dt><dd>{flat.rooms === 0 ? "Студия" : flat.rooms}</dd></div>
            <div><dt>Этаж</dt><dd>{flat.floor} из {flat.floors}</dd></div>
            <div><dt>Корпус, подъезд</dt><dd>{flat.building}, {flat.entrance}</dd></div>
            <div><dt>Отделка</dt><dd>{FINISH_LABEL[flat.finish]}</dd></div>
            <div><dt>Срок сдачи</dt><dd>{flat.deadline}</dd></div>
            <div><dt>Окна выходят на</dt><dd>{flat.side}</dd></div>
            <div><dt>Вид из окон</dt><dd>{flat.view}</dd></div>
          </dl>
          <ul className={styles.chips} aria-label="Особенности">
            {flat.features.map((x) => <li key={x}>{FEATURE_LABEL[x]}</li>)}
          </ul>
          {!sold && (
            <LeadForm
              title={flat.status === "free" ? "Забронировать на 3 дня" : "Записаться на просмотр шоурума"}
              submitLabel={flat.status === "free" ? "Забронировать" : "Записаться"}
              context={`Квартира № ${flat.number}, ${roomsLabel(flat.rooms)}, ${formatArea(flat.area)}`}
            />
          )}
        </div>
      </div>

      <section style={{ marginTop: 64 }} aria-labelledby="mort">
        <h2 id="mort">Ипотека для этой квартиры</h2>
        <MortgageCalculator initialPrice={flat.price} />
        <p><Link href="/mortgage/">Полный калькулятор с графиком платежей</Link></p>
      </section>

      <section style={{ margin: "64px 0 96px" }} aria-labelledby="sim">
        <h2 id="sim">Похожие квартиры</h2>
        <ul className={styles.similar}>
          {similar.map((f) => <li key={f.id}><FlatCard flat={f} /></li>)}
        </ul>
      </section>
    </div>
  );
}
