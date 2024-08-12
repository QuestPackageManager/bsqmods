import { ModsCollection } from "./types/ModsCollection";
import { allModsPath } from "./paths"
import { readFileSync } from "fs";

export function readAllModsJson(): ModsCollection {
  return JSON.parse(readFileSync(allModsPath, "utf-8"));
}
