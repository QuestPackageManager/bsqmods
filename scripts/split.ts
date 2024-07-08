import fs from "fs"
import path from "path"
import { splitModKeys } from "../shared/types/Mod";
import { allModsPath } from "./shared/paths";
import { ModsCollection } from "../shared/types/ModsCollection";
import { getFilename } from "./shared/getFilename";
import { readTextFile } from "./shared/readTextFile";

const allMods: ModsCollection = JSON.parse(readTextFile(allModsPath, "{}"));

// Loop through the keys of allMods as gameVersion
for (const gameVersion in allMods) {
  // Loop through all the mods for that game version.
  for (const mod of allMods[gameVersion]) {
    // Delete keys that don't have a value, or are only whitespace. "undefined" too.
    for (const key in mod) {
      if (mod[key] == null || mod[key].length == 0 || mod[key] == "undefined") {
        delete mod[key];
      }
    }

    const uniformMod = {}

    for (const key of splitModKeys) {
      uniformMod[key] = (mod[key] || "").trim();

      if (uniformMod[key] == "") {
        uniformMod[key] = null;
      }
    }

    const modJson = getFilename(mod.id, mod.version, gameVersion);

    fs.mkdirSync(path.dirname(modJson), { recursive: true });
    fs.writeFileSync(modJson, JSON.stringify(uniformMod, null, "  "));
  }
}
