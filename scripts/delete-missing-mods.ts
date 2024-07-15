import { unlinkSync } from "fs";
import { iterateSplitMods } from "./shared/iterateMods";
import { fetchHead } from "../shared/fetch";

for (const iteration of iterateSplitMods()) {
  console.log(iteration.shortModPath);

  try {
    const json = iteration.getModJson();

    if (!(await fetchHead(json.download))) {
      unlinkSync(iteration.modPath)
    }
  } catch (err) {
    console.log(iteration.shortModPath);
    console.error(`  ${err}`);
    console.log("");
  }
}
