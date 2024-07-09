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

  /** A link to a page where people can donate some money. */
  funding: string | null;

  /** A link to a website for the mod. */
  website: string | null;

  /** A SHA1 hash of the download. */
  hash?: string | null;
}

export const modKeys: (keyof Mod)[] = [
  "name", "description", "id", "version", "author", "authorIcon", "modloader",
  "download", "source", "cover", "funding", "website", "hash"
];

export const splitModKeys: (keyof Mod)[] = [
  "name", "description", "id", "version", "author", "authorIcon", "modloader",
  "download", "source", "cover", "funding", "website"
];
