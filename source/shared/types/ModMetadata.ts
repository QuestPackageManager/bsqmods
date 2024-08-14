import { Sha1Hash } from "./Aliases";

export interface ModMetadata {
  /** The hash of the mod archive */
  hash: Sha1Hash | null;

  /** Image metadata */
  image: ModImageMetadata | null;

  /**
   * If the mod should use the mirror.
   *
   * For situations where the original link is no longer available.
   */
  useMirror: boolean;
}

export interface ModImageMetadata {
  /** The hash of the original cover image */
  hash: Sha1Hash | null;

  /** The extension of the original cover image */
  extension: string | null;
}
