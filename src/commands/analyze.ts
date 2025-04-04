import * as vscode from "vscode";
import { PythonAnalyzer } from "../analyzers/python/pythonAnalyzer";
import { DeadCodeItem } from "../analyzers/analyzer";
import { Logger } from "../utils/logging";

/**
 * Status bar item for showing analysis status
 */
let statusBarItem: vscode.StatusBarItem;

/**
 * Register the analyze command and status bar item
 */
export function registerAnalyzeCommand(
  context: vscode.ExtensionContext,
  onAnalysisComplete: (items: DeadCodeItem[]) => void
): void {
  // Create status bar item
  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100
  );
  statusBarItem.text = "$(search) Find Dead Code";
  statusBarItem.command = "deadCodeFinder.analyze";
  statusBarItem.tooltip = "Find unused methods and functions in your code";
  context.subscriptions.push(statusBarItem);
  statusBarItem.show();

  // Register command for analyzing the workspace
  const analyzeCommand = vscode.commands.registerCommand(
    "deadCodeFinder.analyze",
    async () => {
      await analyzeWorkspace(onAnalysisComplete);
    }
  );
  context.subscriptions.push(analyzeCommand);

  // Register command for analyzing the current file
  const analyzeFileCommand = vscode.commands.registerCommand(
    "deadCodeFinder.analyzeFile",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showWarningMessage("No active file to analyze");
        return;
      }

      await analyzeFile(editor.document.uri.fsPath, onAnalysisComplete);
    }
  );
  context.subscriptions.push(analyzeFileCommand);
}

/**
 * Analyze Python files in the workspace
 */
export async function analyzeWorkspace(
  onAnalysisComplete: (items: DeadCodeItem[]) => void
): Promise<void> {
  try {
    Logger.info("Starting workspace analysis");
    updateStatus("$(sync~spin) Analyzing workspace...");

    // Get Python files in workspace
    const pythonFiles = await PythonAnalyzer.getWorkspacePythonFiles();
    if (pythonFiles.length === 0) {
      vscode.window.showInformationMessage(
        "No Python files found in workspace"
      );
      updateStatus("$(search) Find Dead Code");
      return;
    }

    Logger.debug(`Found ${pythonFiles.length} Python files to analyze`);
    await analyzePaths(pythonFiles, onAnalysisComplete);
  } catch (error) {
    Logger.error("Error analyzing workspace", error as Error);
    vscode.window.showErrorMessage(
      `Error analyzing workspace: ${(error as Error).message}`
    );
    updateStatus("$(search) Find Dead Code");
  }
}

/**
 * Analyze a specific Python file
 */
export async function analyzeFile(
  filePath: string,
  onAnalysisComplete: (items: DeadCodeItem[]) => void
): Promise<void> {
  try {
    Logger.info(`Starting analysis of file: ${filePath}`);
    updateStatus(`$(sync~spin) Analyzing ${filePath}...`);

    await analyzePaths([filePath], onAnalysisComplete);
  } catch (error) {
    Logger.error(`Error analyzing file ${filePath}`, error as Error);
    vscode.window.showErrorMessage(
      `Error analyzing file: ${(error as Error).message}`
    );
    updateStatus("$(search) Find Dead Code");
  }
}

/**
 * Analyze a list of paths for dead code
 */
async function analyzePaths(
  paths: string[],
  onAnalysisComplete: (items: DeadCodeItem[]) => void
): Promise<void> {
  if (paths.length === 0) {
    vscode.window.showInformationMessage("No paths to analyze");
    updateStatus("$(search) Find Dead Code");
    return;
  }

  try {
    const analyzer = new PythonAnalyzer();
    const result = await analyzer.analyze(paths);

    if (!result.success) {
      if (result.errors.length > 0) {
        vscode.window.showErrorMessage(
          `Analysis failed: ${result.errors.join(", ")}`
        );
      } else {
        vscode.window.showErrorMessage("Analysis failed");
      }
      updateStatus("$(search) Find Dead Code");
      return;
    }

    if (result.deadCodeItems.length === 0) {
      vscode.window.showInformationMessage("No dead code found");
      updateStatus("$(check) No dead code found");
      setTimeout(() => {
        updateStatus("$(search) Find Dead Code");
      }, 3000);
      onAnalysisComplete([]);
      return;
    }

    updateStatus(
      `$(alert) Found ${result.deadCodeItems.length} dead code items`
    );
    onAnalysisComplete(result.deadCodeItems);
  } catch (error) {
    Logger.error("Error analyzing paths", error as Error);
    vscode.window.showErrorMessage(
      `Error during analysis: ${(error as Error).message}`
    );
    updateStatus("$(search) Find Dead Code");
  }
}

/**
 * Update the status bar item text
 */
function updateStatus(text: string): void {
  statusBarItem.text = text;
}
