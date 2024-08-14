import JSZip from "jszip";
import { getCoreMods } from "./CoreMods";
import { ModLoader } from "./types/ModLoader";
import { semverDate } from "./semverDate";
import { parseUTCDate } from "./parseUTCDate";
import { DependencyQmodArguments, DependencyQmodInfo, generateDependencyQmod } from "./generateDependencyQmod";

/**
 * Generates the CoreQmodJSON object for the specified version.
 *
 * @param version - The version of Beat Saber.
 * @returns A promise that resolves to the CoreQmodJSON object.
 */
async function generateCoreQmodInfo(version: string): Promise<DependencyQmodInfo> {
  const json: DependencyQmodInfo = {
    name: `Core mods for ${version}`,
    id: `CoreMods_${version}`,
    author: "QuestPackageManager",
    description: "",
    version: "1.0.0",
    packageId: "com.beatgames.beatsaber",
    packageVersion: version,
    modloader: version > "1.28.0_4124311467" ? ModLoader.Scotland2 : ModLoader.QuestLoader,
    dependencies: []
  };

  const cores = await getCoreMods();

  if (cores[version]) {
    const lastUpdated = cores[version].lastUpdated;

    try {
      json.version = semverDate(parseUTCDate(lastUpdated));
    } catch (_: any) {}

    for (const mod of cores[version].mods) {
      json.dependencies!.push({
        id: mod.id,
        version: `^${mod.version}`,
        downloadIfMissing: mod.downloadLink
      });
    }
  }

  return json;
}

/**
 * Generates a JSZip object containing the mods.json file for the specified version.
 *
 * @param version - The version of Beat Saber.
 * @returns A promise that resolves to the JSZip object.
 */
export async function generateCoresQmod(version: string): Promise<{ qmod: JSZip; filename: string }> {
  const info = await generateCoreQmodInfo(version);

  return await generateDependencyQmod({
    ...info,
    filename: `CoreMods_${version}.qmod`
  });
}
