import { HashCollection } from "../../shared/types/HashCollection.ts";
import { hashesPath } from "./paths.ts";
import { readTextFile } from "./readTextFile.ts";

/**
 * Gets a dictionary of all hashes for given urls
 * @returns
 */
export function getQmodHashes(): HashCollection {
  return JSON.parse(readTextFile(hashesPath, "{}"));
}
