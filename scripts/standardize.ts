import { iterateSplitMods } from "./shared/iterateMods";

for (const iteration of iterateSplitMods()) {
  try {
    iteration.writeModJson(iteration.getModJson());
  } catch (err) {
    console.log(iteration.shortModPath);
    console.error(`  ${err}`);
    console.log("");
  }
}
