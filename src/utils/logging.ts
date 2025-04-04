import * as vscode from "vscode";

/**
 * Logging levels for the extension
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

/**
 * Logger class for the extension
 */
export class Logger {
  private static _outputChannel: vscode.OutputChannel;
  private static _logLevel: LogLevel = LogLevel.INFO;

  /**
   * Initialize the logger
   */
  public static initialize(context: vscode.ExtensionContext) {
    this._outputChannel = vscode.window.createOutputChannel("Dead Code Finder");
    context.subscriptions.push(this._outputChannel);

    // Get the log level from configuration
    const config = vscode.workspace.getConfiguration("deadCodeFinder");
    const configLevel = config.get<string>("logLevel", "info");
    this._logLevel = this.getLogLevelFromString(configLevel);
  }

  /**
   * Set the logging level
   */
  public static setLogLevel(level: LogLevel) {
    this._logLevel = level;
  }

  /**
   * Log a debug message
   */
  public static debug(message: string) {
    this.log(LogLevel.DEBUG, message);
  }

  /**
   * Log an info message
   */
  public static info(message: string) {
    this.log(LogLevel.INFO, message);
  }

  /**
   * Log a warning message
   */
  public static warn(message: string) {
    this.log(LogLevel.WARN, message);
  }

  /**
   * Log an error message
   */
  public static error(message: string, error?: Error) {
    let fullMessage = message;
    if (error) {
      fullMessage += `\n${error.message}`;
      if (error.stack) {
        fullMessage += `\n${error.stack}`;
      }
    }
    this.log(LogLevel.ERROR, fullMessage);
  }

  /**
   * Log a message at the specified level
   */
  private static log(level: LogLevel, message: string) {
    if (level < this._logLevel) {
      return;
    }

    if (!this._outputChannel) {
      // Create output channel if not initialized
      this._outputChannel =
        vscode.window.createOutputChannel("Dead Code Finder");
    }

    const timestamp = new Date().toISOString();
    const levelStr = LogLevel[level];
    const formattedMessage = `[${timestamp}] [${levelStr}] ${message}`;

    this._outputChannel.appendLine(formattedMessage);
  }

  /**
   * Convert a string log level to the enum value
   */
  private static getLogLevelFromString(level: string): LogLevel {
    switch (level.toLowerCase()) {
      case "debug":
        return LogLevel.DEBUG;
      case "info":
        return LogLevel.INFO;
      case "warn":
      case "warning":
        return LogLevel.WARN;
      case "error":
        return LogLevel.ERROR;
      default:
        return LogLevel.INFO;
    }
  }

  /**
   * Show the output channel
   */
  public static show() {
    this._outputChannel.show();
  }
}
