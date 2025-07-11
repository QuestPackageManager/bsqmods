import { ModsCollection } from "../shared/types/ModsCollection";
import { Mod } from "../shared/types/Mod";
import JSZip from "jszip";
import JSON5 from "json5";
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "fs";
import { basename, dirname, join } from "path";
import sharp from "sharp";
import { isNullOrWhitespace } from "../shared/isNullOrWhitespace";
import { exitWithError } from "./shared/exitWithError";
import { downloadFile } from "./shared/downloadFile";
import { getFilename } from "./shared/getFilename";
import { computeBufferSha1 } from "./shared/computeBufferSha1";
import { QmodResult } from "./shared/QmodResult";
import { modMetadataPath, coversPath, qmodsPath, repoDir, allModsPath, modsPath, fundingInfoPath } from "../shared/paths";
import { getQmodHashes } from "./shared/getQmodHashes";
import { getGithubIconUrl } from "../shared/getGithubIconUrl";
import { getStandardizedMod } from "../shared/getStandardizedMod";
import { validateMod } from "../shared/validateMod";
import { iterateSplitMods } from "./shared/iterateMods";
import { fetchBuffer, fetchHead } from "../shared/fetch";
import { getFundingCache } from "./shared/getFundingCache";
import { ghRegex } from "../shared/ghRegex";
import { getRepoFundingInfo } from "../shared/getRepoFundingInfo";
import { argv } from "process";
import { logGithubApiUsage } from "../shared/logGithubApiUsage";
import { ModMetadata } from "../shared/types/ModMetadata";
import { getOptimizedCoverFilePath } from "./shared/getOptimizedCoverFilePath";
import { getOriginalCoverFilePath } from "./shared/getOriginalCoverFilePath";
import { getMirrorMetadata, hasMirrorUrl, mirrorBase, MirrorMetadata } from "../shared/types/MirrorMetadata";
import { getModGroups } from "../shared/getModGroups";

/** All of the mods after combine the individual files */
const allMods: ModsCollection = {};

/** A dictionary of all hashes for given urls. */
const hashes = getQmodHashes();

/** A dictionary of repository funding information. */
const funding = argv.includes("--updateFunding") ? {} : await getFundingCache();

/** Public url base */
let urlBase = (() => {
  const targetArg = "--baseHref=";

  for (const arg of process.argv) {
    if (arg.startsWith(targetArg)) {
      return arg.substring(targetArg.length);
    }
  }

  return ".";
})();

/** The base path to the mod mirror. */
let mirrorMetadata: MirrorMetadata = await getMirrorMetadata();

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

  const metadata =
    hashes[mod.download as string] ||
    ({
      hash: null,
      image: null,
      useMirror: false
    } as ModMetadata);

  if (!mod.download) {
    throw new Error("Mod download not set.");
  }

  let originalUrl = mod.download;
  const originalHash = hashes[originalUrl]?.hash;
  const mirrorHash = (() => {
    if (hasMirrorUrl(originalUrl, mirrorMetadata)) {
      const hash = mirrorMetadata[originalUrl].split("-").pop().split(".").shift();

      if (hash.length == 40) {
        return hash;
      }
    }

    return null;
  })();

  if (process.argv.indexOf("--recheckUrls") !== -1 && metadata.hash != null && !(await fetchHead(mod.download))) {
    metadata.hash = null;
    metadata.image = null;

    delete hashes[originalUrl];
  }

  const alreadyHashed = hashes[originalUrl as string]?.hash != null;

  mod.authorIcon = mod.authorIcon || (await getGithubIconUrl(mod.download)).data;
  output.hash = metadata.hash;

  const coverFilename = getOptimizedCoverFilePath(metadata.image);
  if (coverFilename && existsSync(coverFilename)) {
    mod.cover = `${urlBase}/covers/${basename(coverFilename)}`;
  }

  if (!mod.id) {
    throw new Error("Mod ID not set");
  }

  if (!mod.version) {
    throw new Error("Mod version not set");
  }

  if (!mod.download) {
    throw new Error("Mod download not set");
  }

  let coverFile: JSZip.JSZipObject | null = null;
  let coverImageFilename = null as string | null;

  if (!alreadyHashed) {
    const qmodPath = getFilename(mod.id, mod.version, gameVersion, qmodsPath, "qmod");
    mkdirSync(dirname(qmodPath), { recursive: true });

    output.messages.push(mod.download);

    if (existsSync(qmodPath)) {
      metadata.hash = computeBufferSha1(readFileSync(qmodPath));
    } else {
      metadata.hash = await downloadFile(mod.download, qmodPath);
    }

    metadata.useMirror = hasMirrorUrl(originalUrl, mirrorMetadata) && (!metadata.hash || metadata.hash != mirrorHash);

    // If both hashes exist and there's a mismatch, log it
    if (metadata.hash && mirrorHash && metadata.hash != mirrorHash) {
      output.warnings.push(`Hash mismatch - New: ${metadata.hash} - Old: ${originalHash}`);
    }
    
    if (metadata.useMirror) {
      metadata.hash = null;
      hashes[originalUrl] = metadata;
      mod.download = `${mirrorBase}/${mirrorMetadata[originalUrl]}`;

      return await processQmod(mod, gameVersion);
    }

    if (!metadata.hash) {
      // File not found.
      output.errors.push("Not found");
      return output;
    }

    hashes[originalUrl] = metadata;
    output.hash = metadata.hash;

    if (!existsSync(qmodPath)) {
      output.errors.push("Local file not found");
      return output;
    }

    try {
      const zip = await JSZip.loadAsync(readFileSync(qmodPath));

      const infoFile = zip.file("bmbfmod.json") || zip.file("mod.json");

      if (infoFile != null) {
        try {
          const json = JSON5.parse(await infoFile.async("text"));
          coverImageFilename = json.coverImageFilename || json.coverImage;

          if (coverImageFilename && !isNullOrWhitespace(coverImageFilename) && coverImageFilename !== "undefined") {
            coverFile = zip.file(coverImageFilename);

            if (coverFile == null) {
              output.warnings.push(`Cover file not found: ${join(qmodPath.substring(qmodsPath.length + 1), coverImageFilename)}`);
              coverImageFilename = null;
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
      unlinkSync(qmodPath);
      return output;
    }
  }

  if (metadata.useMirror && hasMirrorUrl(originalUrl, mirrorMetadata)) {
    mod.download = `${mirrorBase}/${mirrorMetadata[originalUrl]}`;
  }

  if (!metadata.image?.hash) {
    let coverBuffer: Buffer | undefined;

    try {
      if (coverFile) {
        coverBuffer = await coverFile.async("nodebuffer");
      } else if (mod.cover) {
        const result = await fetchBuffer(mod.cover);

        if (result.data) {
          coverBuffer = Buffer.from(result.data);
          coverImageFilename = basename(mod.cover);
        } else {
          throw new Error(result.response.statusText);
        }
      }
    } catch (error) {
      output.warnings.push("Error fetching cover buffer");
    }

    if (coverBuffer && coverImageFilename) {
      metadata.image = {
        hash: null,
        extension: coverImageFilename.split(".").at(-1) || null
      };

      if (metadata.image.extension?.toLowerCase() === "png") {
        try {
          const newBuffer = Buffer.alloc(0);

          coverBuffer = await sharp(coverBuffer)
            .png({
              compressionLevel: 9.0,
              palette: true
            })
            .toBuffer();
        } catch (error) {
          output.warnings.push("Error processing cover file");
          output.warnings.push(`${(error as any).message}`);
        }
      }

      metadata.image.hash = computeBufferSha1(coverBuffer);

      const originalCoverFilename = getOriginalCoverFilePath(metadata.image);
      const coverFilename = getOptimizedCoverFilePath(metadata.image);

      if (originalCoverFilename && !existsSync(originalCoverFilename)) {
        mkdirSync(dirname(originalCoverFilename), { recursive: true });
        writeFileSync(originalCoverFilename, coverBuffer);
      }

      try {
        if (coverFilename && !existsSync(coverFilename)) {
          mkdirSync(coversPath, { recursive: true });

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

        mod.cover = `${urlBase}/covers/${basename(coverFilename as string)}`;
      } catch (error) {
        output.warnings.push("Error processing cover file");
        output.warnings.push(`${(error as any).message}`);
      }
    }
  }

  const ogCoverFilename = getOriginalCoverFilePath(metadata.image);
  if (ogCoverFilename && existsSync(ogCoverFilename)) {
    mod.ogCover = `${urlBase}/covers/originals/${basename(ogCoverFilename)}`;
  }

  return output;
}

await logGithubApiUsage();

for (const iteration of iterateSplitMods()) {
  const mods = allMods[iteration.version] || (allMods[iteration.version] = []);
  const mod: Mod = iteration.getModJson();
  const requiredFilename = getFilename(mod.id || "", mod.version || "", iteration.version, modsPath, "json");

  // Verify if the mod file is named correctly
  if (iteration.shortModPath !== requiredFilename.substring(repoDir.length + 1)) {
    exitWithError(`Mod filename is not what it should be.  ${iteration.shortModPath} should be ${requiredFilename.substring(repoDir.length + 1)}`);
  }

  try {
    validateMod(mod);
  } catch (err: any) {
    exitWithError((err as Error).message);
  }

  // Process the mod file and generate a hash
  const originalUrl = mod.download;
  const qmodResult = await processQmod(mod, iteration.version);
  const uniformMod = getStandardizedMod(mod);

  if (uniformMod.funding.length == 0) {
    const match = ghRegex.exec(originalUrl ?? "");

    if (match) {
      const cacheKey = `${match[1]}/${match[2]}`.toLowerCase();

      if (!funding[cacheKey]) {
        const fundingResult = await getRepoFundingInfo(originalUrl || "");
        funding[cacheKey] = fundingResult;
      }

      uniformMod.funding = funding[cacheKey] || [];
    }

    writeFileSync(fundingInfoPath, JSON.stringify(funding));
  }

  // If there are no errors, add the mod to the list and save the hash
  if (qmodResult.errors.length === 0) {
    if (originalUrl) {
      uniformMod.hash = hashes[originalUrl].hash;
    }

    mods.push(uniformMod as Mod);
  } else {
    if (originalUrl) {
      delete hashes[originalUrl];
    }
  }

  // Log any warnings or errors encountered during processing
  if (qmodResult.warnings.length > 0 || qmodResult.errors.length > 0) {
    console.log(`${qmodResult.errors.length > 0 ? "Errors" : "Warnings"} when processing ${iteration.shortModPath}`);

    qmodResult.messages.forEach((warning) => console.log(`  Message: ${warning}`));
    qmodResult.warnings.forEach((warning) => console.warn(`  Warning: ${warning}`));
    qmodResult.errors.forEach((error) => console.error(`  Error: ${error}`));

    console.log("");
  }

  // Save the updated hashes to the hashes file
  writeFileSync(modMetadataPath, JSON.stringify(hashes));
}

const { mappedMods: versionMap, mods: sortedMods, gameVersions } = getModGroups(allMods);

// Create the directory for the combined JSON file if it doesn't exist and save the combined mods data
mkdirSync(dirname(allModsPath), { recursive: true });
writeFileSync(allModsPath, JSON.stringify(sortedMods));

await logGithubApiUsage();
