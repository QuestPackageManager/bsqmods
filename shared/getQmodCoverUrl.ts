import { cachedFetchJson } from "./cachedFetch";
import { fetchJson } from "./fetch";
import { ghRegex } from "./ghRegex";
import { isNullOrWhitespace } from "./isNullOrWhitespace";

/**
 * Retrieves the cover image URL for a GitHub repository.
 *
 * @param url - The URL of the GitHub repository.
 * @returns The URL of the cover image or null if not found.
 */
export async function getQmodCoverUrl(url: string) {
  const match = ghRegex.exec(url);

  if (match) {

    const repoJson: any = await cachedFetchJson(`https://api.github.com/repos/${match[1]}/${match[2]}`);

    if (!repoJson) {
      throw new Error("Error fetching repo json")
    }

    const defaultBranch = repoJson["default_branch"] || null;

    if (!defaultBranch) {
      throw new Error(`API issue.\n\n${JSON.stringify(repoJson, null, "  ")}`);
    }

    try {
      let coverFilename = "cover.png";

      try {
        let result = await fetchJson<any>(
          `https://raw.githubusercontent.com/${match[1]}/${match[2]}/${defaultBranch}/mod.template.json?${new Date().getTime()}`,
        );

        if (!result.data) {
          result = await fetchJson<any>(
            `https://raw.githubusercontent.com/${match[1]}/${match[2]}/${defaultBranch}/mod.json?${new Date().getTime()}`,
          );
        }

        if (!result.data) {
          result = await fetchJson<any>(
            `https://raw.githubusercontent.com/${match[1]}/${match[2]}/${defaultBranch}/bmbfmod.json?${new Date().getTime()}`,
          );
        }

        if (result.data && !isNullOrWhitespace(result.data.coverImage || result.data.coverImageFilename)) {
          coverFilename = result.data.coverImage || result.data.coverImageFilename;
        }
      } catch (err) { }

      const coverResponse = await fetch(`https://raw.githubusercontent.com/${match[1]}/${match[2]}/${defaultBranch}/${coverFilename}?${new Date().getTime()}`, {
        method: "HEAD",
      });

      if (coverResponse.ok) {
        return `https://raw.githubusercontent.com/${match[1]}/${match[2]}/${defaultBranch}/${coverFilename}`;
      }
    } catch (err) { }
  }

  return null;
}
