import { mkdirSync, writeFileSync } from "fs";
import { getCoreMods } from "../shared/CoreMods"
import { fetchAsBuffer } from "./shared/fetchAsBuffer";
import { importedCoreModsInfo } from "./shared/paths"
import { readTextFile } from "./shared/readTextFile"
import JSZip from "jszip";
import { Mod } from "../shared/types/Mod";
import { isNullOrWhitespace } from "../shared/isNullOrWhitespace";
import { validModLoaders } from "../shared/validModLoaders";
import { getFilename } from "./shared/getFilename";
import { ghRegex } from "../shared/ghRegex"
import { dirname, resolve } from "path";
import { Logger, ConsoleLogger } from "../shared/Logger"
import { argv } from "process";
import { getGithubIconUrl } from "../shared/getGithubIconUrl";
import { getQmodCoverUrl } from "../shared/getQmodCoverUrl"

/**
 * Creates the json file for the given qmod url.
 * @param url - The URL of the qmod to load.
 * @param gameVersion - The game version the qmod applies to.
 * @param logger - The logger to use.  Defaults to the console.
 * @returns A boolean indicating whether the import was successful.
 */
export async function importRemoteQmod(url: string, gameVersion: string | null = null, logger: Logger = ConsoleLogger): Promise<boolean> {
  try {
    const zip = await JSZip.loadAsync(await fetchAsBuffer(url));

    const infoFile = zip.file("bmbfmod.json") || zip.file("mod.json");

    if (infoFile != null) {
      try {
        const json = JSON.parse(await infoFile.async("text"));
        const modInfo: Mod = {
          name: json.name || null,
          description: json.description || null,
          id: json.id || null,
          version: json.version || null,
          author: (!json.porter ? "" : json.porter + (isNullOrWhitespace(json.author) ? "" : ", ")) + json.author,
          authorIcon: await getGithubIconUrl(url),
          modloader: json.modloader || "QuestLoader",
          download: url,
          source: null,
          cover: await getQmodCoverUrl(url),
          funding: json.funding || null,
          website: json.website || null
        }

        gameVersion = gameVersion || json.packageVersion || json.gameVersion || "global";

        const ghMatch = ghRegex.exec(url);

        if (ghMatch && isNullOrWhitespace(modInfo.source)) {
          modInfo.source = `https://github.com/${ghMatch[1]}/${ghMatch[2]}/`;
        }

        if (ghMatch && isNullOrWhitespace(modInfo.website)) {
          modInfo.website = `https://github.com/${ghMatch[1]}/${ghMatch[2]}/`
        }

        for (const key of (Object.keys(modInfo) as (keyof (Mod))[])) {
          let value = modInfo[key];

          if (value != null && value as any instanceof Array) {
            value = modInfo[key] = (value as unknown as string[]).map(line => line.trim()).join("\n\n");
          }

          if (isNullOrWhitespace(value) || value == "undefined") {
            modInfo[key] = null;
          } else if (value != null) {
            modInfo[key] = value.trim();
          }
        }

        // Check for required fields in the mod object
        for (const field of ["name", "id", "version", "download"] as (keyof Mod)[]) {
          if (isNullOrWhitespace(modInfo[field])) {
            logger.error(`  Mod ${field} not set`);
            return false;
          }
        }

        // Validate the mod loader
        if (modInfo.modloader == null || !validModLoaders.includes(modInfo.modloader)) {
          logger.error("  Mod loader is invalid");
          return false;
        }

        const modFilename = getFilename(modInfo.id, modInfo.version, gameVersion);
        mkdirSync(dirname(modFilename), { recursive: true });
        writeFileSync(modFilename, JSON.stringify(modInfo, null, "  "));

        return true;
      } catch (error: any) {
        logger.error(`  Error processing ${infoFile.name}\n${error.message}`);
        return false;
      }
    } else {
      logger.warn("  No info json");
      return false;
    }
  } catch (error) {
    logger.error("  Invalid archive");
    return false;
  }

  return false;
}

if (argv.length > 1 && resolve(import.meta.filename) == resolve(argv[1])) {
  if (argv.length == 2) {
    const importCache = JSON.parse(readTextFile(importedCoreModsInfo, `["Do not manually modify this file."]`));

    var cores = await getCoreMods()

    for (const gameVersion in cores) {
      for (const mod of cores[gameVersion].mods || []) {
        const cacheString = [gameVersion, mod.id, mod.version, mod.downloadLink].join("\0");

        if (!importCache.includes(cacheString)) {
          console.log(mod.downloadLink);

          if (await importRemoteQmod(mod.downloadLink, gameVersion)) {
            importCache.push(cacheString)
          }
        }
      }
    }

    writeFileSync(importedCoreModsInfo, JSON.stringify(importCache, null, "  "));
  } else if (argv.length > 2) {
    const [nodeProcess, script, url, gameVersion = null] = argv;

    if (!(await importRemoteQmod(url, isNullOrWhitespace(gameVersion) ? null : gameVersion))) {
      process.exit(1);
    }
  }
}
