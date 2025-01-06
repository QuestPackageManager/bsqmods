import { spawn } from "child_process";

/**
 * Class representing the output of a command execution, including stdout, stderr, and exit code.
 */
class CommandOutput {
  readonly stdout: string;
  readonly stderr: string;
  readonly output: string;
  readonly exitCode: number;

  constructor(stdout: string, stderr: string, output: string, exitCode: number) {
    this.stdout = stdout.trim();
    this.stderr = stderr.trim();
    this.output = output.trim();
    this.exitCode = exitCode;
  }

  /**
   * Converts the CommandOutput object to a string.
   * This method is called automatically when the object is treated as a string.
   * @returns {string} A string representation of the command output.
   */
  toString(): string {
    return this.output;
  }
}

/**
 * Asynchronously executes a command using spawn and returns its output (stdout, stderr, and exit code) in a CommandOutput object.
 * @param command The command to execute.
 * @param args The arguments to pass to the command.
 * @param ignoreExitCode Optional flag to allow success even if the exit code is non-zero.
 * @param cwd Optional working directory where the command should be executed. Defaults to current working directory.
 * @returns {Promise<CommandOutput>} Promise resolving to an object with stdout, stderr, and exitCode.
 */
export async function executeCommand(
  command: string,
  args: string[],
  ignoreExitCode: boolean = false,
  cwd: string | null = null
): Promise<CommandOutput> {
  return new Promise((resolve, reject) => {
    // Use the specified cwd or default to the current working directory
    const options = cwd ? { cwd } : {};

    const process = spawn(command, args, options);

    let stdout = "";
    let stderr = "";
    let combinedOutput = "";

    // Capture the standard output
    process.stdout.on("data", (data) => {
      stdout += data.toString();
      combinedOutput += data.toString();
    });

    // Capture the error output
    process.stderr.on("data", (data) => {
      stderr += data.toString();
      combinedOutput += data.toString();
    });

    // Resolve or reject based on the exit code
    process.on("close", (code: number) => {
      const output = new CommandOutput(stdout, stderr, combinedOutput, code);

      // If the exit code is non-zero and we are not ignoring it, reject the promise
      if (code !== 0 && !ignoreExitCode) {
        reject(output); // Reject with the CommandOutput object
        return;
      }

      resolve(output); // Resolve with the CommandOutput object
    });

    // Handle process errors
    process.on("error", (error: Error) => {
      const output = new CommandOutput(stdout, stderr, error.message, 1);
      reject(output); // Reject with the CommandOutput object containing the error message
    });
  });
}
