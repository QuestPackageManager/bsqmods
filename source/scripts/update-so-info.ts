import { compareAlphabeticallyDesc } from "../shared/comparisonFunctions";
import { fetchJson } from "../shared/fetch";
import { getIndentedMessage as indent } from "../shared/getIndentedMessage";
import { ghRegex } from "../shared/ghRegex";
import { exec } from "child_process";
import { promisify } from "util";
import { rm } from "fs/promises";
import { Message, Release, Releases } from "../shared/types/GitHubAPI";
import { iterateSplitMods } from "./shared/iterateMods";
import { logGithubApiUsage } from "../shared/logGithubApiUsage";
import { readTextFile } from "./shared/readTextFile";
import { soInfoPath } from "../shared/paths";
import { createHash } from "crypto";
import path from "path";
import { mkdir, writeFile } from "fs/promises";
import { tmpdir } from "os";

const execAsync = promisify(exec);

/**
 * Sorts an object alphabetically by its keys.
 * @param obj - The object to sort.
 * @returns A new object with keys sorted alphabetically.
 */
function sortObjectByKeys<T>(obj: Record<string, T>): Record<string, T> {
  return Object.keys(obj)
    .sort()
    .reduce((sortedObj, key) => {
      sortedObj[key] = obj[key];
      return sortedObj;
    }, {} as Record<string, T>);
}

await logGithubApiUsage();

const mods = [...iterateSplitMods()].map((mod) => mod.getModJson());
const repos = mods
  .map((mod) => mod.download)
  .filter((link) => link?.match(ghRegex))
  .map((link) => {
    const match = ghRegex.exec(link as string) as RegExpExecArray;

    return `${match[1]}/${match[2]}`.toLowerCase();
  })
  .filter((value, index, array) => array.indexOf(value) === index)
  .sort();

interface SoInfo {
  [key: string]: {
    [key: string]: {
      info: string;
      stripped: boolean;
      debug: boolean;
    };
  };
}

const knownSoFiles = JSON.parse(await readTextFile(soInfoPath, "{}")) as SoInfo;
const knownSoLinks = [] as string[];

for (const [key, value] of Object.entries(knownSoFiles)) {
  for (const url of Object.keys(value)) {
    knownSoLinks.push(url);
    console.log(`Known so file: ${url}`);
  }
}

console.log("Running .so scanner...\n");

repo_loop: for (const [owner, repo] of repos.map((repo) => repo.split("/"))) {
  console.log(`Processing ${owner}/${repo}`);

  const releases = (await fetchJson<Releases>(`https://api.github.com/repos/${owner}/${repo}/releases?per_page=100`)).data;

  if (!releases) {
    console.error(indent("Release data is null\n", 1));
    continue;
  }

  if (releases instanceof Object && (releases as Message).message) {
    throw new Error((releases as Message).message);
  }

  release_loop: for (const release of (releases as Release[])
    .filter((release) => !release.draft && !release.prerelease)
    .sort((a, b) => compareAlphabeticallyDesc(a?.published_at, b?.published_at))) {
    console.log(indent(`Processing tag: ${release.tag_name}`, 1));

    let newLine = true;

    asset_loop: for (const asset of release.assets) {
      const url = asset.browser_download_url;

      if (!url.endsWith(".so")) {
        continue;
      }

      if (knownSoLinks.includes(url)) {
        continue;
      }

      // Get a hash of the url
      const hash = createHash("sha256").update(url).digest("hex");
      const tempPath = path.join(tmpdir(), hash);
      const soName = path.basename(url);
      const soPath = path.join(tempPath, soName);
      await mkdir(tempPath);

      // Download the file
      try {
        const response = await fetch(url);

        if (!response.ok) {
          console.error(`Failed to download file: ${url} (status: ${response.status})`);
          continue;
        }

        const buffer = await response.body;
        if (!buffer) {
          throw new Error(`Failed to read response body for ${url}`);
        }

        await writeFile(soPath, buffer);
        console.log(`Downloaded: ${soPath}`);
      } catch (error) {
        console.error(`Error downloading file from ${url}:`, error);
      }

      // Execute `file` command to get information about the file
      try {
        const { stdout } = await execAsync(`file ${soName}`, {
          cwd: tempPath
        });
        console.log(`File info for ${soPath}: ${stdout.trim()}`);

        const infoParts = stdout
          .split(":")
          .slice(1)[0]
          .split(",")
          .map((part) => part.trim());
        const buildId =
          infoParts
            .find((part) => part.startsWith("BuildID"))
            ?.split("=")[1]
            ?.trim() || "";

        if (buildId == "") {
          console.log(`BuildID not found in file info for ${soPath}`);
        }

        knownSoFiles[buildId] = knownSoFiles[buildId] || {};
        knownSoFiles[buildId][url] = {
          info: infoParts.join(", "),
          stripped: infoParts.includes("stripped"),
          debug: infoParts.includes("with debug_info")
        };

        knownSoFiles[buildId] = sortObjectByKeys(knownSoFiles[buildId]);
      } catch (error) {
        console.error(`Error executing file command on ${soPath}:`, error);
      } finally {
        await rm(tempPath, { recursive: true, force: true });
      }

      // Update the so-info.json file
      await writeFile(soInfoPath, JSON.stringify(sortObjectByKeys(knownSoFiles), null, 2));
    }
  }
}

await logGithubApiUsage();
