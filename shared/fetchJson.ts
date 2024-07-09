import { cachedFetchJson } from "./cachedFetch";

const fetchCache: {
  [index: string]: Response
} = {}

/**
 * Fetches JSON from a URL and returns it, or throws an error if unsuccessful.
 * @param url The url to fetch.
 * @param cache If the response should be cached
 * @returns
 */
export async function fetchJson<T>(url: string, cache = false): Promise<T> {
  if (cache) {
    const json = await cachedFetchJson<any>(url)

    if (json) {
      return json;
    } else {
      throw new Error("Error fetching");
    }
  } else {
    const response = await fetch(url);

    if (response.ok) {
      return await response.json();
    } else {
      throw new Error(response.statusText);
    }
  }
}
