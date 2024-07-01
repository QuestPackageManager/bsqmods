import path from "path";

/** The base path of the git repo */
export const repoDir = path.join(__dirname, "..", "..");

/** The path to the mods folder */
export const modsPath = path.join(repoDir, "mods");

/** The path to the covers folder */
export const coversPath = path.join(repoDir, "website", "public", "covers");

/** The path to the sha1sums.json file */
export const hashesPath = path.join(repoDir, "website", "public", "sha1sums.json");

/** The path to the qmod download cache */
export const qmodsPath = path.join(__dirname, "..", "qmods");

/** The path to the combined mods.json file */
export const allModsPath = path.join(repoDir, "website", "public", "mods.json");

/** The path to the imported.json file used to track which core mods have been imported */
export const importedCoreModsInfo = path.join(modsPath, "imported.json")
