import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { MortgageCalculator } from "@/components/MortgageCalculator";
import styles from "../inner.module.css";

export const metadata: Metadata = {
  title: "Ипотечный калькулятор",
  description: "Рассчитайте платёж по ипотеке на квартиру в ЖК «Северный парк»: аннуитетный и дифференцированный платёж, график платежей и переплата.",
  alternates: { canonical: "/mortgage/" },
};

export default function MortgagePage() {
  return (
    <div className="container">
      <Breadcrumbs items={[{ label: "Ипотека" }]} />
      <div className={styles.head}>
        <h1>Ипотечный калькулятор</h1>
        <p className="lead">Расчёт ориентировочный, условия уточняйте в банке.</p>
      </div>
      <MortgageCalculator full showPrograms />
      <div style={{ height: 96 }} />
    </div>
  );
}
