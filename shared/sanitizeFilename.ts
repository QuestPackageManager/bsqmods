/**
 * Replaces invalid filename or directory characters with an underscore.
 *
 * @param input - The input string to sanitize.
 * @returns - The sanitized string.
 */
export function sanitizeFilename(input: string): string {
  // Define a regex pattern for invalid filename characters
  // This pattern includes characters not allowed in Windows filenames
  const invalidChars = /[<>:"\/\\|?*\x00-\x1F]+/g;

  // Replace invalid characters with underscore
  return input.replace(invalidChars, '_');
}
