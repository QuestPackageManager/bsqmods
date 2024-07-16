export interface ModMetadata {
  /** The hash of the mod archive */
  hash: string | null

  /** Image metadata */
  image: ModImageMetadata | null
}

export interface ModImageMetadata {
  /** The hash of the original cover image */
  hash: string | null

  /** The extension of the original cover image */
  extension: string | null
}
