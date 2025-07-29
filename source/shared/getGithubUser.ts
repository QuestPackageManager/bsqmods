import { CachableResult, cachedFetchJson } from "./cachedFetch";
import { FullUser, Message } from "./types/GitHubAPI";
import { fetchIconLink } from "./getGithubIconUrl";

/**
 * Fetches GitHub user information for the given username.
 * @param username - The GitHub username to look up.
 * @returns A promise resolving to a CachableResult containing the FullUser object or null if not found.
 */
export async function getGitHubUserInfo(username: string): Promise<FullUser | null> {
  const url = `https://api.github.com/users/${encodeURIComponent(username)}`;

  const result = await cachedFetchJson<FullUser | Message>(url);

  if (result.data?.message) {
    throw new Error(`GitHub API error: ${result.data.message}`);
  }

  return (result.data as FullUser) || null;
}

export async function getGithubUserId(username: string): Promise<number | null> {
  if (typeof window === "undefined") {
    // We're on the server, so we can query the GitHub icon URL to get the user ID.

    const iconUrl = await fetchIconLink(`https://github.com/${encodeURIComponent(username)}.png`);
    const iconRegex = /^https?:\/\/avatars.githubusercontent.com\/u\/(\d+).*$/g;

    if (iconUrl) {
      const match = iconRegex.exec(iconUrl);

      // If the icon URL matches the expected pattern, extract the user ID.
      if (match) {
        return parseInt(match[1], 10);
      }
    }
  }

  const result = await getGitHubUserInfo(username);

  if (result?.id) {
    return result.id;
  }

  return null;
}
