import JSZip from "jszip";
import { doWithRegexMatch } from "../../shared/doWithRegexMatch";
import { fetchBuffer, fetchRedirectedLocation, fetchHead } from "../../shared/fetch";
import { ghRegex } from "../../shared/ghRegex";
import { Logger } from "../../shared/Logger";
import { Dependency } from "../../shared/types/Dependency";
import { getMirrorMetadata, hasMirrorUrl, mirrorBase, MirrorMetadata } from "../../shared/types/MirrorMetadata";
import { Mod } from "../../shared/types/Mod";

import { iterateSplitMods } from "./iterateMods";

const redirectCache: Record<string, string> = {};
const mirrorMetadata: MirrorMetadata = await getMirrorMetadata();
const modUrls = [
  ...new Set(
    iterateSplitMods()
      .map((mod) => mod.getModJson().download?.toLowerCase())
      .filter((url) => url)
  )
];

export async function updateModDependencies(mod: Mod, logger: Logger) {
  try {
    if (mod.dependencies) {
      return;
    }

    mod.dependencies = [];

    if (!mod.download) {
      throw new Error(`Missing download URL`);
    }

    let mirrorLink: string | null = null;

    if (hasMirrorUrl(mod.download, mirrorMetadata)) {
      mirrorLink = `${mirrorBase}/${mirrorMetadata[mod.download]}`;
    }

    logger.debug(`Fetching: ${mirrorLink || mod.download}`);
    const result = await fetchBuffer(mirrorLink || mod.download);

    if (!result.data) {
      throw new Error(result.response.statusText);
    }

    const zip = await JSZip.loadAsync(result.data);

    const infoFile = zip.file("bmbfmod.json") || zip.file("mod.json");

    if (infoFile != null) {
      try {
        const json = JSON.parse(await infoFile.async("text")) as { dependencies?: Dependency[] };

        if (!json.dependencies) {
          return;
        }

        for (const { id, version, versionRange, downloadIfMissing } of json.dependencies) {
          const dep = { id, version: version || versionRange };
          logger.log(`Added dependency: ${id} - ${dep.version}`);
          let updatedDownload = "";
          if (
            await doWithRegexMatch(downloadIfMissing, ghRegex, async ([match, user, repo]) => {
              try {
                const ogRepo = `https://github.com/${user}/${repo}`;
                const repoUrl = redirectCache[ogRepo] || (redirectCache[ogRepo] = await fetchRedirectedLocation(ogRepo));
                updatedDownload = `${repoUrl}/${downloadIfMissing?.substring(match.length + 1)}`;
              } catch (err) {
                logger.error(`Error fetching repo: ${match} - ${err instanceof Error ? err.message : String(err)}`);
              }
            })
          ) {
            return;
          }

          mod.dependencies.push(dep);
          if (updatedDownload && !modUrls.includes(updatedDownload.toLowerCase())) {
            if (await fetchHead(updatedDownload)) {
              logger.warn(`Mod not known: ${updatedDownload}`);
            } else {
              logger.warn(`Mod not found: ${updatedDownload}`);
            }
          }
        }
      } catch (error: any) {
        logger.error(`Error processing ${infoFile.name}\n${error.message}`);
      }
    } else {
      logger.warn("No info json");
    }
  } catch (err) {
    logger.error(err instanceof Error ? err.message : String(err));
  }
}
