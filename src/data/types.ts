export type Feature = "balcony" | "loggia" | "twoBath" | "wardrobe" | "forest" | "corner";
export type Status = "free" | "reserved" | "sold";
export type Finish = "none" | "rough" | "full";

export interface Flat {
  id: string;
  number: number;
  building: number;
  entrance: number;
  floor: number;
  floors: number;
  position: number;
  layoutId: string;
  rooms: number;
  area: number;
  price: number;
  ppm2: number;
  status: Status;
  finish: Finish;
  deadline: string;
  features: Feature[];
  side: string;
  view: string;
}

export interface Building {
  id: number;
  name: string;
  floors: number;
  entrances: number;
  deadline: string;
  progress: number;
  forestPositions: number[];
  patterns: string[][];
}
