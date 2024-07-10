import semver from "semver";

/**
 * Compares two versions.
 *
 * Sorts in ascending order when passed to `Array.sort()`.  Invalid versions are placed at the end.
 *
 * @return
 * - `0` if `v1` == `v2`
 * - `1` if `v1` is greater
 * - `-1` if `v2` is greater.
 */
export function compareVersionAscending(a: string | null, b: string | null): number {
  a = a || "";
  b = b || "";

  a = a.replace(/_/g, "-");
  b = b.replace(/_/g, "-");

  if (!semver.valid(a)) {
    return 1;
  }

  return semver.compare(a, b)
}

/**
 * Compares two versions.
 *
 * Sorts in descending order when passed to `Array.sort()`.  Invalid versions are placed at the end.
 *
 * @return
 * - `0` if `v1` == `v2`
 * - `1` if `v1` is greater
 * - `-1` if `v2` is greater.
 */
export function compareVersionDescending(a: string | null, b: string | null): number {
  a = a || "";
  b = b || "";

  a = a.replace(/_/g, "-");
  b = b.replace(/_/g, "-");

  if (!semver.valid(a)) {
    return 1;
  }

  return semver.rcompare(a, b)
}
