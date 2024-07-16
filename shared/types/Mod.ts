/**
 * Represents a mod.
 *
 * @example
 * ```json
 * {
 *   "name": "Lapiz",
 *   "description": "Lapiz makes modders' lives easier by exposing utilities to them cleanly. This mod does nothing on its own.",
 *   "id": "lapiz",
 *   "version": "0.2.13",
 *   "author": "Raine",
 *   "authorIcon": "https://avatars.githubusercontent.com/u/64136899?v=4",
 *   "modloader": "Scotland2",
 *   "download": "https://github.com/raineio/Lapiz/releases/download/v0.2.13/Lapiz.qmod",
 *   "source": "https://github.com/raineio/Lapiz/",
 *   "cover": null,
 *   "funding": [],
 *   "website": "https://github.com/raineio/Lapiz/",
 *   "hash": "2798b33142721386cce71f49ab02f8e328e57cf9"
 * }
 * ```
 */
export interface Mod {
  /** The name of the mod. */
  name: string | null;

  /** A description of what the mod does. */
  description?: string | null;

  /** The ID of the mod. */
  id: string | null;

  /** The version of the mod. */
  version: string | null;

  /** The author(s) of the mod. */
  author: string | null;

  /** The icon url of the primary author. */
  authorIcon: string | null;

  /** The mod loader used by the mod. */
  modloader: string | null;

  /** A direct link to the .qmod file. */
  download: string | null;

  /** A link to the source code for the mod. */
  source: string | null;

  /** A direct link to a cover image. */
  cover: string | null;

  /** A list of links to pages where people can donate some money. */
  funding: string[];

  /** A link to a website for the mod. */
  website: string | null;

  /** A SHA1 hash of the download. */
  hash?: string | null;
}

/** A list of mod keys for the split json files. */
export const splitModKeys: (keyof Mod)[] = [
  "name", "description", "id", "version", "author", "authorIcon", "modloader",
  "download", "source", "cover", "funding", "website"
];

/** A list of mod keys for the combined json file. */
export const modKeys: (keyof Mod)[] = [...splitModKeys, "hash"];
