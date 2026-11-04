"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { SITE } from "@/data/complex";
import { useFavorites } from "@/lib/storage";
import { CurrencyToggle } from "./Price";
import styles from "./Header.module.css";

const NAV = [
  { href: "/flats/", label: "Квартиры" },
  { href: "/buildings/", label: "Шахматка" },
  { href: "/mortgage/", label: "Ипотека" },
  { href: "/progress/", label: "Ход строительства" },
  { href: "/about/", label: "О застройщике" },
  { href: "/contacts/", label: "Контакты" },
];

export function Header() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const fav = useFavorites();
  return (
    <header className={styles.header}>
      <a href="#main" className="skip">К содержимому</a>
      <div className={`container ${styles.row}`}>
        <Link href="/" className={styles.logo} onClick={() => setOpen(false)}>
          <span className={styles.mark} aria-hidden="true" />Северный парк
        </Link>
        <button type="button" className={styles.burger} aria-expanded={open} aria-controls="main-nav" onClick={() => setOpen(!open)}>
          {open ? "Закрыть" : "Меню"}
        </button>
        <nav id="main-nav" aria-label="Основная" className={`${styles.nav} ${open ? styles.open : ""}`}>
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} aria-current={path === n.href ? "page" : undefined} onClick={() => setOpen(false)}>{n.label}</Link>
          ))}
          <span className={styles.tools}>
            <CurrencyToggle />
            <Link href="/flats/?fav=1" onClick={() => setOpen(false)} className={styles.fav}>♥ Избранное ({fav.list.length})</Link>
            <a href={`tel:${SITE.phone.replace(/[^\d+]/g, "")}`} className={styles.phone}>{SITE.phone}</a>
          </span>
        </nav>
      </div>
    </header>
  );
}
