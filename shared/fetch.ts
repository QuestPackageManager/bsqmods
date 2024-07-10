import { getGithubToken } from "./githubToken";
import { FetchType } from "./types/FetchType";

export interface FetchedData<T> {
  data: T | null,
  response: Response
}

/**
 * Performs a cached fetch operation based on the provided URL and fetch type.
 * @param url - The URL to fetch data from.
 * @param type - The type of fetch result (default: FetchType.Json).
 * @param force - Indicates whether to force refresh the cache (default: false).
 * @returns - A promise resolving to the fetched data or null if not found.
 */
export async function fetchAsType<T>(url: string, type: FetchType = FetchType.Json): Promise<FetchedData<T>> {
  const token = await getGithubToken();
  const useToken = token && url.toLocaleLowerCase().startsWith("https://api.github.com/");
  const response = await fetch(url, useToken ? {
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'Authorization': `Bearer ${token}`
    },
  } : undefined);

  if (response.ok) {
    switch (type) {
      case FetchType.Json:
        return {
          data: await response.json() as T,
          response
        };

      case FetchType.Text:
        return {
          data: await response.text() as T,
          response
        };

      case FetchType.Buffer:
        return {
          data: await response.arrayBuffer() as T,
          response
        };
    }
  }

  return {
    data: null,
    response
  };
}

/**
 * Cached fetch operation for JSON data.
 * @param url - The URL to fetch JSON data from.
 * @param force - Indicates whether to force refresh the cache (default: false).
 * @returns - A promise resolving to the fetched JSON data or null if not found.
 */
export const fetchJson = async <T>(url: string): Promise<FetchedData<T>> =>
  await fetchAsType<any>(url, FetchType.Json);

/**
 * Cached fetch operation for text data.
 * @param url - The URL to fetch text data from.
 * @param force - Indicates whether to force refresh the cache (default: false).
 * @returns - A promise resolving to the fetched text data or null if not found.
 */
export const fetchText = async (url: string): Promise<FetchedData<string>> =>
  await fetchAsType<string>(url, FetchType.Text);

/**
 * Cached fetch operation for ArrayBuffer data.
 * @param url - The URL to fetch ArrayBuffer data from.
 * @param force - Indicates whether to force refresh the cache (default: false).
 * @returns - A promise resolving to the fetched ArrayBuffer data or null if not found.
 */
export const fetchBuffer = async (url: string): Promise<FetchedData<ArrayBuffer>> =>
  await fetchAsType<ArrayBuffer>(url, FetchType.Buffer);

/**
 * Checks if the URL exists.
 * @param url The URL to check.
 * @returns
 */
export async function fetchHead(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: "HEAD", });

    return response.ok;
  } catch (err) {
    return false;
  }
}

/**
 * Fetches the final redirected location of a URL.
 *
 * @param url - The URL to fetch the redirected location for.
 * @returns A promise that resolves to the redirected location URL, or the original URL if no redirection occurs.
 */
export async function fetchRedirectedLocation(url: string): Promise<string> {
  try {
    const response = await fetch(url, { method: 'HEAD', redirect: 'manual' });

    if (response.status >= 300 && response.status < 400 && response.headers.get('location')) {
      const redirectedUrl = new URL(response.headers.get('location') as string, url).href;
      return redirectedUrl;
    } else {
      return url;
    }
  } catch (error: any) {
    throw new Error(`Error fetching redirected URL: ${error.message}`);
  }
}
