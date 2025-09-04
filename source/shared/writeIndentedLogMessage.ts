import { ANSI } from "./ansi";
import { CapturedMessage, ConsoleLogger, LogLevel, LogLevelColors } from "./Logger";

/**
 * Writes an indented log message to the console.
 *
 * @param message - The captured message object to log.
 */
export function writeIndentedLogMessage(message: CapturedMessage, indendation = "  ") {
  ConsoleLogger.getLogger(
    message.level,
    false
  )(`${indendation}${LogLevelColors[message.level]}${LogLevel[message.level]}: ${message.data}${ANSI.resetColors}`);
}
