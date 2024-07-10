import { unlinkSync } from "fs";
import { iterateSplitMods } from "./shared/iterateMods";

for (const iteration of iterateSplitMods()) {
  try {
    const json = iteration.getModJson();

    if ((/^https?:\/\/cdn\.discordapp\.com/).exec(json?.download || "")) {
      unlinkSync(iteration.modPath)
    }
  } catch (err) {
    console.log(iteration.shortModPath);
    console.error(`  ${err}`);
    console.log("");
  }
}
