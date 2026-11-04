import Link from "next/link";
import styles from "./Breadcrumbs.module.css";

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Хлебные крошки" className={styles.nav}>
      <ol>
        <li><Link href="/">Главная</Link></li>
        {items.map((it, i) => (
          <li key={it.label}>
            {it.href && i < items.length - 1 ? <Link href={it.href}>{it.label}</Link> : <span aria-current="page">{it.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
