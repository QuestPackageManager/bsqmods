/**
 * Enum representing the log levels.
 */
export enum LogLevel {
  Log,  // Represents a general log message.
  Debug, // Represents a debug log message.
  Warn,  // Represents a warning log message.
  Error  // Represents an error log message.
}

/**
 * Interface for the Logger.
 */
export interface Logger {
  /**
   * Logs a message.
   * @param {...any[]} data - The data to log.
   */
  log: (...data: any[]) => void;

  /**
   * Logs a debug message.
   * @param {...any[]} data - The data to log.
   */
  debug: (...data: any[]) => void;

  /**
   * Logs a warning message.
   * @param {...any[]} data - The data to log.
   */
  warn: (...data: any[]) => void;

  /**
   * Logs an error message.
   * @param {...any[]} data - The data to log.
   */
  error: (...data: any[]) => void;
}

/**
 * Extends the 'Logger' interface to include a method for retrieving loggers based on a log level.
 */
export interface ConsoleLoggerInterface extends Logger {
  /**
   * Retrieves a logger function based on the specified log level.
   *
   * @param level - The log level to retrieve the logger for.
   * @returns A logger function that accepts variadic arguments.
   */
  getLogger: (level: LogLevel) => ((...data: any[]) => void);
}

/**
 * Logger that logs to the console.
 * @type {Readonly<Logger>}
 */
export const ConsoleLogger: ConsoleLoggerInterface = {
  log: console.log,
  debug: console.debug,
  warn: console.warn,
  error: console.error,
  getLogger: function getLogger(level: LogLevel): ((...data: any[]) => void) {
    switch (level) {
      case LogLevel.Log: return console.log;
      case LogLevel.Debug: return console.debug;
      case LogLevel.Warn: return console.warn;
      case LogLevel.Error: return console.error;
    }

    return console.log;
  }
}

/**
 * Stub logger that does nothing.
 * @type {Readonly<Logger>}
 */
export const StubLogger: Readonly<Logger> = {
  log: () => undefined,
  debug: () => undefined,
  warn: () => undefined,
  error: () => undefined
}

/**
 * A captured message.
 */
export interface CapturedMessage {
  level: LogLevel,
  data: any[]
}

/**
 * Logger class that captures messages and stores them for later retrieval.
 */
export class CapturingLogger implements Logger {
  private messages: CapturedMessage[] = [];

  /**
   * Logs a message with the log level.
   * @param {...any} data - The data to log.
   */
  public log(...data: any[]): void {
    this.captureMessage(LogLevel.Log, ...data);
  }

  /**
   * Logs a debug message.
   * @param {...any} data - The data to log.
   */
  public debug(...data: any[]): void {
    this.captureMessage(LogLevel.Debug, ...data);
  }

  /**
   * Logs a warning message.
   * @param {...any} data - The data to log.
   */
  public warn(...data: any[]): void {
    this.captureMessage(LogLevel.Warn, ...data);
  }

  /**
   * Logs an error message.
   * @param {...any} data - The data to log.
   */
  public error(...data: any[]): void {
    this.captureMessage(LogLevel.Error, ...data);
  }

  /**
   * Captures a message with the specified log level and data.
   * @param {string} level - The log level.
   * @param {...any} data - The data to log.
   */
  private captureMessage(level: LogLevel, ...data: any[]): void {
    this.messages.push({ level, data });
  }

  /**
   * Retrieves all captured messages.
   * @returns {Array<{ level: string, data: any[] }>} - The captured messages.
   */
  public getMessages(): { level: LogLevel, data: any[] }[] {
    return this.messages;
  }

  /**
   * Replays the logged messages to a different logger.
   * @param logger - The logger to replay the messages to.
   */
  public replayMessages(logger: Logger) {
    for (const message of this.messages) {
      switch (message.level) {
        case LogLevel.Log:
          logger.debug(message.data);
          break;

        case LogLevel.Debug:
          logger.debug(message.data);
          break;

        case LogLevel.Warn:
          logger.warn(message.data);
          break;

        case LogLevel.Error:
          logger.error(message.data);
          break;
      }
    }
  }
}
