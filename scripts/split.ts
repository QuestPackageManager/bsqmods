import { Mod } from "../shared/types/Mod";
import { allModsPath } from "./shared/paths";
import { ModsCollection } from "../shared/types/ModsCollection";
import { getFilename } from "./shared/getFilename";
import { readTextFile } from "./shared/readTextFile";
import { iterateCombinedMods } from "./shared/iterateMods";

for (const iteration of iterateCombinedMods()) {
  try {
    iteration.writeModJson(iteration.getModJson());
  } catch (err) {
    console.log(iteration.shortModPath)
    console.error(`  ${err}`)
  }
}

const allMods: ModsCollection = JSON.parse(readTextFile(allModsPath, "{}"));

// Loop through the keys of allMods as gameVersion
for (const gameVersion in allMods) {
  // Loop through all the mods for that game version.
  for (const mod of allMods[gameVersion]) {
    // Delete keys that don't have a value, or are only whitespace. "undefined" too.
    for (const key of Object.keys(mod) as (keyof (Mod))[]) {
      if (mod[key] == null || mod[key]?.length == 0 || mod[key] == "undefined") {
        delete mod[key];
      }
    }

    const modJson = getFilename(mod.id, mod.version, gameVersion);


  }
}
