/**
 * Checks if a given URL string is valid.
 *
 * @param {string} urlString - The URL string to validate.
 * @returns {boolean} - Returns true if the URL is valid, false otherwise.
 */
export function isValidUrl(urlString: string): boolean {
  try {
    new URL(urlString);
    return true;
  } catch (error) {
    return false;
  }
}
