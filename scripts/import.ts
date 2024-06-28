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
import { dirname } from "path";

(async () => {
  const importCache = JSON.parse(readTextFile(importedCoreModsInfo, `["Do not manually modify this file."]`));

  var cores = await getCoreMods()

  for (const gameVersion in cores) {
    for (const mod of cores[gameVersion].mods || []) {
      const cacheString = [gameVersion, mod.id, mod.version, mod.downloadLink].join("\0");

      if (!importCache.includes(cacheString)) {
        console.log(mod.downloadLink);

        try {
          const zip = await JSZip.loadAsync(await fetchAsBuffer(mod.downloadLink));

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
                modloader: json.modloader || "QuestLoader",
                download: mod.downloadLink,
                source: null,
                cover: null,
                funding: json.funding || null,
                website: json.website || null
              }

              if (isNullOrWhitespace(modInfo.source)) {
                const match = ghRegex.exec(mod.downloadLink);

                if (match) {
                  modInfo.source = `https://github.com/${match[1]}/${match[2]}/`;
                }
              }

              for (const key in modInfo) {
                let value = modInfo[key];

                if (value instanceof Array) {
                  value = modInfo[key] = value.map(line => line.trim()).join("\n\n");
                }

                if (isNullOrWhitespace(value) || value == "undefined") {
                  modInfo[key] = null;
                } else {
                  modInfo[key] = value.trim();
                }
              }

              // Check for required fields in the mod object
              for (const field of ["name", "id", "version", "download"] as (keyof Mod)[]) {
                if (isNullOrWhitespace(modInfo[field])) {
                  console.error(`  Mod ${field} not set`);
                  continue;
                }
              }

              // Validate the mod loader
              if (modInfo.modloader == null || !validModLoaders.includes(modInfo.modloader)) {
                console.error("  Mod loader is invalid");
                continue;
              }

              const modFilename = getFilename(modInfo.id, modInfo.version, gameVersion);
              mkdirSync(dirname(modFilename), { recursive: true });
              writeFileSync(modFilename, JSON.stringify(modInfo, null, "  "));
            } catch (error) {
              console.error(`  Error processing ${infoFile.name}\n${error.message}`);
              continue;
            }
          } else {
            console.warn("  No info json");
            continue;
          }
        } catch (error) {
          console.error("  Invalid archive");
          continue;
        }
      }

      importCache.push(cacheString)
    }
  }

  writeFileSync(importedCoreModsInfo, JSON.stringify(importCache, null, "  "));
})()
