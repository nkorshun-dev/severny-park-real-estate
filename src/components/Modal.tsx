"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import styles from "./Modal.module.css";

// Нативный <dialog>: браузер сам держит фокус внутри, закрывает по Esc и возвращает фокус.
export function Modal({ open, onClose, title, children, wide }: {
  open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref} className={`${styles.dialog} ${wide ? styles.wide : ""}`} aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => { if (e.target === ref.current) onClose(); }}
    >
      <div className={styles.head}>
        <h2 id={titleId} className={styles.title}>{title}</h2>
        <button type="button" className={styles.close} onClick={onClose} aria-label="Закрыть">×</button>
      </div>
      {open && <div className={styles.body}>{children}</div>}
    </dialog>
  );
}
