import { cachedFetchJson, CachableResult } from "./cachedFetch";
import { checkGithubResponse } from "./checkGithubResponse";
import { fetchJson } from "./fetch";
import { ghRawRegex } from "./ghRawRegex";
import { ghRegex } from "./ghRegex";
import { isNullOrWhitespace } from "./isNullOrWhitespace";
import { Dictionary } from "./types/Dictionary";
import { Message, RepoContent, RepoContents, Repository } from "./types/GitHubAPI";

/**
 * Retrieves the cover image URL for a GitHub repository.
 *
 * @param url - The URL of the GitHub repository.
 * @returns The URL of the cover image or null if not found.
 */
export async function getQmodCoverUrl(url: string): Promise<CachableResult<string | null>> {
  const match = ghRegex.exec(url);

  if (match) {
    const result = await cachedFetchJson<RepoContents>(`https://api.github.com/repos/${match[1]}/${match[2]}/contents`);
    const repoJson = result.data;

    if (!repoJson) {
      throw new Error("Error fetching repo json")
    }

    checkGithubResponse(repoJson as Message)

    const files = {} as Dictionary<RepoContent>;
    let defaultBranch = null as string | null;

    for (const file of (repoJson as RepoContent[])) {
      files[file.path.toLowerCase()] = file;

      const match = ghRawRegex.exec(file.download_url || "");
      if (match) {
        defaultBranch = match[3];
      }
    }

    try {
      let coverFilename = "cover.png";

      try {
        let result: any = undefined;

        for (const path of ["mod.template.json", "mod.json", "bmbfmod.json"]) {
          const file = files[path];

          if (file.download_url) {
            result = await fetchJson<any>(
              `${file.download_url}?${new Date().getTime()}`,
            );
            break;
          }
        }

        if (result.data && !isNullOrWhitespace(result.data.coverImage || result.data.coverImageFilename)) {
          coverFilename = result.data.coverImage || result.data.coverImageFilename;
        }
      } catch (err) { }

      const coverResponse = await fetch(`https://raw.githubusercontent.com/${match[1]}/${match[2]}/${defaultBranch}/${coverFilename}?${new Date().getTime()}`, {
        method: "HEAD",
      });

      if (coverResponse.ok) {
        return {
          data: `https://raw.githubusercontent.com/${match[1]}/${match[2]}/${defaultBranch}/${coverFilename}`,
          fromCache: result.fromCache
        };
      }
    } catch (err) { }
  }

  return {
    data: null,
    fromCache: true
  };
}
