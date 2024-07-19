import { mkdirSync, writeFileSync } from "fs";
import { getCoreMods } from "../shared/CoreMods"
import { importedCoreModsInfo } from "../shared/paths"
import { readTextFile } from "./shared/readTextFile"
import JSZip from "jszip";
import { Mod } from "../shared/types/Mod";
import { isNullOrWhitespace } from "../shared/isNullOrWhitespace";
import { getFilename } from "./shared/getFilename";
import { ghRegex } from "../shared/ghRegex"
import { dirname, resolve } from "path";
import { Logger, ConsoleLogger, CapturingLogger, LogLevel } from "../shared/Logger"
import { argv } from "process";
import { getGithubIconUrl } from "../shared/getGithubIconUrl";
import { getQmodCoverUrl } from "../shared/getQmodCoverUrl"
import { validateMod } from "../shared/validateMod";
import { fetchBuffer } from "../shared/fetch";
import { writeIndentedLogMessage } from "../shared/writeIndentedLogMessage"
import { CachableResult } from "../shared/cachedFetch";

/**
 * Creates the json file for the given qmod url.
 * @param url - The URL of the qmod to load.
 * @param gameVersion - The game version the qmod applies to.
 * @param writeFile - If the json file should be written to disk.
 * @param logger - The logger to use.  Defaults to the console.
 * @returns The mod data if successful, or null.
 */
export async function importRemoteQmod(url: string, gameVersion: string | null = null, writeFile = true, logger: Logger = ConsoleLogger): Promise<CachableResult<Mod | null>> {
  const result = await fetchBuffer(url);

  if (!result.data) {
    logger.error(result.response.statusText);
    return {
      data: null,
      fromCache: true
    };
  }

  try {
    const zip = await JSZip.loadAsync(result.data);

    const infoFile = zip.file("bmbfmod.json") || zip.file("mod.json");

    if (infoFile != null) {
      try {
        const json = JSON.parse(await infoFile.async("text"));
        const coverResult = await getQmodCoverUrl(url);
        const modInfo: Mod = {
          name: json.name || null,
          description: json.description || null,
          id: json.id || null,
          version: json.version || null,
          author: (!json.porter ? "" : json.porter + (isNullOrWhitespace(json.author) ? "" : ", ")) + json.author,
          authorIcon: (await getGithubIconUrl(url)).data,
          modloader: json.modloader || "QuestLoader",
          download: url,
          source: null,
          cover: coverResult.data,
          funding: [],
          website: json.website || null
        }

        if (json.funding != null) {
          if (typeof (json.funding) == "string" && !isNullOrWhitespace(json.funding)) {
            modInfo.funding = [json.funding];
          } else if (json.funding instanceof Array) {
            modInfo.funding = json.funding;
          }
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

          if (value instanceof Array) {
            for (var i = 0; i < value.length; i++) {
              if (typeof (value[i]) == "string") {
                (value as string[])[i] = value[i].trim();
              }
            }
            break;
          }

          if (key != "modloader" && key != "funding") {
            if (isNullOrWhitespace(value) || value == "undefined") {
              modInfo[key] = null;
            } else if (value != null) {
              modInfo[key] = value.trim();
            }
          }
        }

        try {
          validateMod(modInfo)
        } catch (err: any) {
          logger.error((err as Error).message)
        }

        if (writeFile) {
          const modFilename = getFilename(modInfo.id, modInfo.version, gameVersion);
          mkdirSync(dirname(modFilename), { recursive: true });
          writeFileSync(modFilename, JSON.stringify(modInfo, null, "  "));
        }

        return {
          data: modInfo,
          fromCache: coverResult.fromCache
        };
      } catch (error: any) {
        logger.error(`Error processing ${infoFile.name}\n${error.message}`);
        return {
          data: null,
          fromCache: true
        };
      }
    } else {
      logger.warn("No info json");
      return {
        data: null,
        fromCache: true
      };
    }
  } catch (error) {
    logger.error("Invalid archive");
    return {
      data: null,
      fromCache: true
    };
  }

  return {
    data: null,
    fromCache: true
  };
}

if (argv.length > 1 && resolve(import.meta.filename) == resolve(argv[1])) {
  if (argv.length == 2) {
    const importCache = JSON.parse(readTextFile(importedCoreModsInfo, `["Do not manually modify this file."]`));

    var cores = await getCoreMods()

    for (const gameVersion in cores) {
      for (const mod of cores[gameVersion].mods || []) {
        const cacheString = [gameVersion, mod.id, mod.version, mod.downloadLink].join("\0");

        if (!importCache.includes(cacheString)) {
          const logger = new CapturingLogger();

          if ((await importRemoteQmod(mod.downloadLink, gameVersion, true, logger)).data) {
            if (logger.getErrorMessages().length > 0) {
              console.log(mod.downloadLink);

              for (const message of logger.getMessages()) {
                writeIndentedLogMessage(message);
              }
            }
            importCache.push(cacheString)
          }
        }
      }
    }

    writeFileSync(importedCoreModsInfo, JSON.stringify(importCache, null, "  "));
  } else if (argv.length > 2) {
    const [nodeProcess, script, url, gameVersion = null] = argv;
    const logger = new CapturingLogger();

    if (!((await importRemoteQmod(url, isNullOrWhitespace(gameVersion) ? null : gameVersion, true, logger)).data)) {
      if (logger.getErrorMessages().length > 0) {
        console.log(url);

        for (const message of logger.getMessages()) {
          writeIndentedLogMessage(message);
        }
      }
      process.exit(1);
    }
  }
}
