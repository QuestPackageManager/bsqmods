import { mkdirSync, writeFileSync } from "fs";
import { getCoreMods } from "../shared/CoreMods"
import { importedCoreModsInfo } from "./shared/paths"
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

/**
 * Creates the json file for the given qmod url.
 * @param url - The URL of the qmod to load.
 * @param gameVersion - The game version the qmod applies to.
 * @param writeFile - If the json file should be written to disk.
 * @param logger - The logger to use.  Defaults to the console.
 * @returns The mod data if successful, or null.
 */
export async function importRemoteQmod(url: string, gameVersion: string | null = null, writeFile = true, logger: Logger = ConsoleLogger): Promise<Mod | null> {
  try {
    const result = await fetchBuffer(url);

    if (!result.data) {
      throw new Error(result.response.statusText);
    }

    const zip = await JSZip.loadAsync(result.data);

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

        return modInfo;
      } catch (error: any) {
        logger.error(`Error processing ${infoFile.name}\n${error.message}`);
        return null;
      }
    } else {
      logger.warn("No info json");
      return null;
    }
  } catch (error) {
    logger.error("Invalid archive");
    return null;
  }

  return null;
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

          if (await importRemoteQmod(mod.downloadLink, gameVersion, true, logger)) {
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

    if (!(await importRemoteQmod(url, isNullOrWhitespace(gameVersion) ? null : gameVersion, true, logger))) {
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
