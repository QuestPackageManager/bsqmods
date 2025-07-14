import { readFileSync } from "fs";
import { isNullOrWhitespace } from "./isNullOrWhitespace";
import { modLibrariesPath } from "./paths";

let libraryList: string[];
let libraryListLowercase: string[];

export function getLibraryList(): string[] {
  if (libraryList) {
    return libraryList;
  }

  libraryList = readFileSync(modLibrariesPath, "utf8")
    .replace(/\r/g, "")
    .split("\n")
    .filter((line) => !isNullOrWhitespace(line) && !line.trim().startsWith("#"));
  libraryListLowercase = libraryList.map((line) => line.toLowerCase());

  return libraryList;
}

export function isLibrary(modId: string): boolean {
  if (!libraryListLowercase) {
    getLibraryList();
  }

  return libraryListLowercase.includes(modId.toLowerCase());
}
