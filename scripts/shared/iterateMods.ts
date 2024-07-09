import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "fs";
import { basename, dirname, join } from "path";
import { allModsPath, modsPath, repoDir } from "./paths";
import { readTextFile } from "./readTextFile";
import { Mod, splitModKeys } from "../../shared/types/Mod";
import { validateMod } from "../../shared/validateMod";
import { getStandardizedMod } from "../../shared/getStandardizedMod";
import { ModsCollection } from "../../shared/types/ModsCollection";
import { getFilename } from "./getFilename";

/**
 * Class representing mod iteration data.
 */
export class ModIterationData {
  /** The game version. */
  readonly version: string;

  /** The path */
  readonly modPath: string;

  /** The mod path relative to the repository root. */
  readonly shortModPath: string;

  /** The mod data. */
  private modData: Mod | null;

  /**
   * Constructs an instance of ModData.
   * @param {string} version - The version of the mod.
   * @param {string} versionPath - The path to the version directory.
   * @param {string} modFilename - The filename of the mod.
   * @param {string} modPath - The path to the mod file.
   */
  constructor(version: string, modPath: string, modData: Mod | null = null) {
    this.version = version;
    this.modPath = modPath;
    this.shortModPath = modPath.substring(repoDir.length + 1);
    this.modData = modData;
  }

  /**
   * Reads and parses the mod JSON file.
   * @returns {any} The parsed JSON content of the mod file.
   */
  public getModJson(): Mod {
    if (this.modData) {
      return this.modData;
    }

    const fileContent = readFileSync(this.modPath, 'utf8');
    return JSON.parse(fileContent);
  }

  /**
   * Writes the standardized mod json data.
   * @param mod The mod data to write.
   */
  public writeModJson(mod: Mod): void {
    validateMod(mod);
    mkdirSync(dirname(this.modPath), { recursive: true });
    writeFileSync(this.modPath, JSON.stringify(getStandardizedMod(mod, splitModKeys), null, "  "), {});

    if (this.modData) {
      this.modData = null;
    }
  }
}

export function* iterateSplitMods(): Generator<ModIterationData, void, unknown> {
  const gameVersions = readdirSync(modsPath)
    .filter(versionPath => statSync(join(modsPath, versionPath)).isDirectory());

  for (const version of gameVersions) {
    const versionPath = join(modsPath, version);
    const modFilenames = readdirSync(versionPath)
      .filter(modPath => modPath.toLowerCase().endsWith(".json") && statSync(join(versionPath, modPath)).isFile());

    for (const modFilename of modFilenames) {
      const modPath = join(versionPath, modFilename);

      yield new ModIterationData(version, modPath);
    }
  }
}

export function* iterateCombinedMods(): Generator<ModIterationData, void, unknown> {
  const allMods: ModsCollection = JSON.parse(readTextFile(allModsPath, "{}"));

  // Loop through the keys of allMods as gameVersion
  for (const version in allMods) {
    const versionPath = join(modsPath, version);

    // Loop through all the mods for that game version.
    for (const mod of allMods[version]) {
      const modPath = getFilename(mod.id, mod.version, version, modsPath);
      const modFilename = basename(modPath);

      yield new ModIterationData(version, modPath, mod)
    }
  }
}
