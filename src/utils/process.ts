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
  const pythonPath =
    pythonConfig.get<string>("defaultInterpreterPath") || "python";

  return executeCommand(pythonPath, args, options);
}
