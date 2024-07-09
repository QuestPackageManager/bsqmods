import { Dictionary } from "./Dictionary";
import { Mod } from "./Mod";

/**
 * Represents a collection of mods indexed by game version.
 */
export type ModsCollection = Dictionary<Mod[]>
