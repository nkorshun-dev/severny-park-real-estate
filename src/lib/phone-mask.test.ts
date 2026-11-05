import { describe, expect, it } from "vitest";
import { editPhone, maskPhone } from "./phone-mask";

describe("маска телефона", () => {
  it("набранный по символам префикс 375/80 не становится кодом оператора", () => {
    expect(maskPhone("+375 (375")).toBe("");
    expect(maskPhone("+375 (80")).toBe("");
    expect(maskPhone("+375 (8")).toBe("+375 (8");
    expect(maskPhone("80291234567")).toBe("+375 (29) 123-45-67");
    expect(maskPhone("+375 29 123-45-67")).toBe("+375 (29) 123-45-67");
  });
  it("вставка поверх выделенного номера не теряет цифру", () => {
    const prev = "+375 (29) 123-45-67";
    for (const t of ["+375 29 123-45-67", "80291234567", "+375291234567"]) expect(editPhone(t, t.length, prev).value).toBe(prev);
  });
});
