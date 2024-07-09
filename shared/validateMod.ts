import { isNullOrWhitespace } from "./isNullOrWhitespace";
import { Mod } from "./types/Mod";
import { validModLoaders } from "./validModLoaders";

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
