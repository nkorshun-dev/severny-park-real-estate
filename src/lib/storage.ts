"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { flatById } from "@/data/flats";

// Небольшое общее хранилище поверх localStorage. Все чтения и записи — в try/catch:
// в приватном режиме или при заблокированных данных сайт продолжает работать.
const listeners = new Set<() => void>();
const memory = new Map<string, string>(); // запасной вариант, если localStorage недоступен

function read(key: string): string {
  try {
    return window.localStorage.getItem(key) ?? "";
  } catch {
    return memory.get(key) ?? "";
  }
}

function write(key: string, raw: string) {
  try {
    window.localStorage.setItem(key, raw);
  } catch {
    memory.set(key, raw);
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

export function useStored<T>(key: string, fallback: T, valid: (v: unknown) => boolean = () => true): [T, (v: T) => void] {
  const raw = useSyncExternalStore(subscribe, () => read(key), () => "");
  const value = useMemo(() => {
    try {
      const parsed: unknown = raw ? JSON.parse(raw) : fallback;
      return valid(parsed) ? (parsed as T) : fallback; // битое или чужое значение игнорируем
    } catch {
      return fallback;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [raw]);
  const set = useCallback((v: T) => write(key, JSON.stringify(v)), [key]);
  return [value, set];
}

const EMPTY: string[] = [];
// Устаревшие или чужие id считаем мусором: иначе «призрачные» записи занимают лимит сравнения.
const isIdList = (v: unknown) => Array.isArray(v) && v.every((x) => typeof x === "string" && Boolean(flatById(x)));

export const MAX_COMPARE = 3;

export function useFavorites() {
  const [list, set] = useStored<string[]>("severny-park:fav", EMPTY, isIdList);
  const toggle = (id: string) => set(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  return { list, toggle };
}

export function useCompare() {
  const [list, set] = useStored<string[]>("severny-park:cmp", EMPTY, isIdList);
  /** Возвращает false, если лимит достигнут. */
  const toggle = (id: string) => {
    if (list.includes(id)) { set(list.filter((x) => x !== id)); return true; }
    if (list.length >= MAX_COMPARE) return false;
    set([...list, id]);
    return true;
  };
  return { list, toggle, clear: () => set([]) };
}

export type Currency = "BYN" | "USD";
export const useCurrency = () => useStored<Currency>("severny-park:cur", "BYN", (v) => v === "BYN" || v === "USD");
