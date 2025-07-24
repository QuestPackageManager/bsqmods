import { modMirrorMetadataPath, modMirrorPath } from "../shared/paths";
import { iterateSplitMods, ModIterationData } from "./shared/iterateMods";
import { fetchBuffer, FetchedData, fetchRedirectedLocation } from "../shared/fetch";
import JSZip from "jszip";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { Mod } from "../shared/types/Mod";
import { computeBufferSha1 } from "./shared/computeBufferSha1";
import { isNullOrWhitespace } from "../shared/isNullOrWhitespace";
import { Dictionary } from "../shared/types/Dictionary";
import { MirrorError } from "../shared/types/MirrorError";
import { getMirrorMetadata } from "../shared/types/MirrorMetadata";
import { argv } from "process";

const mirrorMetadata: Dictionary<MirrorError | string> = await getMirrorMetadata();

if (Object.keys(mirrorMetadata).length == 0 && !argv.includes("--allowEmpty")) {
  throw new Error("Existing metadata cannot be null.");
}

function getMirrorStats(mirrorMetadata: Dictionary<MirrorError | string>) {
  const mirrorFiles = Object.values(mirrorMetadata)
    .filter((file) => !(Object.values(MirrorError) as string[]).includes(file))
    .sort();

  const knownMirrors = mirrorFiles
    .map((file) => file.split("/"))
    .filter((parts) => parts.length > 1)
    .map((parts) => parts[0])
    .filter((value, index, array) => array.indexOf(value) === index)
    .sort();

  const currentMirrorFiles = mirrorFiles
    .filter((file) => file.startsWith(getMirrorPath(knownMirrors.length)))
    .filter((value, index, array) => array.indexOf(value) === index);

  const mirrorCounter = Math.max(1, knownMirrors.length);
  const fileCounter = currentMirrorFiles.length;

  return {
    mirrorFiles,
    knownMirrors,
    currentMirrorFiles,
    mirrorCounter,
    fileCounter
  };
}

const { knownMirrors, currentMirrorFiles } = getMirrorStats(mirrorMetadata);
let { mirrorCounter, fileCounter } = getMirrorStats(mirrorMetadata);

console.log(`Found ${knownMirrors.length} known mirrors.`);
console.log(`Current mirror: ${getMirrorPath()}`);
console.log(`Found ${fileCounter} files in the current mirror.`);

function getMirrorPath(mirrors?: number): string {
  if (!mirrors) {
    mirrors = mirrorCounter;
  }

  if (mirrors > 1) {
    return "mod-mirror-" + mirrors;
  }

  return "mod-mirror";
}

function checkMirrorFileCount() {
  if (fileCounter >= 1000) {
    fileCounter = 0;
    mirrorCounter++;
    console.log(`Processed 1000 files, moving to next mirror: ${getMirrorPath()}`);
  }
}

async function processMod(mod: { download: string | null }, iteration?: ModIterationData) {
  if (!mod.download) {
    throw new Error("Mod download URL is null.");
  }

  checkMirrorFileCount();

  let mirrorExtension = "qmod";
  const filenameParts = [] as string[];

  //console.log(`${iteration?.shortModPath}`);

  let qmod: FetchedData<ArrayBuffer>;

  try {
    try {
      qmod = await fetchBuffer(mod.download as string);
      console.log(mod.download);
    } catch (err) {
      const redirected = await fetchRedirectedLocation(`https://web.archive.org/web/20000101000000/${mod.download}`);

      qmod = await fetchBuffer(redirected);
      console.log(redirected);
    }
  } catch (err) {
    mirrorMetadata[mod.download] = MirrorError.FetchError;
    throw new Error("Unable to fetch qmod");
  }

  if (!qmod.data) {
    mirrorMetadata[mod.download] = MirrorError.NotFound;
    throw new Error("Unable to fetch qmod");
  }

  const qmodBuffer = Buffer.from(qmod.data);

  const mirrorSha1 = computeBufferSha1(qmodBuffer);
  filenameParts.push(mirrorSha1);

  let zip: JSZip;

  try {
    zip = await JSZip.loadAsync(qmod.data);
  } catch (err: any) {
    mirrorMetadata[mod.download] = MirrorError.InvalidArchive;
    throw err;
  }

  try {
    let zipModInfo = zip.file("mod.json");

    if (zipModInfo == null) {
      mirrorExtension = "zip";
      zipModInfo = zip.file("bmbfmod.json");
    }

    if (zipModInfo) {
      var json = JSON.parse(await zipModInfo.async("string"));

      if (!isNullOrWhitespace(json.version)) {
        filenameParts.unshift(json.version.trim());
      }

      if (!isNullOrWhitespace(json.id)) {
        filenameParts.unshift(json.id.trim());
      }
    }
  } catch (err: any) {
    console.log("  No mod json");
  }

  if (mod.download.toLowerCase().endsWith(".qmod")) {
    mirrorExtension = "qmod";
  } else if (mod.download.toLowerCase().endsWith(".zip")) {
    mirrorExtension = "zip";
  }
  ``;
  const mirrorFilename = `${filenameParts.join("-")}.${mirrorExtension}`.replace(/[^\.a-zA-Z0-9_-]+/g, "_").replace(/_+/g, "_");
  const targetPath = join(modMirrorPath, getMirrorPath(), mirrorFilename);
  const { mirrorFiles } = getMirrorStats(mirrorMetadata);
  const existingFiles = mirrorFiles.filter((file) => file.split("/").pop() == mirrorFilename);
  mirrorMetadata[mod.download] = existingFiles.length ? existingFiles[0] : `${getMirrorPath()}/${mirrorFilename}`;

  if (!existsSync(targetPath) && existingFiles.length == 0) {
    mkdirSync(join(modMirrorPath, getMirrorPath()), { recursive: true });
    writeFileSync(targetPath, qmodBuffer);

    fileCounter++;
  }

  // Write the updated metadata
  mkdirSync(dirname(modMirrorMetadataPath), { recursive: true });
  writeFileSync(modMirrorMetadataPath, JSON.stringify(mirrorMetadata, null, "  "));
}

for (const iteration of iterateSplitMods()) {
  try {
    let mod: Mod | null = null;

    if ((mod = iteration.getModJson()) != null && mod.download) {
      if (mirrorMetadata[mod.download]) {
        continue;
      }

      await processMod(mod, iteration);
    }
  } catch (err: any) {
    console.error(err);
  }
}
