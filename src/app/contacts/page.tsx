import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { LeadForm } from "@/components/LeadForm";
import { SITE } from "@/data/complex";
import styles from "../inner.module.css";

export const metadata: Metadata = {
  title: "Контакты",
  description: "Офис продаж ЖК «Северный парк»: адрес, часы работы, телефон и карта.",
  alternates: { canonical: "/contacts/" },
};

const d = 0.012;
const bbox = `${SITE.lon - d * 1.6},${SITE.lat - d},${SITE.lon + d * 1.6},${SITE.lat + d}`;
const MAP = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${SITE.lat},${SITE.lon}`;

export default function ContactsPage() {
  return (
    <div className="container">
      <Breadcrumbs items={[{ label: "Контакты" }]} />
      <div className={styles.head}>
        <h1>Контакты</h1>
      </div>
      <div className={styles.two}>
        <div>
          <h2 style={{ fontSize: "1.3rem" }}>Офис продаж</h2>
          <p>{SITE.address}</p>
          <p><a href={`tel:${SITE.phone.replace(/[^\d+]/g, "")}`}><b>{SITE.phone}</b></a></p>
          <p>{SITE.email}</p>
          <p className="muted">{SITE.hours}</p>
          <iframe className={styles.map} title="Карта: офис продаж на OpenStreetMap" src={MAP} loading="lazy" />
          <p className="muted" style={{ fontSize: ".85rem" }}>Карта © участники OpenStreetMap. Адрес вымышленный, метка примерная.</p>
        </div>
        <LeadForm title="Записаться на просмотр шоурума" />
      </div>
      <div style={{ height: 96 }} />
    </div>
  );
}
