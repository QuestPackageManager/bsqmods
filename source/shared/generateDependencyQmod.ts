import JSZip from "jszip";
import { ModLoader } from "./types/ModLoader";
import { isNullOrWhitespace } from "./isNullOrWhitespace";

/**
 * Interface representing the structure of the CoreQmodJSON object.
 */
export interface DependencyQmodJSON extends DependencyQmodInfo {
  /**
   * The mod.json version
   */
  _QPVersion: string;

  /**
   * The mod files.  Not used here.
   */
  modFiles: never[];

  /**
   * The library files.  Not used here.
   */
  libraryFiles: never[];

  /**
   * The file copies.  Not used here.
   */
  fileCopies: never[];

  /**
   * The extension copies.  Not used here.
   */
  copyExtensions: never[];
}

/**
 * Interface representing the structure of the DependencyQmodInfo object.
 */
export interface DependencyQmodInfo {
  /**
   * The name of the qmod.
   */
  name: string;
  /**
   * The ID of the qmod.
   */
  id: string;
  /**
   * The author of the qmod.
   */
  author: string;
  /**
   * The description of the qmod.
   */
  description: string;
  /**
   * The version of the qmod.
   */
  version: string;
  /**
   * The package ID of the game.
   */
  packageId: string;
  /**
   * The package version of the game.
   */
  packageVersion: string;
  /**
   * The mod loader used for the game.
   */
  modloader: ModLoader;
  /**
   * An array of dependencies.
   */
  dependencies: QmodDependency[];
}

/**
 * Represents the arguments for {@link generateDependencyQmod}.
 *
 *
 */
export interface DependencyQmodArguments extends Partial<DependencyQmodInfo> {
  /**
   * The resulting qmod filename.
   */
  filename?: string;
}

/**
 * Interface representing the structure of the CoreQmodDependency object.
 */
export interface QmodDependency {
  id: string;
  version: string;
  downloadIfMissing: string;
}

/**
 * Generates a depdendency qmod from a set of information.
 */
export async function generateDependencyQmod(info: Partial<DependencyQmodArguments>) {
  const json: DependencyQmodJSON = {
    _QPVersion: "0.1.1",
    name: info.name || `Mod Bundle`,
    id: info.id || `ModBundle`,
    author: info.author || "QuestPackageManager",
    description: isNullOrWhitespace(info.description)
      ? `Downloads the following mods: ${(info.dependencies || []).map((mod) => `${mod.id}@${mod.version}`).join(", ")}`
      : info.description!,
    version: info.version || "1.0.0",
    packageId: info.packageId || "com.beatgames.beatsaber",
    packageVersion: info.packageVersion || "1.0.0",
    modloader: info.modloader || ModLoader.Scotland2,
    modFiles: [],
    libraryFiles: [],
    fileCopies: [],
    copyExtensions: [],
    dependencies: info.dependencies || []
  };

  const zip = new JSZip();
  zip.file("mod.json", JSON.stringify(json));

  return {
    qmod: zip,
    filename: info.filename || "mods.qmod"
  };
}
