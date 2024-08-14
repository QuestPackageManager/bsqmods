/**
 * Extracts the domain from a given URL string.
 *
 * @param {string} urlString - The URL string from which to extract the domain.
 * @returns {string} - The extracted domain.
 * @throws {Error} - Throws an error if the URL is invalid.
 */
export function getDomainFromUrl(urlString: string): string {
  try {
    const url = new URL(urlString);
    return url.hostname;
  } catch (error) {
    throw new Error("Invalid URL");
  }
}
