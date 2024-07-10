import { cachedFetchJson, CachableResult } from "./cachedFetch";
import { fetchRedirectedLocation } from "./fetch";
import { ghRegex } from "./ghRegex";
import { Dictionary } from "./types/Dictionary";

/**
 * Represents a collection of icon URLs indexed by the source url.
 */
const iconCache: Dictionary<string | null> = {};

/**
 * Fetches the redirected URL from a given URL.
 *
 * @param url - The URL to fetch and check for redirection.
 * @returns A promise that resolves to the redirected URL or null if no redirection occurs.
 */
async function fetchIconLink(url: string): Promise<string | null> {
  const redirected = await fetchRedirectedLocation(url)

  if (url == redirected) {
    return null;
  }

  return redirected;
}

/**
 * Gets the owner profile picture url from a page link
 * @param link - A link starting with `https://github.com/[owner]/[repo]
 * @returns
 */
export async function getGithubIconUrl(link: string): Promise<CachableResult<string | null>> {
  const ghMatch = ghRegex.exec(link);

  if (ghMatch) {
    if (iconCache[ghMatch[1]] !== undefined) {
      return {
        data: iconCache[ghMatch[1]],
        fromCache: true
      };
    }

    if (typeof window === "undefined") {
      // We're not in the browser, we can use fetch.
      iconCache[ghMatch[1]] = await fetchIconLink(`https://github.com/${ghMatch[1]}.png`);

      return {
        data: iconCache[ghMatch[1]],
        fromCache: false
      };
    } else {
      // We're in the browser, we need to use the GitHub API.
      try {
        const result = await cachedFetchJson<any>(`https://api.github.com/repos/${ghMatch[1]}/${ghMatch[2]}`);
        const repoJson = result.data;

        iconCache[ghMatch[1]] = repoJson?.owner?.avatar_url || null;

        return {
          data: iconCache[ghMatch[1]],
          fromCache: result.fromCache
        }
      } catch (err) { }
    }
  }

  return {
    data: null,
    fromCache: true
  };
}
