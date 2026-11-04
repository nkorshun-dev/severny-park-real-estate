import { isCompletePhone } from "./phone-mask";

export interface LeadValues {
  name: string;
  phone: string;
  time: string;
  comment: string;
  consent: boolean;
}

export type LeadErrors = Partial<Record<"name" | "phone" | "consent" | "comment", string>>;

export function validateLead(v: LeadValues): LeadErrors {
  const e: LeadErrors = {};
  const name = v.name.trim();
  if (name.length < 2) e.name = "Введите имя — не короче двух букв";
  else if (!/^[A-Za-zА-Яа-яЁё\s'-]+$/.test(name)) e.name = "Имя может содержать только буквы";
  if (!isCompletePhone(v.phone)) e.phone = "Введите номер полностью: +375 (XX) XXX-XX-XX";
  if (v.comment.length > 500) e.comment = "Комментарий не длиннее 500 символов";
  if (!v.consent) e.consent = "Нужно согласие на обработку данных";
  return e;
}
