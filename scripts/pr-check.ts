import { readTextFile } from "./shared/readTextFile";
import { changedFilesPath } from "./shared/paths";
import { iterateSplitMods } from "./shared/iterateMods";
import { validateMod } from "../shared/validateMod";

const changedFiles = (await readTextFile(changedFilesPath, "")).replace(/\r/g, "").split("\n").filter(file => file.startsWith("mods/"));

for (const iteration of iterateSplitMods()) {
  if (changedFiles.includes(iteration.shortModPath)) {
    console.log(`Checking ${iteration.shortModPath}`)
    validateMod(iteration.getModJson());
  }
}
