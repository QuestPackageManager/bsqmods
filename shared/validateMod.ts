import { isNullOrWhitespace } from "./isNullOrWhitespace";
import { Mod } from "./types/Mod";
import { validModLoaders } from "./validModLoaders";

/**
 * Validates a 'Mod' object to ensure all required fields are present and valid.
 *
 * @param mod - The 'Mod' object to validate.
 * @throws Error if any required field is missing or if the mod loader is invalid.
 * @returns true if the 'Mod' object is valid.
 */
export function validateMod(mod: Mod) {
  // Check for required fields in the mod object
  for (const field of ["name", "id", "version", "download"] as (keyof Mod)[]) {
    if (isNullOrWhitespace(mod[field])) {
      throw new Error(`Mod ${field} not set`);
    }
  }

  // Validate the mod loader
  if (mod.modloader == null || !validModLoaders.includes(mod.modloader)) {
    throw new Error("Mod loader is invalid");
  }

  return true;
}
