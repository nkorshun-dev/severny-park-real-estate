"use client";

import { useEffect, useState } from "react";
import styles from "./Toast.module.css";

type Listener = (msg: string) => void;
const listeners = new Set<Listener>();

export const showToast = (msg: string) => listeners.forEach((l) => l(msg));

export function ToastHost() {
  const [msg, setMsg] = useState("");
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const l: Listener = (m) => {
      setMsg(m);
      clearTimeout(timer);
      timer = setTimeout(() => setMsg(""), 3500);
    };
    listeners.add(l);
    return () => { listeners.delete(l); clearTimeout(timer); };
  }, []);
  return (
    <div className={styles.host} role="status" aria-live="polite">
      {msg && <div className={styles.toast}>{msg}</div>}
    </div>
  );
}
