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
    const result = await executePythonCommand(["-m", "pip", "show", "vulture"]);
    return result.code === 0;
  } catch (error) {
    return false;
  }
}

/**
 * Install Vulture via pip
 */
export async function installVulture(): Promise<boolean> {
  try {
    Logger.info("Installing Vulture...");
    const result = await executePythonCommand([
      "-m",
      "pip",
      "install",
      "vulture",
    ]);
    if (result.code === 0) {
      Logger.info("Vulture installed successfully");
      return true;
    } else {
      Logger.error(`Failed to install Vulture: ${result.stderr}`);
      return false;
    }
  } catch (error) {
    Logger.error("Error installing Vulture", error as Error);
    return false;
  }
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
    // Prepare vulture command
    const args = [
      "-m",
      "vulture",
      "--min-confidence",
      minConfidence.toString(),
      ...paths,
    ];

    // Get whitelist file if specified
    const config = vscode.workspace.getConfiguration("deadCodeFinder");
    const whitelistFile = config.get<string>("whitelistFile");
    if (whitelistFile && fs.existsSync(whitelistFile)) {
      args.push(whitelistFile);
    }

    // Run vulture
    Logger.debug(`Running Vulture with args: ${args.join(" ")}`);
    const processResult = await executePythonCommand(args);

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
function parseVultureOutput(processResult: ProcessResult): DeadCodeItem[] {
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
