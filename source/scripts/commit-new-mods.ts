import { getNewFilesAsync } from "./shared/getNewFiles";
import { readTextFile } from "./shared/readTextFile";
import { changedFilesPath } from "../shared/paths";
import { iterateSplitMods } from "./shared/iterateMods";
import { validateMod } from "../shared/validateMod";
import { fetchBuffer } from "../shared/fetch";
import JSZip from "jszip";
import { existsSync } from "fs";
import { validateQmodModJson } from "../shared/validateQmodModJson";
import { getIndentedMessage } from "../shared/getIndentedMessage";
import { argv, chdir } from "process";
import { repoDir } from "../shared/paths";
import { executeCommand } from "./shared/executeCommand";

const newMods = await getNewFilesAsync("mods", repoDir);

for (const iteration of iterateSplitMods()) {
  if (newMods.includes(iteration.shortModPath)) {
    // This is a new mod, process it.
    const mod = iteration.getModJson();

    await executeCommand("git", ["add", iteration.shortModPath], false, repoDir);
    await executeCommand("git", [
      "commit",
      "-m",
      `${mod.name} v${mod.version}\n\nID: ${mod.id}\nAuthor: ${mod.author}\nMod Loader: ${mod.modloader}\nGame Version: ${iteration.version}\n\n${mod.description}`.trim()
    ]);

    console.log(`Added mod: ${iteration.shortModPath}`);
  }
}
