export interface Mod {
  /** The name of the mod. */
  name: string;

  /** A description of what the mod does. */
  description?: string;

  /** The ID of the mod. */
  id: string;

  /** The version of the mod. */
  version: string;

  /** The author(s) of the mod. */
  author?: string;

  /** The mod loader used by the mod. */
  modloader?: string;

  /** A direct link to the .qmod file. */
  download: string;

  /** A link to the source code for the mod. */
  source?: string;

  /** A direct link to a cover image. */
  cover?: string;

  /** A link to a page where people can donate some money. */
  funding?: string;

  /** A link to a website for the mod. */
  website?: string;

  /** A SHA1 hash of the download. */
  hash?: string;
}

export interface QmodInfo extends Mod {
  /**
   * The porter(s) of the mod.
   */
  porter?: string
  /**
   * The mod loader used by the mod.
   */
  modloader?: string
  /**
   * The version of the game the mod is made for.
   */
  packageVersion?: string
}

/** The target version of the game. */
export type GameVersion = string;

export interface ModsCollection {
  /**  */
  [key: GameVersion]: Mod[];
}
