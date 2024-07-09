import { fetchJson } from "./fetchJson";
import { fetchRedirectedLocation } from "./fetchRedirectedLocation";
import { ghRegex } from "./ghRegex";

const iconCache: {
  [key: string]: string | null;
} = {};

async function fetchIconLink(url: string) {
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
export async function getGithubIconUrl(link: string): Promise<string | null> {
  const ghMatch = ghRegex.exec(link);

  if (ghMatch) {
    if (iconCache[ghMatch[1]] !== undefined) {
      return iconCache[ghMatch[1]];
    }

    if (typeof window === "undefined") {
      // We're not in the browser, we can use fetch.
      iconCache[ghMatch[1]] = await fetchIconLink(`https://github.com/${ghMatch[1]}.png`);

      return iconCache[ghMatch[1]];
    } else {
      // We're in the browser, we need to use the GitHub API.
      try {
        const repoJson: any = await fetchJson(`https://api.github.com/repos/${ghMatch[1]}/${ghMatch[2]}`, true);

        iconCache[ghMatch[1]] = repoJson?.owner?.avatar_url || null;

        return iconCache[ghMatch[1]]
      } catch (err) { }
    }
  }

  return null;
}
