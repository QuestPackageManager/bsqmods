import { Dictionary } from "./Dictionary";
import { GroupedMod } from "./GroupedMod";

/**
 * Represents a collection of mods indexed by mod id, then mod version.
 *
 * @example
 * ```json
 * {
 *   "lapiz": {
 *     "0.2.13": {
 *       "name": "Lapiz",
 *       "description": "Lapiz makes modders' lives easier by exposing utilities to them cleanly. This mod does nothing on its own.",
 *       "id": "lapiz",
 *       "version": "0.2.13",
 *       "author": "Raine",
 *       "authorIcon": "https://avatars.githubusercontent.com/u/64136899?v=4",
 *       "modloader": "Scotland2",
 *       "download": "https://github.com/raineio/Lapiz/releases/download/v0.2.13/Lapiz.qmod",
 *       "source": "https://github.com/raineio/Lapiz/",
 *       "cover": null,
 *       "funding": [],
 *       "website": "https://github.com/raineio/Lapiz/",
 *       "hash": "2798b33142721386cce71f49ab02f8e328e57cf9"
 *     }
 *   }
 * }
 * ```
 */
export interface GroupedMods extends Dictionary<GroupedMod> {}
