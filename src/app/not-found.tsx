import Link from "next/link";
import styles from "./inner.module.css";

export const metadata = { title: "Страница не найдена" };

export default function NotFound() {
  return (
    <div className={`container ${styles.notfound}`}>
      <p className="tag">404</p>
      <h1>Такой страницы нет</h1>
      <p className="lead" style={{ margin: "0 auto 24px" }}>Возможно, квартира уже продана или ссылка устарела.</p>
      <Link href="/flats/" className="btn">Открыть каталог</Link>
    </div>
  );
}
