import { ModsCollection } from "../shared/types/ModsCollection";
import { Mod, modKeys } from "../shared/types/Mod";
import JSZip from "jszip";
import fs from "fs"
import path from "path"
import sharp from "sharp";
import { validModLoaders } from "../shared/validModLoaders";
import { isNullOrWhitespace } from "../shared/isNullOrWhitespace";
import { fetchRedirectedLocation } from "../shared/fetchRedirectedLocation"
import { exitWithError } from "./shared/exitWithError";
import { checkUrl } from "./shared/checkUrl";
import { fetchAsBuffer } from "./shared/fetchAsBuffer";
import { downloadFile } from "./shared/downloadFile";
import { getFilename } from "./shared/getFilename";
import { computeBufferSha1 } from "./shared/computeBufferSha1";
import { QmodResult } from "./shared/QmodResult";
import { hashesPath, coversPath, qmodsPath, repoDir, allModsPath, modsPath, qmodRepoDirPath, versionsModsPath } from "./shared/paths";
import { getQmodHashes } from "./shared/getQmodHashes";
import { ghRegex } from "../shared/ghRegex";

/** All of the mods after combine the individual files */
const allMods: ModsCollection = {};

/** A dictionary of all hashes for given urls. */
const hashes = getQmodHashes();

const ghIcons: {
  [key: string]: string;
} = {};

/** Public url base */
let urlBase = (() => {
  const baseHrefArg = "--baseHref=";

  for (const arg of process.argv) {
    if (arg.startsWith(baseHrefArg)) {
      return arg.substring(baseHrefArg.length);
    }
  }

  return ".";
})();

/**
 * Processes a mod by downloading the file, hashing it, creating a resized cover image, and updating the cover image link.
 * @param modInfo - The mod info.
 * @param gameVersion - The target game version.
 * @returns
 */
async function processQmod(mod: Mod, gameVersion: string): Promise<QmodResult> {
  const output: QmodResult = {
    messages: [],
    errors: [],
    warnings: [],
    hash: null
  };

  if (process.argv.indexOf("--skipHashes") !== -1) {
    return output;
  }

  let qmodHash: string | null = mod.download ? hashes[mod.download] : null;
  let coverFilename = path.join(coversPath, `${qmodHash}.png`);

  if (!mod.download) {
    throw new Error("Mod download not set.")
  }

  if (process.argv.indexOf("--recheckUrls") !== -1 && qmodHash != null && !(await checkUrl(mod.download))) {
    qmodHash = null;
    if (mod.download) {
      delete hashes[mod.download];
    }
  }

  const ghMatch = ghRegex.exec(mod.download);
  if (ghMatch) {
    ghIcons[ghMatch[1]] = ghIcons[ghMatch[1]] || `https://github.com/${ghMatch[1]}.png`;
    mod.authorIcon = await fetchRedirectedLocation(ghIcons[ghMatch[1]])
  }

  // We've already processed this, don't do it again.
  if (qmodHash != null) {
    output.hash = qmodHash;

    if (fs.existsSync(coverFilename)) {
      mod.cover = `${urlBase}/covers/${path.basename(coverFilename)}`;
    }
    return output;
  }

  if (!mod.id) {
    throw new Error("Mod ID not set")
  }

  if (!mod.version) {
    throw new Error("Mod version not set")
  }

  if (!mod.download) {
    throw new Error("Mod download not set")
  }

  const qmodPath = getFilename(mod.id, mod.version, gameVersion, qmodsPath, "qmod");
  fs.mkdirSync(path.dirname(qmodPath), { recursive: true });

  output.messages.push(mod.download);

  if (fs.existsSync(qmodPath)) {
    qmodHash = computeBufferSha1(fs.readFileSync(qmodPath));
  } else {
    qmodHash = await downloadFile(mod.download, qmodPath);
  }

  coverFilename = path.join(coversPath, `${qmodHash}.png`);

  if (qmodHash == null) {
    // File not found.
    output.errors.push("Not found");
    return output;
    // process.exit(1);
  }

  hashes[mod.download] = qmodHash;
  output.hash = qmodHash;

  if (!fs.existsSync(qmodPath)) {
    output.errors.push("Local file not found");
    return output;
  }

  let coverFile: JSZip.JSZipObject | null = null;

  try {
    const zip = await JSZip.loadAsync(fs.readFileSync(qmodPath));

    const infoFile = zip.file("bmbfmod.json") || zip.file("mod.json");

    if (infoFile != null) {
      try {
        const json = JSON.parse(await infoFile.async("text"));
        const coverImageFilename = json.coverImageFilename || json.coverImage;

        if (!isNullOrWhitespace(coverImageFilename) && coverImageFilename !== "undefined") {
          coverFile = zip.file(coverImageFilename);

          if (coverFile == null) {
            output.warnings.push(`Cover file not found: ${path.join(qmodPath.substring(qmodsPath.length + 1), coverImageFilename)}`);
          }
        }
      } catch (error) {
        output.errors.push(`Processing ${infoFile.name}`);
        return output;
      }
    } else {
      output.errors.push("No info json");
      return output;
    }
  } catch (error) {
    output.errors.push("Reading archive");
    fs.unlinkSync(qmodPath);
    return output;
  }

  let coverBuffer: Buffer | undefined;

  try {
    if (coverFile) {

      coverBuffer = await coverFile.async("nodebuffer");
    } else if (mod.cover) {
      coverBuffer = await fetchAsBuffer(mod.cover);
    }
  } catch (error) {
    output.warnings.push("Error fetching cover buffer");
  }

  if (coverBuffer) {
    try {
      if (!fs.existsSync(coverFilename)) {
        fs.mkdirSync(coversPath, { recursive: true });

        await sharp(coverBuffer)
          .rotate()
          .resize(512, 512, {
            fit: "inside",
            withoutEnlargement: true
          })
          .png({
            compressionLevel: 9.0,
            palette: true
          })
          .toFile(coverFilename);
      }

      mod.cover = `${urlBase}/covers/${path.basename(coverFilename)}`;
    } catch (error) {
      output.warnings.push("Error processing cover file");
      output.warnings.push(`${(error as any).message}`);
    }
  }

  return output;
}

// Async anonymous function to be able to `await`

// Read all game versions from the mods directory
const gameVersions = fs.readdirSync(modsPath)
  .filter(versionPath => fs.statSync(path.join(modsPath, versionPath)).isDirectory());

for (const version of gameVersions) {
  const versionPath = path.join(modsPath, version);
  const mods = allMods[version] || (allMods[version] = []);
  const modFilenames = fs.readdirSync(versionPath)
    .filter(modPath => modPath.toLowerCase().endsWith(".json") && fs.statSync(path.join(versionPath, modPath)).isFile());

  for (const modFilename of modFilenames) {
    const modPath = path.join(versionPath, modFilename);
    const shortModPath = modPath.substring(repoDir.length + 1);
    const mod: Mod = JSON.parse(fs.readFileSync(modPath, "utf8"));
    const requiredFilename = getFilename(mod.id || "", mod.version || "", version, modsPath, "json");

    // Verify if the mod file is named correctly
    if (shortModPath !== requiredFilename.substring(repoDir.length + 1)) {
      exitWithError(`Mod filename is not what it should be.  ${shortModPath} should be ${requiredFilename.substring(repoDir.length + 1)}`);
    }

    // Check for required fields in the mod object
    for (const field of ["name", "id", "version", "download"] as (keyof Mod)[]) {
      if (isNullOrWhitespace(mod[field])) {
        exitWithError(`Mod ${field} not set`);
      }
    }

    // Validate the mod loader
    if (mod.modloader == null || !validModLoaders.includes(mod.modloader)) {
      exitWithError("Mod loader is invalid");
    }

    // Process the mod file and generate a hash
    const qmodResult = await processQmod(mod, version);
    const uniformMod: Partial<Mod> = {};

    // Normalize the mod object by trimming and setting empty strings to null
    for (const key of modKeys) {
      uniformMod[key] = (mod[key] || "").trim();

      if (uniformMod[key] === "") {
        uniformMod[key] = null;
      }
    }

    // If there are no errors, add the mod to the list and save the hash
    if (qmodResult.errors.length === 0) {
      if (uniformMod.download) {
        uniformMod.hash = hashes[uniformMod.download];
      }

      mods.push(uniformMod as Mod);
    } else {
      if (uniformMod.download) {
        delete hashes[uniformMod.download];
      }
    }

    // Log any warnings or errors encountered during processing
    if (qmodResult.warnings.length > 0 || qmodResult.errors.length > 0) {
      console.log(`${qmodResult.errors.length > 0 ? "Errors" : "Warnings"} when processing ${shortModPath}`);

      qmodResult.messages.forEach(warning => console.log(`  Message: ${warning}`));
      qmodResult.warnings.forEach(warning => console.warn(`  Warning: ${warning}`));
      qmodResult.errors.forEach(error => console.error(`  Error: ${error}`));

      console.log("");
    }

    // Save the updated hashes to the hashes file
    fs.writeFileSync(hashesPath, JSON.stringify(hashes));
  }
}

// Create the directory for the combined JSON file if it doesn't exist and save the combined mods data
fs.mkdirSync(path.dirname(allModsPath), { recursive: true });
fs.writeFileSync(allModsPath, JSON.stringify(allMods));

// Create the directory for the versions JSON file if it doesn't exist and save the data
fs.mkdirSync(path.dirname(versionsModsPath), { recursive: true });
fs.writeFileSync(versionsModsPath, JSON.stringify(Object.keys(allMods)));

// now make per-version json
type GameVersionType = string

type ModIdType = string
type ModVersionType = string
type ModObjectType = unknown
type QmodRepoResult = Record<ModIdType, Record<ModVersionType, ModObjectType>>

const versionMap: Record<GameVersionType, QmodRepoResult> = {}

// transform to structure
Object.entries(allMods).forEach(([game_ver, mods]) => {
  const modMap = versionMap[game_ver] ?? (versionMap[game_ver] = {})

  mods.forEach(mod => {
    const modVersionMap = modMap[mod.id!] ?? (modMap[mod.id!] = {});

    modVersionMap[mod.version!] = mod
  })
})

// now write
// Create the directory
fs.mkdirSync(qmodRepoDirPath, { recursive: true });

Object.entries(versionMap).forEach(([game_ver, qmodRepo]) => {
  const versionFile = path.join(qmodRepoDirPath, game_ver);
  fs.writeFileSync(`${versionFile}.json`, JSON.stringify(qmodRepo));
});
