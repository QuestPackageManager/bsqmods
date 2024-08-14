/**
 * Parses a date string in UTC format and returns a Date object.
 *
 * @param dateString - The date string to parse in the format "YYYY-MM-DDTHH:mm:ss.sssZ".
 * @returns - The parsed Date object in UTC.
 */
export function parseUTCDate(dateString: string): Date {
  const dateMatch = dateString.match(/^(\d+)-(\d+)-(\d+)T(\d+):(\d+):(\d+)(?:\.(\d{1,3}))?\d*Z$/);

  if (!dateMatch) {
    throw new Error("Invalid date format");
  }

  const dateComponents = dateMatch.slice(1).map((value) => (value ? parseInt(value) : 0));

  return new Date(
    Date.UTC(dateComponents[0], dateComponents[1] - 1, dateComponents[2], dateComponents[3], dateComponents[4], dateComponents[5], dateComponents[6])
  );
}
