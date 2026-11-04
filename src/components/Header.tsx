"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SITE } from "@/data/complex";
import { useFavorites } from "@/lib/storage";
import { CurrencyToggle } from "./Price";
import styles from "./Header.module.css";

// main — всегда в строке на широких экранах; extra — на среднем размере уходят в меню
const NAV = [
  { href: "/flats/", label: "Квартиры", main: true },
  { href: "/buildings/", label: "Шахматка", main: true },
  { href: "/mortgage/", label: "Ипотека", main: true },
  { href: "/progress/", label: "Ход строительства", main: false },
  { href: "/about/", label: "О застройщике", main: false },
  { href: "/contacts/", label: "Контакты", main: true },
];

function Tools({ onNav }: { onNav: () => void }) {
  const fav = useFavorites();
  return (
    <>
      <CurrencyToggle />
      <Link href="/flats/?fav=1" onClick={onNav} className={styles.fav}>♥ Избранное ({fav.list.length})</Link>
      <span className={`demo-link ${styles.phone}`} aria-label={`Телефон ${SITE.phone} (в демо не активно)`} title="Демо-проект: ссылка не активна">{SITE.phone}</span>
    </>
  );
}

export function Header() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const burger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpen(false); burger.current?.focus(); }
    };
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!panel.current?.contains(t) && !burger.current?.contains(t)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    // фокус на первый видимый пункт меню
    const first = Array.from(panel.current?.querySelectorAll<HTMLElement>("a,button") ?? []).find((el) => el.offsetParent !== null);
    first?.focus();
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("mousedown", onDown); };
  }, [open]);

  return (
    <header className={styles.header}>
      <a href="#main" className="skip">К содержимому</a>
      <div className={`container ${styles.row}`}>
        <Link href="/" className={styles.logo} onClick={close}>
          <span className={styles.mark} aria-hidden="true" />Северный парк
        </Link>
        <nav aria-label="Основная" className={styles.nav}>
          {NAV.filter((n) => n.main).map((n) => (
            <Link key={n.href} href={n.href} aria-current={path === n.href ? "page" : undefined}>{n.label}</Link>
          ))}
        </nav>
        <div className={styles.tools}><Tools onNav={close} /></div>
        <button ref={burger} type="button" className={styles.burger} aria-expanded={open} aria-controls="menu-panel" onClick={() => setOpen(!open)}>
          {open ? "Закрыть" : "Меню"}
        </button>
      </div>
      <div className="container">
        <div id="menu-panel" ref={panel} className={`${styles.panel} ${open ? styles.open : ""}`} hidden={!open}>
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className={n.main ? styles.mainLink : undefined} aria-current={path === n.href ? "page" : undefined} onClick={close}>{n.label}</Link>
          ))}
          <div className={styles.ptools}><Tools onNav={close} /></div>
        </div>
      </div>
    </header>
  );
}
