import { cachedFetchJson } from "./cachedFetch";
import { Dictionary } from "./types/Dictionary";

let fetchedUrl: string | null = null

/**
 * Represents a collection of 'CoreMods' indexed by game version.
 */
export type CoreModCollection = Dictionary<CoreMods>

/**
 * Represents a collection of core mods.
 */
export interface CoreMods {
  /**
   * The last updated timestamp of the core mods collection.
   */
  lastUpdated: string;

  /**
   * An array of core mod objects.
   */
  mods: CoreMod[];
}

/**
 * Represents a core mod object.
 */
export interface CoreMod {
  /**
   * The ID of the core mod.
   */
  id: string;

  /**
   * The version of the core mod.
   */
  version: string;

  /**
   * The download link for the core mod.
   */
  downloadLink: string;

  /**
   * Optional: The filename of the core mod.
   */
  filename?: string;
}

/**
 * Retrieves a collection of core mods from a remote JSON endpoint.
 *
 * @returns A promise that resolves to a 'CoreModCollection' object.
 */
export async function getCoreMods(): Promise<CoreModCollection> {
  const res = await cachedFetchJson<CoreModCollection>(
    (fetchedUrl = fetchedUrl || `https://raw.githubusercontent.com/QuestPackageManager/bs-coremods/main/core_mods.json?${new Date().getTime()}`),
  );

  if (res.data) {
    return res.data;
  }

  return {}
}
