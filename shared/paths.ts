import { join } from "path";
import { cwd } from "process";

/** The base path of the git repo */
export const repoDir = join(cwd(), "..");

/** Path to the website public directory */
export const websiteBase = join(repoDir, "website", "public");

/** The path to the mods folder */
export const modsPath = join(repoDir, "mods");

/** The path to the covers folder */
export const coversPath = join(websiteBase, "covers");

/** The path to the sha1sums.json file */
export const hashesPath = join(websiteBase, "sha1sums.json");

/** The path to the qmod download cache */
export const qmodsPath = join(repoDir, "scripts", "qmods");

/** The path to the combined mods.json file */
export const allModsPath = join(websiteBase, "mods.json");

/** The path to the versions.json file */
export const versionsModsPath = join(websiteBase, "versions.json");

/** The path to the versioned mod json files */
export const qmodRepoDirPath = join(websiteBase, "mods");

/** The path to the imported.json file used to track which core mods have been imported */
export const importedCoreModsInfo = join(modsPath, "imported.json");

/** The path to the changed files text file.  Used during PR checks. */
export const changedFilesPath = join(repoDir, "changed-files.txt");

/** The path to the mod blacklist file. */
export const modBlacklistPath = join(modsPath, "updater-repo-blacklist.txt")

/** The path to the funding json file. */
export const fundingInfoPath = join(websiteBase, "funding-info.json");
