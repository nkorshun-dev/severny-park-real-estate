const nf = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 });

export const formatNumber = (n: number) => nf.format(Math.round(n));
export const formatBYN = (n: number) => `${formatNumber(n)} BYN`;
export const formatUSD = (n: number) => `${formatNumber(n)} $`;
export const formatArea = (n: number) => `${n.toFixed(1).replace(".", ",")} м²`;
export const roomsLabel = (r: number) => (r === 0 ? "Студия" : `${r}-комн.`);

export function plural(n: number, forms: [string, string, string]) {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return forms[0];
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return forms[1];
  return forms[2];
}

export const formatDate = (iso: string) =>
  new Date(iso + "T12:00:00Z").toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

export const FINISH_LABEL = { none: "Без отделки", rough: "Под чистовую", full: "С отделкой" } as const;
export const STATUS_LABEL = { free: "Свободна", reserved: "Бронь", sold: "Продана" } as const;
export const FEATURE_LABEL = {
  balcony: "Балкон", loggia: "Лоджия", twoBath: "Две ванные",
  wardrobe: "Гардеробная", forest: "Вид на лес", corner: "Угловая",
} as const;
