import { Mod } from "../shared/types/Mod";
import { iterateCombinedMods } from "./shared/iterateMods";

for (const iteration of iterateCombinedMods()) {
  try {
    const mod = iteration.getModJson();

    // Delete keys that don't have a value, or are only whitespace. "undefined" too.
    for (const key of Object.keys(mod) as (keyof Mod)[]) {
      if (mod[key] == null || mod[key]?.length == 0 || mod[key] == "undefined") {
        delete mod[key];
      }
    }

    iteration.writeModJson(mod);
  } catch (err) {
    console.log(iteration.shortModPath);
    console.error(`  ${err}`);
  }
}
