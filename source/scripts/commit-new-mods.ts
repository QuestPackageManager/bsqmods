import { getNewFilesAsync } from "./shared/getNewFiles";
import { iterateSplitMods } from "./shared/iterateMods";
import { repoDir } from "../shared/paths";
import { executeCommand } from "./shared/executeCommand";
import { getGithubUserId } from "../shared/getGithubUser";
import { ghRegex } from "../shared/ghRegex";

const newMods = await getNewFilesAsync("mods", repoDir);
const gitName = await executeCommand("git", ["config", "user.name"], false, repoDir);
const gitEmail = await executeCommand("git", ["config", "user.email"], false, repoDir);

for (const iteration of iterateSplitMods()) {
  if (newMods.includes(iteration.shortModPath)) {
    // This is a new mod, process it.
    const mod = iteration.getModJson();

    let userId = 0;

    const ghMatch = ghRegex.exec(mod.download || "");

    if (ghMatch) {
      // If the download URL is a GitHub link, try to get the user ID from it.
      try {
        userId = (await getGithubUserId(ghMatch[1])) || 0;
      } catch (err) {
        console.error(`Failed to get GitHub icon for mod ${mod.name}:`, err);
      }

      if (userId) {
        // We have a user ID, configure git to use it.
        await executeCommand("git", ["config", "user.name", ghMatch[1]], false, repoDir);
        await executeCommand("git", ["config", "user.email", `${userId}+${ghMatch[1]}@users.noreply.github.com`], false, repoDir);
      }
    } else {
      // No user ID, configure as user from git config.
      await executeCommand("git", ["config", "user.name", gitName.stdout], false, repoDir);
      await executeCommand("git", ["config", "user.email", `${gitEmail.stdout}`], false, repoDir);
    }

    await executeCommand("git", ["add", iteration.shortModPath], false, repoDir);
    await executeCommand("git", [
      "commit",
      "--no-gpg-sign",
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

await executeCommand("git", ["config", "user.name", gitName.stdout], false, repoDir);
await executeCommand("git", ["config", "user.email", `${gitEmail.stdout}`], false, repoDir);
