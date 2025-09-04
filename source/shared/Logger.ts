import { ANSI } from "./ansi";

/**
 * Enum representing the log levels.
 */
export enum LogLevel {
  Log, // Represents a general log message.
  Debug, // Represents a debug log message.
  Warn, // Represents a warning log message.
  Error // Represents an error log message.
}

export const LogLevelColors: Record<LogLevel, string> = {
  [LogLevel.Log]: ANSI.GetColors(ANSI.Colors.Background.white, ANSI.Colors.Foreground.black).toString(),
  [LogLevel.Debug]: ANSI.GetColors(ANSI.Colors.Background.cyan, ANSI.Colors.Foreground.black).toString(),
  [LogLevel.Warn]: ANSI.GetColors(ANSI.Colors.Background.yellow, ANSI.Colors.Foreground.black).toString(),
  [LogLevel.Error]: ANSI.GetColors(ANSI.Colors.Background.red, ANSI.Colors.Foreground.white).toString()
};

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
  getLogger: (level: LogLevel) => (...data: any[]) => void;
  enableColors: () => void;
  disableColors: () => void;
}

export class ConsoleLogger implements ConsoleLoggerInterface {
  private colorsEnabled = false;
  /**
   * Logs a message with a white background and black foreground.
   * @param {...any[]} data - The data to log.
   */
  private static bgLog(...data: any[]): void {
    console.log(LogLevelColors[LogLevel.Log], ...data, ANSI.resetColors);
  }

  /**
   * Logs a debug message with a cyan background and black foreground.
   * @param {...any[]} data - The data to log.
   */
  private static bgDebug(...data: any[]): void {
    console.debug(LogLevelColors[LogLevel.Debug], ...data, ANSI.resetColors);
  }

  /**
   * Logs a warning message with a yellow background and black foreground.
   * @param {...any[]} data - The data to log.
   */
  private static bgWarn(...data: any[]): void {
    console.warn(LogLevelColors[LogLevel.Warn], ...data, ANSI.resetColors);
  }

  /**
   * Logs an error message with a red background and white foreground.
   * @param {...any[]} data - The data to log.
   */
  private static bgError(...data: any[]): void {
    console.error(LogLevelColors[LogLevel.Error], ...data, ANSI.resetColors);
  }

  public log: (...data: any[]) => void;
  public debug: (...data: any[]) => void;
  public warn: (...data: any[]) => void;
  public error: (...data: any[]) => void;

  constructor() {
    this.log = console.log;
    this.debug = console.debug;
    this.warn = console.warn;
    this.error = console.error;
  }

  enableColors() {
    this.colorsEnabled = true;
    this.log = ConsoleLogger.bgLog;
    this.debug = ConsoleLogger.bgDebug;
    this.warn = ConsoleLogger.bgWarn;
    this.error = ConsoleLogger.bgError;
  }

  disableColors() {
    this.colorsEnabled = false;
    this.log = console.log;
    this.debug = console.debug;
    this.warn = console.warn;
    this.error = console.error;
  }

  getLogger(level: LogLevel): (...data: any[]) => void {
    return ConsoleLogger.getLogger(level, this.colorsEnabled);
  }

  static getLogger(level: LogLevel, enableColors = false): (...data: any[]) => void {
    switch (level) {
      case LogLevel.Log:
        return enableColors ? ConsoleLogger.bgLog : console.log;

      case LogLevel.Debug:
        return enableColors ? ConsoleLogger.bgDebug : console.debug;

      case LogLevel.Warn:
        return enableColors ? ConsoleLogger.bgWarn : console.warn;

      case LogLevel.Error:
        return enableColors ? ConsoleLogger.bgError : console.error;
    }

    return enableColors ? ConsoleLogger.bgLog : console.log;
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
};

/**
 * A captured message.
 */
export interface CapturedMessage {
  level: LogLevel;
  data: any[];
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
  public getMessages(): CapturedMessage[] {
    return this.messages;
  }

  /**
   * Retrieves log messages filtered by log level 'LogLevel.Log'.
   *
   * @returns An array of log messages.
   */
  public getLogMessages(): CapturedMessage[] {
    return this.messages.filter((msg) => msg.level == LogLevel.Log);
  }

  /**
   * Retrieves log messages filtered by log level 'LogLevel.Debug'.
   *
   * @returns An array of debug messages.
   */
  public getDebugMessages(): CapturedMessage[] {
    return this.messages.filter((msg) => msg.level == LogLevel.Debug);
  }

  /**
   * Retrieves log messages filtered by log level 'LogLevel.Warn'.
   *
   * @returns An array of warn messages.
   */
  public getWarnMessages(): CapturedMessage[] {
    return this.messages.filter((msg) => msg.level == LogLevel.Warn);
  }

  /**
   * Retrieves log messages filtered by log level 'LogLevel.Error'.
   *
   * @returns An array of error messages.
   */
  public getErrorMessages(): CapturedMessage[] {
    return this.messages.filter((msg) => msg.level == LogLevel.Error);
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
