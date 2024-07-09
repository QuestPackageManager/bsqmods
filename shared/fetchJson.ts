/**
 * Fetches JSON from a URL and returns it, or throws an error if unsuccessful.
 * @param url The url to fetch.
 * @returns
 */
export async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (response.ok) {
    return await response.json();
  } else {
    throw new Error(response.statusText)
  }
}
