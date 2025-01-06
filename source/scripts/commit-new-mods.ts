import { getNewFilesAsync } from "./shared/getNewFiles";
import { iterateSplitMods } from "./shared/iterateMods";
import { repoDir } from "../shared/paths";
import { executeCommand } from "./shared/executeCommand";

const newMods = await getNewFilesAsync("mods", repoDir);

for (const iteration of iterateSplitMods()) {
  if (newMods.includes(iteration.shortModPath)) {
    // This is a new mod, process it.
    const mod = iteration.getModJson();

    await executeCommand("git", ["add", iteration.shortModPath], false, repoDir);
    await executeCommand("git", [
      "commit",
      "--cleanup=verbatim",
      "-m",
      [
        // Make our commit message
        `${mod.name} ${mod.version?.trim() && `v${mod.version.trim()}`}`,
        ``,
        ...(() => {
          return [
            ["ID", mod.id?.trim()],
            ["Author", mod.author?.trim()],
            ["Mod Loader", mod.modloader?.trim()],
            ["Game Version", iteration.version?.trim()]
          ]
            .filter((line) => line[1])
            .map((line) => `${line.join(": ")}  `);
        })(),
        (mod.description?.trim() &&
          `\n${"-".repeat(50)}\n\n` +
            mod.description
              .split("\n")
              .map((line) => line.trimEnd() + "  ")
              .join("\n")) ||
          ""
      ]
        .join("\n")
        .trim()
    ]);

    console.log(`Added mod: ${iteration.shortModPath}`);
  }
}
