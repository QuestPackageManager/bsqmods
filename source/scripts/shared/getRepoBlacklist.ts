import { isNullOrWhitespace } from "../../shared/isNullOrWhitespace";
import { modBlacklistPath } from "../../shared/paths";
import { readTextFile } from "./readTextFile";

let repoBlacklist: string[];

export async function getRepoBlacklist(): Promise<string[]> {
  if (repoBlacklist) {
    return repoBlacklist;
  }

  repoBlacklist = (await readTextFile(modBlacklistPath, ""))
    .replace(/\r/g, "")
    .split("\n")
    .filter((line) => !isNullOrWhitespace(line) && !line.trim().startsWith("#"))
    .map((line) => line.trim().toLowerCase());

  return repoBlacklist;
}
