import { isNullOrWhitespace } from "./isNullOrWhitespace";
import { Mod, splitModKeys } from "./types/Mod";
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
    if (isNullOrWhitespace(mod[field] as string | null)) {
      throw new Error(`Mod ${field} not set`);
    }
  }

  // Validate the mod loader
  if (mod.modloader == null || !validModLoaders.includes(mod.modloader)) {
    throw new Error("Mod loader is invalid");
  }

  // Check for any keys not in the allowed list.
  for (const key of Object.keys(mod) as (keyof (Mod))[]) {
    if (!splitModKeys.includes(key)) {
      throw new Error(`"${key}" is not a valid key`);
    }
  }

  // Check key types
  for (const key of splitModKeys) {
    const value = mod[key];

    if (key == "funding") {
      if (!(value instanceof Array)) {
        throw new Error("Funding is not an array");
      }
      continue;
    }

    if (!(value === null || typeof (value) == "string")) {
      throw new Error(`"${key}" is not the expected type${value}`);
    }
  }

  return true;
}
