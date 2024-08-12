/**
 * Checks if a given string is null, undefined, or consists only of whitespace characters.
 *
 * @param input - The string to check.
 * @returns - Returns true if the input is null, undefined, or whitespace; otherwise, false.
 */
export function isNullOrWhitespace(input: string | null | undefined): boolean {
  return !input || !input.trim();
}
