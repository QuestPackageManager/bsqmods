import { getNewFilesAsync } from "./shared/getNewFiles";
import { iterateSplitMods } from "./shared/iterateMods";
import { repoDir } from "../shared/paths";
import { executeCommand } from "./shared/executeCommand";

const newMods = await getNewFilesAsync("mods", repoDir);

for (const iteration of iterateSplitMods()) {
  if (newMods.includes(iteration.shortModPath)) {
    // This is a new mod, process it.
    const mod = iteration.getModJson();
    console.log(mod.download);
  }
}
