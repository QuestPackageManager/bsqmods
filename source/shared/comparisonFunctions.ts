import * as semverComparisons from "../scripts/shared/semverComparison";

/** @inheritdoc */
export const compareVersionAscending = semverComparisons.compareVersionAscending;

/** @inheritdoc */
export const compareVersionDescending = semverComparisons.compareVersionDescending;

/**
 * Comparison function for sorting strings alphabetically in ascending order.
 * Null or undefined values are placed at the end.
 *
 * @param a - The first string to compare.
 * @param b - The second string to compare.
 * @returns A negative number if a comes before b, a positive number if a comes after b, or 0 if they are equal.
 */
export function compareAlphabeticallyAsc(a: string | null, b: string | null) {
  if (a === null || a === undefined) return 1;
  if (b === null || b === undefined) return -1;

  return a.localeCompare(b);
}

/**
 * Comparison function for sorting strings alphabetically in descending order.
 * Null or undefined values are placed at the end.
 *
 * @param a - The first string to compare.
 * @param b - The second string to compare.
 * @returns A negative number if a comes after b, a positive number if a comes before b, or 0 if they are equal.
 */
export function compareAlphabeticallyDesc(a: string | null, b: string | null) {
  if (a === null || a === undefined) return 1;
  if (b === null || b === undefined) return -1;

  return b.localeCompare(a);
}

/**
 * Comparison function for sorting strings alphabetically in ascending order while ignoring case.
 * Null or undefined values are placed at the end.
 *
 * @param a - The first string to compare.
 * @param b - The second string to compare.
 * @returns A negative number if a comes before b, a positive number if a comes after b, or 0 if they are equal.
 */
export function compareAlphabeticallyAscInsensitive(a: string | null, b: string | null) {
  if (a === null || a === undefined) return 1;
  if (b === null || b === undefined) return -1;

  return a.localeCompare(b, undefined, { sensitivity: "base" });
}

/**
 * Comparison function for sorting strings alphabetically in descending order while ignoring case.
 * Null or undefined values are placed at the end.
 *
 * @param a - The first string to compare.
 * @param b - The second string to compare.
 * @returns A negative number if a comes after b, a positive number if a comes before b, or 0 if they are equal.
 */
export function compareAlphabeticallyDescInsensitive(a: string | null, b: string | null) {
  if (a === null || a === undefined) return 1;
  if (b === null || b === undefined) return -1;

  return b.localeCompare(a, undefined, { sensitivity: "base" });
}
