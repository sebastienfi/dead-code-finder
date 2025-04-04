import * as cp from "child_process";
import * as vscode from "vscode";

/**
 * Result of a process execution
 */
export interface ProcessResult {
  /** Standard output from the process */
  stdout: string;
  /** Standard error from the process */
  stderr: string;
  /** Exit code of the process */
  code: number | null;
}

/**
 * Execute a command as a child process
 * @param command The command to execute
 * @param args Arguments to pass to the command
 * @param options Options for executing the command
 * @returns Promise with the process result
 */
export async function executeCommand(
  command: string,
  args: string[],
  options: cp.ExecOptions = {}
): Promise<ProcessResult> {
  return new Promise<ProcessResult>((resolve) => {
    const process = cp.spawn(command, args, options);
    let stdout = "";
    let stderr = "";

    process.stdout?.on("data", (data) => {
      stdout += data.toString();
    });

    process.stderr?.on("data", (data) => {
      stderr += data.toString();
    });

    process.on("close", (code) => {
      resolve({ stdout, stderr, code });
    });

    process.on("error", (err) => {
      stderr += err.message;
      resolve({ stdout, stderr, code: null });
    });
  });
}

/**
 * Check if a command is available in the system
 * @param command The command to check
 * @returns Promise resolving to true if the command is available
 */
export async function isCommandAvailable(command: string): Promise<boolean> {
  try {
    const isWindows = process.platform === "win32";
    const testCommand = isWindows ? "where" : "which";
    const testArgs = isWindows ? [command] : [command];

    const result = await executeCommand(testCommand, testArgs);
    return result.code === 0;
  } catch (error) {
    return false;
  }
}

/**
 * Execute a Python command (handling Python executable selection)
 * @param args Arguments to pass to the Python interpreter
 * @param options Options for executing the command
 * @returns Promise with the process result
 */
export async function executePythonCommand(
  args: string[],
  options: cp.ExecOptions = {}
): Promise<ProcessResult> {
  // Try to get python path from VS Code Python extension
  const pythonConfig = vscode.workspace.getConfiguration("python");
  let pythonPath =
    pythonConfig.get<string>("defaultInterpreterPath") || "python";

  // Try multiple Python paths in sequence if the first one fails
  // Start with most common paths that should work for most users
  const pythonPaths = [
    // VS Code configured Python (most reliable if set)
    pythonPath,
    // Standard system commands (should work for most users)
    "python",
    "python3",
    // Common system paths
    "/usr/bin/python3",
    "/usr/bin/python",
    "/usr/local/bin/python3",
    "/usr/local/bin/python",
  ];

  // Add platform-specific paths
  if (process.platform === "win32") {
    // Windows Python installations
    pythonPaths.push(
      "C:\\Python39\\python.exe",
      "C:\\Python310\\python.exe",
      "C:\\Python311\\python.exe"
    );
  } else if (process.platform === "darwin") {
    // macOS homebrew and other common paths
    pythonPaths.push("/opt/homebrew/bin/python3", "/opt/local/bin/python3");
  }

  // Add virtual env paths - used by all Python version managers
  if (process.env.VIRTUAL_ENV) {
    // If a virtual environment is active, prioritize its Python
    pythonPaths.unshift(
      `${process.env.VIRTUAL_ENV}/bin/python`,
      `${process.env.VIRTUAL_ENV}/Scripts/python.exe` // For Windows
    );
  }

  // Try each Python executable in sequence
  for (const path of pythonPaths) {
    try {
      const result = await executeCommand(path, args, options);
      // If successful or has any output (even with errors), return the result
      if (result.code === 0 || result.code === 3 || result.stdout.length > 0) {
        // Remember this path for future calls if it's valid
        if (
          path.startsWith("/") ||
          path.startsWith("C:\\") ||
          !path.includes("/")
        ) {
          try {
            pythonConfig.update(
              "defaultInterpreterPath",
              path,
              vscode.ConfigurationTarget.Global
            );
          } catch (error) {
            // Ignore errors updating config
          }
        }
        return result;
      }
    } catch (error) {
      // Continue to the next path
    }
  }

  // Add version managers only as a last resort
  if (process.env.HOME) {
    // Common version manager paths
    const versionManagerPaths = [];

    // pyenv
    if (process.platform !== "win32") {
      versionManagerPaths.push(
        `${process.env.HOME}/.pyenv/shims/python`,
        `${process.env.HOME}/.pyenv/shims/python3`
      );
    }

    // Try version manager paths
    for (const path of versionManagerPaths) {
      try {
        const result = await executeCommand(path, args, options);
        if (
          result.code === 0 ||
          result.code === 3 ||
          result.stdout.length > 0
        ) {
          try {
            pythonConfig.update(
              "defaultInterpreterPath",
              path,
              vscode.ConfigurationTarget.Global
            );
          } catch (error) {
            // Ignore errors updating config
          }
          return result;
        }
      } catch (error) {
        // Continue to the next path
      }
    }
  }

  // If all paths failed, return a more descriptive error
  return {
    stdout: "",
    stderr: `Failed to execute Python command. Could not find a working Python interpreter with required packages.`,
    code: null,
  };
}
