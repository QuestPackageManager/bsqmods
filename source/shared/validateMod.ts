import { Mod } from "./types/Mod";
import { Validator } from "jsonschema";
import CombinedModSchema from "./schemas/CombinedMod.schema.json";
import ModSchemaBase from "./schemas/Mod.schema.base.json";
import ModSchema from "./schemas/Mod.schema.json";
import ModCollectionSchema from "./schemas/ModCollection.schema.json";

let validator: Validator | null;

function getValidator(): Validator {
  if (!validator) {
    validator = new Validator();
    validator;

    for (const schema of [ModSchemaBase, CombinedModSchema, ModSchema, ModCollectionSchema]) {
      validator.addSchema(schema);
    }
  }

  return validator;
}

/**
 * Validates a 'Mod' object to ensure all required fields are present and valid.
 *
 * @param mod - The 'Mod' object to validate.
 * @throws Error if any required field is missing or if the mod loader is invalid.
 * @returns true if the 'Mod' object is valid.
 */
export function validateMod(mod: Mod) {
  const validator = getValidator();
  const result = validator.validate(mod, ModSchemaBase);

  if (result.errors.length > 0) {
    throw new Error(result.errors.map((err) => err.toString()).join("\n\n"));
  }

  return true;
}
