/**
 * Logs an error message to the console and exits the process with the specified exit code.
 *
 * @param message - The error message to log.
 * @param code - The exit code (default is 1).
 */
export function exitWithError(message: string, code: number = 1): void {
  console.error(message);
  process.exit(code);
}
