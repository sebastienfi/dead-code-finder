import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { DeadCodeItem, AnalysisResult } from "../analyzer";
import {
  executeCommand,
  executePythonCommand,
  ProcessResult,
} from "../../utils/process";
import { Logger } from "../../utils/logging";

/**
 * Pattern to match Vulture output lines
 * Example: path/to/file.py:42: unused function 'my_function' (60% confidence)
 */
const VULTURE_OUTPUT_PATTERN =
  /^(.+):(\d+): unused (.+) '(.+)' \((\d+)% confidence\)$/;

/**
 * Check if Vulture is installed
 */
export async function isVultureInstalled(): Promise<boolean> {
  try {
    // 1. Check via pip (current method)
    const pipResult = await executePythonCommand([
      "-m",
      "pip",
      "show",
      "vulture",
    ]);
    if (pipResult.code === 0) {
      Logger.debug("Vulture found via pip");
      return true;
    }

    // 2. Check if vulture is directly available in PATH
    try {
      const directResult = await executeCommand("vulture", ["--version"]);
      if (directResult.code === 0) {
        Logger.debug("Vulture found directly in PATH");
        return true;
      }
    } catch (error) {
      // Silently continue to other methods
    }

    // 3. Check for availability via uvx
    try {
      const uvxResult = await executeCommand("uvx", ["vulture", "--version"]);
      if (uvxResult.code === 0) {
        Logger.debug("Vulture found via uvx");
        return true;
      }
    } catch (error) {
      // Silently continue to other methods
    }

    // 4. Check for custom binary path
    const config = vscode.workspace.getConfiguration("deadCodeFinder");
    const customBinaryPath = config.get<string>("vulturePath");
    if (customBinaryPath && fs.existsSync(customBinaryPath)) {
      Logger.debug(`Found custom Vulture binary at: ${customBinaryPath}`);
      return true;
    }

    Logger.debug("Vulture not found by any method");
    return false;
  } catch (error) {
    Logger.error("Error checking for Vulture", error as Error);
    return false;
  }
}

/**
 * Install Vulture via pip
 */
export async function installVulture(): Promise<boolean> {
  try {
    Logger.info("Installing Vulture...");

    // Show progress notification to the user
    return await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: "Installing Vulture...",
        cancellable: false,
      },
      async (progress) => {
        progress.report({ increment: 0, message: "Starting installation..." });

        // Try with pip first
        let result = await executePythonCommand([
          "-m",
          "pip",
          "install",
          "vulture",
          "--user", // Add --user flag to avoid permission issues
        ]);

        // If pip fails, try with pip3
        if (result.code !== 0) {
          progress.report({
            increment: 30,
            message: "Trying alternate installation method...",
          });

          // Try with pip3 if pip fails
          result = await executePythonCommand([
            "-m",
            "pip3",
            "install",
            "vulture",
            "--user",
          ]);
        }

        progress.report({
          increment: 70,
          message: "Verifying installation...",
        });

        // Verify installation was successful
        const verifyResult = await isVultureInstalled();

        if (result.code === 0 && verifyResult) {
          progress.report({ increment: 100, message: "Installation complete" });
          Logger.info("Vulture installed successfully");
          vscode.window.showInformationMessage(
            "Vulture installed successfully"
          );
          return true;
        } else {
          Logger.error(`Failed to install Vulture: ${result.stderr}`);
          // Show detailed error message with installation instructions
          vscode.window
            .showErrorMessage(
              "Failed to install Vulture automatically. Please try installing manually with 'pip install vulture' in your terminal.",
              "Open Terminal"
            )
            .then((selection) => {
              if (selection === "Open Terminal") {
                const terminal = vscode.window.createTerminal(
                  "Vulture Installation"
                );
                terminal.show();
                terminal.sendText("pip install vulture --user");
              }
            });
          return false;
        }
      }
    );
  } catch (error) {
    Logger.error("Error installing Vulture", error as Error);
    vscode.window.showErrorMessage(
      `Error installing Vulture: ${
        (error as Error).message
      }. Please try installing manually with 'pip install vulture'.`
    );
    return false;
  }
}

/**
 * Determine the best way to run Vulture
 */
async function determineVultureMethod(): Promise<{
  method: "pip" | "uvx" | "direct" | "custom";
  path?: string;
}> {
  const config = vscode.workspace.getConfiguration("deadCodeFinder");
  const customBinaryPath = config.get<string>("vulturePath");

  // 1. Check custom path first, if configured
  if (customBinaryPath && fs.existsSync(customBinaryPath)) {
    return { method: "custom", path: customBinaryPath };
  }

  // 2. Check pip
  try {
    const pipResult = await executePythonCommand([
      "-m",
      "pip",
      "show",
      "vulture",
    ]);
    if (pipResult.code === 0) {
      return { method: "pip" };
    }
  } catch (error) {
    // Silently continue to other methods
  }

  // 3. Check direct PATH access
  try {
    const directResult = await executeCommand("vulture", ["--version"]);
    if (directResult.code === 0) {
      return { method: "direct" };
    }
  } catch (error) {
    // Silently continue to other methods
  }

  // 4. Check uvx
  try {
    const uvxResult = await executeCommand("uvx", ["vulture", "--version"]);
    if (uvxResult.code === 0) {
      return { method: "uvx" };
    }
  } catch (error) {
    // Silently continue
  }

  // Default to pip method (which will fail if not available)
  return { method: "pip" };
}

/**
 * Run Vulture analysis on the given paths
 */
export async function runVultureAnalysis(
  paths: string[],
  minConfidence: number = 60
): Promise<AnalysisResult> {
  const result: AnalysisResult = {
    deadCodeItems: [],
    errors: [],
    warnings: [],
    success: false,
  };

  try {
    // Get configuration
    const config = vscode.workspace.getConfiguration("deadCodeFinder");
    const whitelistFile = config.get<string>("whitelistFile");

    // Determine how to run vulture
    const vultureMethod = await determineVultureMethod();
    Logger.info(`Running Vulture using method: ${vultureMethod.method}`);

    let processResult: ProcessResult;

    // Prepare args common to all methods
    const commonArgs = ["--min-confidence", minConfidence.toString()];

    // Add whitelist file if specified and exists
    if (whitelistFile && fs.existsSync(whitelistFile)) {
      commonArgs.push(whitelistFile);
    }

    // Add the paths to analyze
    const fullArgs = [...commonArgs, ...paths];

    // Run with the appropriate method
    switch (vultureMethod.method) {
      case "custom":
        Logger.debug(
          `Running custom Vulture binary: ${vultureMethod.path} ${fullArgs.join(
            " "
          )}`
        );
        processResult = await executeCommand(vultureMethod.path!, fullArgs);
        break;

      case "direct":
        Logger.debug(`Running Vulture directly: vulture ${fullArgs.join(" ")}`);
        processResult = await executeCommand("vulture", fullArgs);
        break;

      case "uvx":
        Logger.debug(
          `Running Vulture via uvx: uvx vulture ${fullArgs.join(" ")}`
        );
        processResult = await executeCommand("uvx", ["vulture", ...fullArgs]);
        break;

      case "pip":
      default:
        Logger.debug(
          `Running Vulture as Python module: python -m vulture ${fullArgs.join(
            " "
          )}`
        );
        processResult = await executePythonCommand([
          "-m",
          "vulture",
          ...fullArgs,
        ]);
        break;
    }

    // Check for errors
    if (processResult.code !== 0 && processResult.code !== 3) {
      // Code 3 means dead code was found, which is what we want
      result.errors.push(`Vulture exited with code ${processResult.code}`);
      if (processResult.stderr) {
        result.errors.push(processResult.stderr);
      }
      return result;
    }

    // Parse output
    result.deadCodeItems = parseVultureOutput(processResult);
    result.success = true;

    Logger.info(`Vulture found ${result.deadCodeItems.length} dead code items`);
    return result;
  } catch (error) {
    const err = error as Error;
    result.errors.push(err.message);
    Logger.error("Error running Vulture analysis", err);
    return result;
  }
}

/**
 * Parse the output from Vulture into DeadCodeItem objects
 */
export function parseVultureOutput(
  processResult: ProcessResult
): DeadCodeItem[] {
  const items: DeadCodeItem[] = [];

  if (!processResult.stdout) {
    return items;
  }

  const lines = processResult.stdout.split("\n");

  for (const line of lines) {
    if (!line.trim()) {
      continue;
    }

    const match = line.match(VULTURE_OUTPUT_PATTERN);
    if (match) {
      const [_, filePath, lineNumber, type, name, confidence] = match;

      items.push({
        filePath: filePath,
        lineNumber: parseInt(lineNumber, 10),
        name: name,
        type: type,
        confidence: parseInt(confidence, 10),
        details: line,
      });
    } else {
      Logger.debug(`Could not parse Vulture output line: ${line}`);
    }
  }

  return items;
}
