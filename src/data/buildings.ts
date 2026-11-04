import type { Building } from "./types";

// patterns[подъезд][позиция на этаже] = id типовой планировки (см. layouts.ts)
export const BUILDINGS: Building[] = [
  {
    id: 1, name: "Корпус 1", floors: 10, entrances: 3, deadline: "III кв. 2027", progress: 71,
    forestPositions: [0, 1],
    patterns: [["S1", "1A", "2A", "3A"], ["1A", "2B", "1B", "2A"], ["S2", "1B", "2C", "3B"]],
  },
  {
    id: 2, name: "Корпус 2", floors: 12, entrances: 3, deadline: "IV кв. 2027", progress: 46,
    forestPositions: [0],
    patterns: [["1A", "2A", "2B", "3A"], ["S1", "1B", "2C", "2A"], ["1B", "2B", "3B", "4A"]],
  },
  {
    id: 3, name: "Корпус 3", floors: 13, entrances: 3, deadline: "II кв. 2028", progress: 19,
    forestPositions: [0, 1, 2],
    patterns: [["S2", "1A", "2B", "3C"], ["1A", "2A", "2C", "3A"], ["1B", "2B", "3B", "4B"]],
  },
];

export const DEADLINES = BUILDINGS.map((b) => b.deadline);
