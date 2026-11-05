/** Оставляет только цифры национального номера (без кода 375), максимум 9. */
// «+375» маски (или его стёртая часть) — не номер; затем снимаем набранный пользователем 375/80:
// кодов оператора на 37 и 80 нет, поэтому «+375 (375…» и «+375 (80…» — это префикс, а не номер.
export function nationalDigits(input: string): string {
  return input.replace(/^\s*\+(375|37|3)?/, "").replace(/\D/g, "").replace(/^375/, "").replace(/^80/, "").slice(0, 9);
}

/** +375 (29) 123-45-67 */
export function maskPhone(input: string): string {
  const d = nationalDigits(input);
  if (!d) return "";
  let out = "+375 (" + d.slice(0, 2);
  if (d.length >= 2) out += ")";
  if (d.length > 2) out += " " + d.slice(2, 5);
  if (d.length > 5) out += "-" + d.slice(5, 7);
  if (d.length > 7) out += "-" + d.slice(7, 9);
  return out;
}

export const isCompletePhone = (input: string) => nationalDigits(input).length === 9;

/** Правка поля с маской: удаление «)», «-» или пробела стирает цифру перед ними; каретка остаётся на месте ввода. */
export function editPhone(raw: string, caret: number, prev: string): { value: string; caret: number } {
  let d = nationalDigits(raw);
  let before = nationalDigits(raw.slice(0, caret)).length;
  // стёрли один знак маски (Backspace/Delete), а не заменили всё поле вставкой — убираем цифру перед ним
  if (raw === prev.slice(0, caret) + prev.slice(caret + 1) && d === nationalDigits(prev) && before > 0) {
    d = d.slice(0, before - 1) + d.slice(before);
    before--;
  }
  const value = maskPhone(d);
  let pos = value.length;
  if (before < d.length) {
    let seen = 0;
    for (pos = 6; pos < value.length && seen < before; pos++) if (/\d/.test(value[pos])) seen++;
  }
  return { value, caret: pos };
}
