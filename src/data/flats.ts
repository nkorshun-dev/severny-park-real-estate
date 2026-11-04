import { generateFlats } from "@/lib/generate-flats";

export const flats = generateFlats();
export const flatById = (id: string) => flats.find((f) => f.id === id);
