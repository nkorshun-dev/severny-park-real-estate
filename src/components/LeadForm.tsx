"use client";

import { useId, useState } from "react";
import { editPhone } from "@/lib/phone-mask";
import { validateLead, type LeadErrors } from "@/lib/validation";
import styles from "./LeadForm.module.css";

const TIMES = ["В любое время", "Утром (9–12)", "Днём (12–16)", "Вечером (16–19)"];

export function LeadForm({ title, submitLabel = "Отправить заявку", context }: {
  title: string; submitLabel?: string; context?: string;
}) {
  const uid = useId();
  const [v, setV] = useState({ name: "", phone: "", time: TIMES[0], comment: "", consent: false });
  const [errors, setErrors] = useState<LeadErrors>({});
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [ticket, setTicket] = useState(0);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "sending") return;
    const err = validateLead(v);
    setErrors(err);
    if (Object.keys(err).length) {
      document.getElementById(`${uid}-${Object.keys(err)[0]}`)?.focus();
      return;
    }
    setState("sending");
    // Демо: имитация запроса, ничего никуда не отправляется
    setTimeout(() => {
      setTicket(10000 + Math.floor(Math.random() * 89999));
      setState("done");
    }, 1000);
  }

  function onPhone(e: React.ChangeEvent<HTMLInputElement>) {
    const el = e.currentTarget;
    const r = editPhone(el.value, el.selectionStart ?? el.value.length, v.phone);
    setV({ ...v, phone: r.value });
    setTimeout(() => el.setSelectionRange(r.caret, r.caret), 0); // после того, как React выставит значение
  }

  if (state === "done") {
    return (
      <div className={styles.form} role="status">
        <h3 className={styles.title}>Заявка № {ticket} принята</h3>
        <p>Менеджер позвонит в течение 30 минут в рабочее время.</p>
        <p className={styles.demo}>Демо-режим: данные никуда не отправляются</p>
        <button type="button" className="btn ghost small" onClick={() => { setState("idle"); setV({ ...v, name: "", phone: "", comment: "", consent: false }); }}>Отправить ещё одну</button>
      </div>
    );
  }

  const f = (k: string) => `${uid}-${k}`;
  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      <h3 className={styles.title}>{title}</h3>
      {context && <p className="muted">{context}</p>}
      <div className={styles.field}>
        <label htmlFor={f("name")}>Имя</label>
        <input id={f("name")} autoComplete="name" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })}
          aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? f("name-e") : undefined} />
        {errors.name && <p id={f("name-e")} className={styles.err}>{errors.name}</p>}
      </div>
      <div className={styles.field}>
        <label htmlFor={f("phone")}>Телефон</label>
        <input id={f("phone")} type="tel" inputMode="tel" autoComplete="tel" placeholder="+375 (29) 123-45-67" value={v.phone}
          onChange={onPhone}
          aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? f("phone-e") : undefined} />
        {errors.phone && <p id={f("phone-e")} className={styles.err}>{errors.phone}</p>}
      </div>
      <div className={styles.field}>
        <label htmlFor={f("time")}>Удобное время звонка</label>
        <select id={f("time")} value={v.time} onChange={(e) => setV({ ...v, time: e.target.value })}>
          {TIMES.map((t) => <option key={t}>{t}</option>)}
        </select>
      </div>
      <div className={styles.field}>
        <label htmlFor={f("comment")}>Комментарий</label>
        <textarea id={f("comment")} rows={3} value={v.comment} onChange={(e) => setV({ ...v, comment: e.target.value })}
          aria-invalid={Boolean(errors.comment)} aria-describedby={errors.comment ? f("comment-e") : undefined} />
        {errors.comment && <p id={f("comment-e")} className={styles.err}>{errors.comment}</p>}
      </div>
      <div className={styles.field}>
        <label className={styles.check}>
          <input id={f("consent")} type="checkbox" checked={v.consent} onChange={(e) => setV({ ...v, consent: e.target.checked })}
            aria-invalid={Boolean(errors.consent)} aria-describedby={errors.consent ? f("consent-e") : undefined} />
          <span>Согласен на обработку персональных данных</span>
        </label>
        {errors.consent && <p id={f("consent-e")} className={styles.err}>{errors.consent}</p>}
      </div>
      <button type="submit" className="btn lime" disabled={state === "sending"}>{state === "sending" ? "Отправляем…" : submitLabel}</button>
      <p className={styles.demo}>Демо-режим: данные никуда не отправляются</p>
    </form>
  );
}
