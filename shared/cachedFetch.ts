import { FetchType } from "./types/FetchType";
import { fetchAsType } from "./fetch"
import { Dictionary } from "./types/Dictionary";

/**
 * Interface defining the structure of the fetch cache.
 */
export interface FetchCache {
  json: Dictionary<any>;
  text: Dictionary<string>;
  buffer: Dictionary<ArrayBuffer>;
}

/**
 * Object storing cached fetch results.
 * @type {FetchCache}
 */
const fetchCache: FetchCache = {
  json: {},
  text: {},
  buffer: {}
};

/**
 * Retrieves the cache type based on the FetchType.
 * @param {FetchType} type - The type of fetch result.
 * @returns {keyof FetchCache} - The key of the corresponding fetch cache.
 */
function getCacheType(type: FetchType): keyof FetchCache {
  return FetchType[type].toLowerCase() as keyof FetchCache;
}

/**
 * Performs a cached fetch operation based on the provided URL and fetch type.
 * @param url - The URL to fetch data from.
 * @param type - The type of fetch result (default: FetchType.Json).
 * @param force - Indicates whether to force refresh the cache (default: false).
 * @returns - A promise resolving to the fetched data or null if not found.
 */
async function cachedFetch<T>(url: string, type: FetchType = FetchType.Json, force = false): Promise<T | null> {
  const cacheType = getCacheType(type);

  if (fetchCache[cacheType][url]) {
    if (force) {
      delete fetchCache[cacheType][url];
    } else {
      return fetchCache[cacheType][url];
    }
  }

  const response = await fetchAsType<T>(url, type);

  if (response.data) {
    fetchCache[cacheType][url] = response.data;

    return fetchCache[cacheType][url];
  }

  return null;
}

/**
 * Cached fetch operation for JSON data.
 * @param url - The URL to fetch JSON data from.
 * @param force - Indicates whether to force refresh the cache (default: false).
 * @returns - A promise resolving to the fetched JSON data or null if not found.
 */
export const cachedFetchJson = async <T>(url: string, force = false): Promise<T | null> =>
  await cachedFetch<any>(url, FetchType.Json, force);

/**
 * Cached fetch operation for text data.
 * @param url - The URL to fetch text data from.
 * @param force - Indicates whether to force refresh the cache (default: false).
 * @returns - A promise resolving to the fetched text data or null if not found.
 */
export const cachedFetchText = async (url: string, force = false): Promise<string | null> =>
  await cachedFetch<string>(url, FetchType.Text, force);

/**
 * Cached fetch operation for ArrayBuffer data.
 * @param url - The URL to fetch ArrayBuffer data from.
 * @param force - Indicates whether to force refresh the cache (default: false).
 * @returns - A promise resolving to the fetched ArrayBuffer data or null if not found.
 */
export const cachedFetchBuffer = async (url: string, force = false): Promise<ArrayBuffer | null> =>
  await cachedFetch<ArrayBuffer>(url, FetchType.Buffer, force);
