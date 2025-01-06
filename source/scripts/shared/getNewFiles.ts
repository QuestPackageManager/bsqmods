import { spawn } from "child_process";
import { executeCommand } from "./executeCommand";

/**
 * Asynchronously gets the list of new (untracked) files in a specified directory or the entire repository.
 * @param path Optional directory path to limit the search.
 * @param repoDir The path of the repository base.
 * @returns {Promise<string[]>} Promise resolving to the list of untracked file paths.
 */
export async function getNewFilesAsync(path?: string | null, repoDir?: string | null): Promise<string[]> {
  // Build the argument list, adding the path only if it's valid
  const args = ["ls-files", "--others", "--exclude-standard"];
  if (path?.trim()) {
    args.push(path);
  }

  let output = await executeCommand("git", args, false, repoDir);

  return output.stdout
    .trim()
    .split("\n")
    .filter((file) => file);
}
