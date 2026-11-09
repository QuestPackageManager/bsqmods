import { delay } from "./delay";
import { getGithubToken } from "./githubToken";
import { FetchType } from "./types/FetchType";

const githubMinimumDelay = 1000;
let lastGithubRelease = 0;

/** How many times each fetch is tried before giving up. */
const fetchAttempts = 10;

/** The delay before the first retry. It doubles for each retry after that (2s, 4s, 8s). */
const retryBaseDelayMs = 2000;

/** Status codes that usually mean a temporary failure: timeouts, rate limits and server errors. */
const retryableStatusCodes = [408, 429, 500, 502, 503, 504];

export interface FetchedData<T> {
  data: T | null;
  response: Response;
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
  const isGithub = url.toLocaleLowerCase().startsWith("https://api.github.com/");
  const useToken = token && isGithub;

  for (let attempt = 1; ; attempt++) {
    if (isGithub) {
      const delaySinceLast = new Date().getTime() - lastGithubRelease;

      if (delaySinceLast < githubMinimumDelay) {
        const delayMs = githubMinimumDelay - delaySinceLast;

        await delay(delayMs);
      }
    }

    let response: Response;

    try {
      response = await fetch(
        url,
        useToken
          ? {
              headers: {
                Accept: "application/vnd.github.v3+json",
                Authorization: `Bearer ${token}`
              }
            }
          : undefined
      );
    } catch (error: any) {
      // Network error: retry, and throw it once out of attempts.
      if (attempt >= fetchAttempts) {
        throw error;
      }

      const waitMs = retryBaseDelayMs * 2 ** (attempt - 1);

      console.warn(
        `Fetch failed (${error?.cause?.message || error?.message || error}): ${url}. Retrying in ${waitMs / 1000}s (attempt ${attempt + 1} of ${fetchAttempts}).`
      );
      await delay(waitMs);
      continue;
    } finally {
      if (isGithub) {
        lastGithubRelease = new Date().getTime();
      }
    }

    if (response.ok) {
      switch (type) {
        case FetchType.Json:
          return {
            data: (await response.json()) as T,
            response
          };

        case FetchType.Text:
          return {
            data: (await response.text()) as T,
            response
          };

        case FetchType.Buffer:
          return {
            data: (await response.arrayBuffer()) as T,
            response
          };
      }
    }

    // Temporary failure: retry. Anything else, like a 404, is returned straight away.
    if (retryableStatusCodes.includes(response.status) && attempt < fetchAttempts) {
      const waitMs = retryBaseDelayMs * 2 ** (attempt - 1);

      console.warn(`Fetch failed (HTTP ${response.status}): ${url}. Retrying in ${waitMs / 1000}s (attempt ${attempt + 1} of ${fetchAttempts}).`);
      await delay(waitMs);
      continue;
    }

    return {
      data: null,
      response
    };
  }
}

/**
 * Cached fetch operation for JSON data.
 * @param url - The URL to fetch JSON data from.
 * @param force - Indicates whether to force refresh the cache (default: false).
 * @returns - A promise resolving to the fetched JSON data or null if not found.
 */
export const fetchJson = async <T>(url: string): Promise<FetchedData<T>> => await fetchAsType<any>(url, FetchType.Json);

/**
 * Cached fetch operation for text data.
 * @param url - The URL to fetch text data from.
 * @param force - Indicates whether to force refresh the cache (default: false).
 * @returns - A promise resolving to the fetched text data or null if not found.
 */
export const fetchText = async (url: string): Promise<FetchedData<string>> => await fetchAsType<string>(url, FetchType.Text);

/**
 * Cached fetch operation for ArrayBuffer data.
 * @param url - The URL to fetch ArrayBuffer data from.
 * @param force - Indicates whether to force refresh the cache (default: false).
 * @returns - A promise resolving to the fetched ArrayBuffer data or null if not found.
 */
export const fetchBuffer = async (url: string): Promise<FetchedData<ArrayBuffer>> => await fetchAsType<ArrayBuffer>(url, FetchType.Buffer);

/**
 * Checks if the URL exists.
 * @param url The URL to check.
 * @returns
 */
export async function fetchHead(url: string): Promise<boolean> {
  for (let attempt = 1; ; attempt++) {
    let failure: string;

    try {
      const response = await fetch(url, { method: "HEAD" });

      if (response.ok || !retryableStatusCodes.includes(response.status) || attempt >= fetchAttempts) {
        return response.ok;
      }

      failure = `HTTP ${response.status}`;
    } catch (error: any) {
      if (attempt >= fetchAttempts) {
        return false;
      }

      failure = `${error?.cause?.message || error?.message || error}`;
    }

    const waitMs = retryBaseDelayMs * 2 ** (attempt - 1);

    console.warn(`HEAD request failed (${failure}): ${url}. Retrying in ${waitMs / 1000}s (attempt ${attempt + 1} of ${fetchAttempts}).`);
    await delay(waitMs);
  }
}

/**
 * Fetches the final redirected location of a URL.
 *
 * @param url - The URL to fetch the redirected location for.
 * @returns A promise that resolves to the redirected location URL, or the original URL if no redirection occurs.
 */
export async function fetchRedirectedLocation(url: string): Promise<string> {
  for (let attempt = 1; ; attempt++) {
    let failure: string;

    try {
      const response = await fetch(url, {
        method: "HEAD",
        redirect: "manual"
      });

      if (response.status >= 300 && response.status < 400 && response.headers.get("location")) {
        const redirectedUrl = new URL(response.headers.get("location") as string, url).href;
        return redirectedUrl;
      }

      if (!retryableStatusCodes.includes(response.status) || attempt >= fetchAttempts) {
        return url;
      }

      failure = `HTTP ${response.status}`;
    } catch (error: any) {
      if (attempt >= fetchAttempts) {
        throw new Error(`Error fetching redirected URL: ${error.message}`);
      }

      failure = `${error?.cause?.message || error?.message || error}`;
    }

    const waitMs = retryBaseDelayMs * 2 ** (attempt - 1);

    console.warn(`Redirect lookup failed (${failure}): ${url}. Retrying in ${waitMs / 1000}s (attempt ${attempt + 1} of ${fetchAttempts}).`);
    await delay(waitMs);
  }
}
