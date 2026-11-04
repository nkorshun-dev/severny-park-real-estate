import type { Metadata } from "next";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Chessboard } from "@/components/Chessboard";
import styles from "../inner.module.css";

export const metadata: Metadata = {
  title: "Шахматка корпусов",
  description: "Шахматка ЖК «Северный парк»: выберите корпус и подъезд, посмотрите статус и цену каждой квартиры.",
  alternates: { canonical: "/buildings/" },
};

export default function BuildingsPage() {
  return (
    <div className="container">
      <Breadcrumbs items={[{ label: "Шахматка" }]} />
      <div className={styles.head}>
        <h1>Шахматка</h1>
        <p className="lead">Каждая ячейка — квартира: комнатность, площадь и цена. Нажмите на свободную, чтобы увидеть карточку.</p>
      </div>
      <Suspense fallback={<p className="muted" style={{ minHeight: 500 }}>Загружаем шахматку…</p>}>
        <Chessboard />
      </Suspense>
      <div style={{ height: 96 }} />
    </div>
  );
}
