import type { Metadata } from "next";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Catalog } from "@/components/Catalog";
import styles from "../inner.module.css";

export const metadata: Metadata = {
  title: "Каталог квартир",
  description: "Квартиры в ЖК «Северный парк»: фильтры по цене, площади, этажу, корпусу и отделке, планировки и сравнение.",
  alternates: { canonical: "/flats/" },
};

export default function FlatsPage() {
  return (
    <div className="container">
      <Breadcrumbs items={[{ label: "Квартиры" }]} />
      <div className={styles.head}>
        <h1>Каталог квартир</h1>
        <p className="lead">Свободные и забронированные квартиры. Ссылку с выбранными фильтрами можно отправить коллеге — откроется то же состояние.</p>
      </div>
      <Suspense fallback={<p className="muted" style={{ minHeight: 600 }}>Загружаем каталог…</p>}>
        <Catalog />
      </Suspense>
      <div style={{ height: 96 }} />
    </div>
  );
}
