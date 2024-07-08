import path from "path";

/** The base path of the git repo */
export const repoDir = path.join(import.meta.dirname, "..", "..");

/** Path to the website public directory */
export const websiteBase = path.join(repoDir, "website", "public");

/** The path to the mods folder */
export const modsPath = path.join(repoDir, "mods");

/** The path to the covers folder */
export const coversPath = path.join(websiteBase, "covers");

/** The path to the sha1sums.json file */
export const hashesPath = path.join(websiteBase, "sha1sums.json");

/** The path to the qmod download cache */
export const qmodsPath = path.join(import.meta.dirname, "..", "qmods");

/** The path to the combined mods.json file */
export const allModsPath = path.join(websiteBase, "mods.json");

/** The path to the versions.json file */
export const versionsModsPath = path.join(websiteBase, "versions.json");

/** The path to the versioned mod json files */
export const qmodRepoDirPath = path.join(websiteBase, "mods");

/** The path to the imported.json file used to track which core mods have been imported */
export const importedCoreModsInfo = path.join(modsPath, "imported.json")
