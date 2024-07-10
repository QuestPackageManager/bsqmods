import { unlinkSync } from "fs";
import { fetchHead } from "../shared/fetch";
import { CapturingLogger } from "../shared/Logger";
import { writeIndentedLogMessage } from "../shared/writeIndentedLogMessage";
import { importRemoteQmod } from "./import";
import { iterateSplitMods } from "./shared/iterateMods";

for (const iteration of iterateSplitMods()) {
  try {
    const json = iteration.getModJson();

    if ((/^https?:\/\/cdn\.discordapp\.com/).exec(json.download)) {
      unlinkSync(iteration.modPath)
    }
  } catch (err) {
    console.log(iteration.shortModPath);
    console.error(`  ${err}`);
    console.log("");
  }
}
