import semver from 'semver';

/**
 * Sorts an array of version strings from newest to oldest.
 * Invalid versions are kept at the end of the list.
 *
 * @param versions - An array of version strings to be sorted.
 * @returns The sorted array of version strings with invalid versions at the end.
 */
export function sortVersionsNewestToOldest(versions: string[]): string[] {
  const validVersions = versions.filter(version => semver.valid(version));
  const invalidVersions = versions.filter(version => !semver.valid(version));

  validVersions.sort((a, b) => semver.rcompare(a, b));

  return [...validVersions, ...invalidVersions];
}

/**
 * Sorts an array of version strings from oldest to newest.
 * Invalid versions are kept at the end of the list.
 *
 * @param versions - An array of version strings to be sorted.
 * @returns The sorted array of version strings with invalid versions at the end.
 */
export function sortVersionsOldestToNewest(versions: string[]): string[] {
  const validVersions = versions.filter(version => semver.valid(version));
  const invalidVersions = versions.filter(version => !semver.valid(version));

  validVersions.sort((a, b) => semver.compare(a, b));

  return [...validVersions, ...invalidVersions];
}
