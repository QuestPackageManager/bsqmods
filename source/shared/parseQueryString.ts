/**
 * Parses a query string from a given URL or the current URL into an object of type T.
 *
 * @param {string} [url] - The URL to parse. If not provided, the current URL is used.
 * @returns {T} - The parsed object of type T.
 */
export function parseQueryString<T>(url?: string): Partial<T> {
  const currentUrl = url || window.location.href;
  const queryString = currentUrl.split('?')[1] || '';
  const params = new URLSearchParams(queryString);
  const result: any = {};

  params.forEach((value, key) => {
    result[key] = value;
  });

  return result as Partial<T>;
}
