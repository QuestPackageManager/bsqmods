import path from "path";
import { sanitizeFilename } from "../../shared/sanitizeFilename";
import { modsPath } from "./paths";

/**
 * Constructs a sanitized filename based on given parameters.
 *
 * @param id - The ID for the filename.
 * @param version - The version for the filename.
 * @param gameVersion - The game version for the filename.
 * @param basePath - The base path where the file will be located.
 * @param extension - The file extension.
 * @returns - The constructed filename.
 */
export function getFilename(
  id: string = "",
  version: string = "",
  gameVersion: string = "",
  basePath: string = modsPath,
  extension: string = "json"
): string {
  return path.join(
    basePath,
    sanitizeFilename(gameVersion.trim()),
    sanitizeFilename(`${id.trim()}-${version.trim()}.${extension}`)
  );
}
