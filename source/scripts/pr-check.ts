import { readTextFile } from "./shared/readTextFile";
import { changedFilesPath } from "../shared/paths";
import { iterateSplitMods } from "./shared/iterateMods";
import { validateMod } from "../shared/validateMod";
import { fetchBuffer } from "../shared/fetch";
import JSZip from "jszip";
import { existsSync } from "fs";
import { validateQmodModJson } from "../shared/validateQmodModJson";
import { getIndentedMessage } from "../shared/getIndentedMessage";
import { argv } from "process";

const changeFilesExists = existsSync(changedFilesPath);
const changedFiles = changeFilesExists
  ? (await readTextFile(changedFilesPath, "")).replace(/\r/g, "").split("\n").filter(file => file.startsWith("mods/"))
  : [];
const checkAll = argv.includes("--all");

class ValidationError {
  err: string
  file: string
  section: string

  constructor(file: string, err: string, section: string) {
    this.err = err;
    this.file = file;
    this.section = section;
  }

  toString() {
    return `${this.file}\n${getIndentedMessage(this.section, 1)}\n${getIndentedMessage(this.err, 2)}`
  }
}

let lastSection = "";
async function section<T>(section: string, callback: (() => Promise<T>)) {
  lastSection = section;
  return await callback();
}

const errors: ValidationError[] = [];

for (const iteration of iterateSplitMods()) {
  try {
    iteration.getModJson()
    if (checkAll || changedFiles.includes(iteration.shortModPath)) {
      const json = iteration.getModJson();
      console.log(`Checking ${iteration.shortModPath}`);

      await section("Mod info", async () => {
        validateMod(json);
      })

      const zipModInfo = await section("Mod archive", async () => {
        const qmod = await fetchBuffer(json.download as string)
        if (!qmod.data) {
          throw new Error("Unable to fetch qmod");
        }

        const zip = await JSZip.loadAsync(qmod.data);
        const zipModInfo = zip.file("mod.json");

        if (zipModInfo == null) {
          throw new Error("No mod.json");
        }

        return zipModInfo;
      });

      // Validate mod.json against the qmod schema
      await section("Qmod mod.json", async () => {
        await validateQmodModJson(JSON.parse(await zipModInfo.async("string")))
      });
    }
  } catch (err: any) {
    errors.push(new ValidationError(iteration.shortModPath, err.message || err.toString(), lastSection));

    if (argv.includes("--stopEarly")) {
      break;
    }
  }
}

if (errors.length > 0) {
  console.error("\nErrors occurred during validation:");

  for (const err of errors) {
    console.error(getIndentedMessage(err.toString(), 1), "\n");
  }

  console.error(`Finished with ${errors.length} ${errors.length > 1 ? "errors" : "error"}`);

  process.exit(1);
}

console.log("\nFinished");
