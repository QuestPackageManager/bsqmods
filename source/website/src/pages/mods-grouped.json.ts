import { readAllModsJson } from "../../../shared/readAllModsJson";
import { getModGroups } from "../../../shared/getModGroups";

export function GET(): Response {
  const { mappedMods, mods, gameVersions } = getModGroups(readAllModsJson());

  return new Response(JSON.stringify(mappedMods));
}
