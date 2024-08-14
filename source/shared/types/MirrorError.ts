/**
 * Describes an error encountered when mirroring a mod file.
 */
export enum MirrorError {
  /** Server responded with 404. */
  NotFound = "Not Found",

  /** An error occurred when trying to fetch the file. */
  FetchError = "Fetch Error",

  /** The archive is not a valid ZIP file. */
  InvalidArchive = "Invalid Archive"
}

export function isMirrorError(value: string): boolean {
  const errorValues = Object.values(MirrorError) as string[];

  return errorValues.includes(value);
}
