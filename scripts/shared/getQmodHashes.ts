import { HashCollection } from "../../shared/types/HashCollection";
import { hashesPath } from "../../shared/paths";
import { readTextFile } from "./readTextFile";

/**
 * Gets a dictionary of all hashes for given urls
 * @returns
 */
export function getQmodHashes(): HashCollection {
  return JSON.parse(readTextFile(hashesPath, "{}"));
}
