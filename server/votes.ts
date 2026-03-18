import type { CardValue } from "./types.js";

export interface MedianResult {
  median: number | null;
  consensus: boolean;
}

/**
 * Compute the median (upper-middle for even counts) and consensus
 * from a list of CardValues. Non-numeric votes ("?" and "coffee") are ignored.
 */
export function computeMedian(votes: CardValue[]): MedianResult {
  const numeric: number[] = [];
  for (const v of votes) {
    if (typeof v === "number") numeric.push(v);
  }
  if (numeric.length === 0) return { median: null, consensus: false };
  const sorted = numeric.sort((a, b) => a - b);
  const midIndex = Math.ceil((sorted.length - 1) / 2);
  return {
    median: sorted[midIndex],
    consensus: sorted.every((v) => v === sorted[0]) && sorted.length > 1,
  };
}

/**
 * Normalize a label: trim whitespace, treat empty/whitespace-only as null,
 * enforce max length.
 */
export function normalizeLabel(
  label: string,
  maxLength = 100
): string | null {
  const trimmed = label.trim();
  if (trimmed.length === 0) return null;
  return trimmed.slice(0, maxLength);
}
