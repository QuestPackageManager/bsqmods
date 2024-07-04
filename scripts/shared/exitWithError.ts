/**
 * Logs an error message to the console and exits the process with the specified exit code.
 *
 * @param message - The error message to log.
 * @param code - The exit code (default is 1).
 */
export function exitWithError(message: string, code: number = 1): void {
  console.error(message);
  exitProgram(code);
}

function exitProgram(code = 0) {
  if (typeof Deno !== "undefined") {
    Deno.exit(code);
  } else if (typeof process !== "undefined") {
    process.exit(code);
  } else {
    throw new Error("Unable to determine the runtime environment.");
  }
}
