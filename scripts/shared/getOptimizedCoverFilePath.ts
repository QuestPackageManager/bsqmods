import path from "path";
import { coversPath } from "../../shared/paths";
import { ModImageMetadata, ModMetadata } from "../../shared/types/ModMetadata";

/**
* Returns the file path to the optimized cover image.
* @param info The hash of the image file
* @returns
*/
export function getOptimizedCoverFilePath(info: string | ModImageMetadata | null): string | null {
  if (info == null) {
    return null;
  }

  if (typeof (info) != "string") {
    if (!info.hash) {
      return null;
    }

    return path.join(coversPath, `${info.hash}.png`)
  }

  return path.join(coversPath, `${info}.png`);
}
