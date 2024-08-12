import { modMetadataPath } from "../../shared/paths";
import { readTextFile } from "./readTextFile";
import { ModMetadata } from "../../shared/types/ModMetadata";
import { Dictionary } from "../../shared/types/Dictionary";

/**
 * Gets a dictionary of all hashes for given urls
 * @returns
 */
export function getQmodHashes(): Dictionary<ModMetadata> {
  return JSON.parse(readTextFile(modMetadataPath, "{}"));
}
