import { Schema, Validator } from "jsonschema";
import ModSchema from "./schemas/Mod.schema.json";
import { fetchJson } from "./fetch";

let qmodSchema = null as Schema | null;

/**
 * Validates a 'Mod' object to ensure all required fields are present and valid.
 *
 * @param mod - The 'Mod' object to validate.
 * @throws Error if any required field is missing or if the mod loader is invalid.
 * @returns true if the 'Mod' object is valid.
 */
export async function validateQmodModJson(json: any) {
  if (!qmodSchema) {
    const result = await fetchJson<Schema>("https://raw.githubusercontent.com/Lauriethefish/QuestPatcher.QMod/main/QuestPatcher.QMod/Resources/qmod.schema.json");

    if (!result.data) {
      throw new Error("Error fetching qmod schema");
    }

    qmodSchema = result.data;
  }

  const validator = new Validator();
  const result = validator.validate(json, qmodSchema);

  if (result.errors.length > 0) {
    throw new Error(result.errors.map(err => err.toString()).join("\n\n"));
  }

  return true;
}
