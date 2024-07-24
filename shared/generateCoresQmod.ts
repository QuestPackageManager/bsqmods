import JSZip from "jszip";
import { getCoreMods } from "./CoreMods";
import { ModLoader } from "./types/ModLoader";

/**
 * Interface representing the structure of the CoreQmodJSON object.
 */
interface CoreQmodJSON {
  _QPVersion: string;
  name: string;
  id: string;
  author: string;
  description: string;
  version: string;
  packageId: string;
  packageVersion: string;
  modloader: ModLoader;
  modFiles: never[];
  libraryFiles: never[];
  fileCopies: never[];
  copyExtensions: never[];
  dependencies: CoreQmodDependency[];
}

/**
 * Interface representing the structure of the CoreQmodDependency object.
 */
interface CoreQmodDependency {
  id: string;
  version: string;
  downloadIfMissing: string;
}

/**
 * Generates the CoreQmodJSON object for the specified version.
 *
 * @param version - The version of Beat Saber.
 * @returns A promise that resolves to the CoreQmodJSON object.
 */
async function generateCoreQmodJson(version: string): Promise<CoreQmodJSON> {
  const json: CoreQmodJSON = {
    _QPVersion: "0.1.1",
    name: `Core mods for ${version}`,
    id: `CoreMods_${version}`,
    author: "QuestPackageManager",
    description: `Downloads all core mods for Beat Saber version ${version}`,
    version: "1.0.0",
    packageId: "com.beatgames.beatsaber",
    packageVersion: version,
    modloader: version > "1.28.0_4124311467" ? ModLoader.Scotland2 : ModLoader.QuestLoader,
    modFiles: [],
    libraryFiles: [],
    fileCopies: [],
    copyExtensions: [],
    dependencies: []
  };

  const cores = await getCoreMods();

  if (cores[version]) {
    const lastUpdated = cores[version].lastUpdated;
    json.version = `1.0.0-${lastUpdated.replace(/[^0-9TZ-]+/g, '-')}`

    for (const mod of cores[version].mods) {
      json.dependencies.push({
        id: mod.id,
        version: `^${mod.version}`,
        downloadIfMissing: mod.downloadLink
      })
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
export async function generateCoresQmod(version: string): Promise<{ qmod: JSZip; filename: string; }> {
  const zip = new JSZip();
  zip.file("mod.json", JSON.stringify(await generateCoreQmodJson(version)));

  return {
    qmod: zip,
    filename: `CoreMods_${version}.qmod`
  };
}
