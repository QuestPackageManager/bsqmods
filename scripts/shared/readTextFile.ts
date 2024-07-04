import fs from "node:fs";

/**
 * Reads the content of a text file if it exists, otherwise returns a default value.
 *
 * @param path - The path to the text file.
 * @param defaultValue - The default value to return if the file does not exist.
 * @returns - The content of the text file or the default value.
 */
export function readTextFile(path: string, defaultValue: string): string {
  if (fs.existsSync(path)) {
    return fs.readFileSync(path, "utf8");
  }

  return defaultValue;
}
