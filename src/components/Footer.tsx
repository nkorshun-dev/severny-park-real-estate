import Link from "next/link";
import { DEMO_NOTE, SITE } from "@/data/complex";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        <div>
          <p className={styles.brand}>Северный парк</p>
          <p>{SITE.address}</p>
          <p>Застройщик: {SITE.developer}</p>
        </div>
        <div>
          <p className={styles.h}>Разделы</p>
          <ul>
            <li><Link href="/flats/">Каталог квартир</Link></li>
            <li><Link href="/buildings/">Шахматка</Link></li>
            <li><Link href="/mortgage/">Ипотека</Link></li>
            <li><Link href="/progress/">Ход строительства</Link></li>
          </ul>
        </div>
        <div>
          <p className={styles.h}>Отдел продаж</p>
          <p><a href={`tel:${SITE.phone.replace(/[^\d+]/g, "")}`}>{SITE.phone}</a></p>
          <p>{SITE.email}</p>
          <p>{SITE.hours}</p>
        </div>
      </div>
      <div className={`container ${styles.note}`}>
        <p>{DEMO_NOTE}. Информация на сайте не является публичной офертой.</p>
      </div>
    </footer>
  );
}
