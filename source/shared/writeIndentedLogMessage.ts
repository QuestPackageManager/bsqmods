import { CapturedMessage, ConsoleLogger, LogLevel } from "./Logger";

/**
 * Writes an indented log message to the console.
 *
 * @param message - The captured message object to log.
 */
export function writeIndentedLogMessage(message: CapturedMessage, indendation = "  ") {
  ConsoleLogger.getLogger(message.level)(`${indendation}${LogLevel[message.level]}: ${message.data}`);
}
