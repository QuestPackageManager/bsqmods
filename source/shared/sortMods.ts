import { compareAlphabeticallyAscInsensitive, compareVersionAscending } from "./comparisonFunctions";
import { compareVersionDescending } from "../scripts/shared/semverComparison";
import { ModsCollection } from "./types/ModsCollection";
import { Mod } from "./types/Mod";

export function sortMods(mods: ModsCollection): ModsCollection {
  const sortedMods: ModsCollection = {};

  for (const version of Object.keys(mods).sort(compareVersionAscending)) {
    mods[version].sort((a, b) => compareVersionAscending(a.version, b.version)).sort((a, b) => compareAlphabeticallyAscInsensitive(a.id, b.id));

    sortedMods[version] = mods[version];
  }

  return sortedMods;
}
