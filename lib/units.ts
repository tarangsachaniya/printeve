import type { DimensionUnit } from "./types";

const MM_PER_UNIT: Record<DimensionUnit, number> = {
  mm: 1,
  cm: 10,
  in: 25.4,
};

export const DIMENSION_UNITS: DimensionUnit[] = ["mm", "cm", "in"];

export function convertDimension(value: number, from: DimensionUnit, to: DimensionUnit): number {
  if (from === to) return value;
  const mm = value * MM_PER_UNIT[from];
  return Math.round((mm / MM_PER_UNIT[to]) * 100) / 100;
}

export function isCustomSize(name: string | undefined): boolean {
  return (name ?? "").trim().toLowerCase() === "custom";
}
