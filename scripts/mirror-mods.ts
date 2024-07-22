import { modMirrorMetadataPath, modMirrorPath } from "../shared/paths";
import { iterateSplitMods } from "./shared/iterateMods";
import { fetchBuffer, FetchedData } from "../shared/fetch";
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

for (const iteration of iterateSplitMods()) {
  try {
    let mod: Mod | null = null

    if ((mod = iteration.getModJson()) != null && mod.download) {
      if (mirrorMetadata[mod.download]) {
        continue;
      }

      let mirrorExtension = "qmod";
      const filenameParts = [] as string[];

      console.log(`${iteration.shortModPath}`);

      let qmod: FetchedData<ArrayBuffer>;

      try {
        qmod = await fetchBuffer(mod.download as string);
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
        console.log("  No mod json")
      }

      if (mod.download.toLowerCase().endsWith(".qmod")) {
        mirrorExtension = "qmod";
      } else if (mod.download.toLowerCase().endsWith(".zip")) {
        mirrorExtension = "zip";
      }

      const mirrorFilename = `${filenameParts.join("-")}.${mirrorExtension}`.replace(/[^\.a-zA-Z0-9_-]+/g, "_").replace(/_+/g, "_");
      const targetPath = join(modMirrorPath, mirrorFilename);

      mirrorMetadata[mod.download] = mirrorFilename;

      if (!existsSync(targetPath)) {
        mkdirSync(modMirrorPath, { recursive: true });
        writeFileSync(targetPath, qmodBuffer)
      }

      // Write the updated metadata
      mkdirSync(dirname(modMirrorMetadataPath), { recursive: true });
      writeFileSync(modMirrorMetadataPath, JSON.stringify(mirrorMetadata, null, "  "))
    }
  } catch (err: any) {
    console.error(err);
  }
}
