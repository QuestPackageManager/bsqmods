/**
 * Converts a Date object to a semver-like string.
 * If no date is provided, the current date and time is used.
 *
 * @param inputDate - The date to be converted. Defaults to the current date and time.
 * @returns The date and time in the format "YYYY.MM.DD-HHmmssSSSZ".
 */
export function semverDate(inputDate: Date = new Date()): string {
  const isoString = inputDate.toISOString();
  const parts = isoString.split("T").map((value, index) => {
    if (index == 0) {
      return value.replace(/-0*/g, ".");
    } else {
      return value.replace(/[:\.]/g, "");
    }
  });

  return parts.join("-");
}
