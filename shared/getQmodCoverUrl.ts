import { fetchJson } from "./fetchJson";
import { ghRegex } from "./ghRegex";

export async function getQmodCoverUrl(url: string) {
  const match = ghRegex.exec(url);

  if (match) {
    try {
      const repoJson: any = await fetchJson(`https://api.github.com/repos/${match[1]}/${match[2]}`, true);

      const defaultBranch = repoJson["default_branch"] as string;
      let coverFilename = "cover.png";

      try {
        var modJson: any = await fetchJson(
          `https://raw.githubusercontent.com/${match[1]}/${match[2]}/${defaultBranch}/mod.template.json?${new Date().getTime()}`,
        );
        coverFilename = modJson.coverImage || coverFilename;
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
