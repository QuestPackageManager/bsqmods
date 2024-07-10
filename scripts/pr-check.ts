import { readTextFile } from "./shared/readTextFile";
import { changedFilesPath, qmodsPath } from "./shared/paths";
import { iterateSplitMods } from "./shared/iterateMods";
import { validateMod } from "../shared/validateMod";
import { fetchBuffer, fetchJson } from "../shared/fetch";
import { Schema, Validator } from "jsonschema";
import JSZip from "jszip";

const qmodSchema = await fetchJson<Schema>("https://raw.githubusercontent.com/Lauriethefish/QuestPatcher.QMod/main/QuestPatcher.QMod/Resources/qmod.schema.json");
const validator = new Validator()

if (!qmodSchema.data) {
  console.error("Unable to fetch schema");
  process.exit(1);
}

const changedFiles = (await readTextFile(changedFilesPath, "")).replace(/\r/g, "").split("\n").filter(file => file.startsWith("mods/"));

for (const iteration of iterateSplitMods()) {
  iteration.getModJson()
  if (changedFiles.includes(iteration.shortModPath)) {
    const json = iteration.getModJson();
    console.log(`Checking ${iteration.shortModPath}`)
    validateMod(json);

    const qmod = await fetchBuffer(json.download as string)

    if (!qmod.data) {
      console.error("Unable to fetch qmod");
      process.exit(1);
    }

    const zip = await JSZip.loadAsync(qmod.data);
    const zipModInfo = zip.file("mod.json");

    if (zipModInfo == null) {
      console.error("No mod.json in qmod");
      process.exit(1);
    }

    const validatorResult = validator.validate(JSON.parse(await zipModInfo.async("string")), qmodSchema.data);

    if (!validatorResult.valid) {
      console.error(validatorResult.errors)
      process.exit(1);
    }
  }
}
