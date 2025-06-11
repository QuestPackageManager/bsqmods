import { ModsCollection } from "./types/ModsCollection";
import { GroupedModsCollection } from "./types/GroupedModsCollection";
import { sortMods } from "./sortMods"
import { compareVersionDescending } from "../scripts/shared/semverComparison";

export function getModGroups(allMods: ModsCollection) {
  // Make per-version json
  const versionMap: GroupedModsCollection = {};
  const sortedMods = sortMods(allMods);

  // transform to structure
  for (const [game_ver, mods] of Object.entries(sortedMods)) {
    const modMap = versionMap[game_ver] ?? (versionMap[game_ver] = {});

    for (const mod of mods) {
      const modVersionMap = modMap[mod.id!] ?? (modMap[mod.id!] = {});
      modVersionMap[mod.version!] = mod;
    }
  }

  return {
    mappedMods: versionMap,
    mods: sortedMods,
    gameVersions: Object.keys(allMods).sort(compareVersionDescending)
  };
}
