import { readdirSync, statSync, writeFileSync } from "fs";
import path, { join } from "path";
import { modsPath } from "./shared/paths";
import { readTextFile } from "./shared/readTextFile";
import { Mod, splitModKeys } from "../shared/types/Mod";
import { getGithubIconUrl } from "../shared/getGithubIconUrl";
import { getStandardizedMod } from "../shared/getStandardizedMod";

const gameVersions = readdirSync(modsPath)
  .filter(versionPath => statSync(join(modsPath, versionPath)).isDirectory());

for (const version of gameVersions) {
  const versionPath = path.join(modsPath, version);
  const modFilenames = readdirSync(versionPath)
    .filter(modPath => modPath.toLowerCase().endsWith(".json") && statSync(path.join(versionPath, modPath)).isFile());

  for (const modFilename of modFilenames) {
    const modPath = path.join(versionPath, modFilename);

    try {
      var json: Mod = JSON.parse(await readTextFile(modPath, ""));

      if (json.authorIcon == null) {
        if (json.authorIcon = await getGithubIconUrl(json.download as string)) {
          writeFileSync(modPath, JSON.stringify(getStandardizedMod(json, splitModKeys), null, "  "));
        }
      }
    } catch (err) {
      console.log(modPath.substring(modsPath.length + 1));
      console.error(err);
      console.log("");
    }
  }
}
