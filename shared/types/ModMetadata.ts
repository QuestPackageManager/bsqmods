import { Sha1Hash } from "./Aliases"

export interface ModMetadata {
  /** The hash of the mod archive */
  hash: Sha1Hash | null

  /** Image metadata */
  image: ModImageMetadata | null
}

export interface ModImageMetadata {
  /** The hash of the original cover image */
  hash: Sha1Hash | null

  /** The extension of the original cover image */
  extension: string | null
}
