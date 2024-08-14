import path from "path";
import { originalCoversPath } from "../../shared/paths";
import { ModImageMetadata } from "../../shared/types/ModMetadata";

/**
 * Returns the file path to the optimized cover image.
 * @param hash The hash of the image file
 * @returns
 */
export function getOriginalCoverFilePath(info: ModImageMetadata | null): string | null {
  if (info == null) {
    return null;
  }

  if (!info.hash || !info.extension) {
    return null;
  }

  return path.join(originalCoversPath, `${info.hash}.${info.extension}`);
}
