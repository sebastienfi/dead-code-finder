import * as vscode from "vscode";
import { DeadCodeItem } from "../analyzers/analyzer";
import { Logger } from "../utils/logging";

/**
 * Register commands for navigating to dead code
 */
export function registerNavigationCommands(
  context: vscode.ExtensionContext
): void {
  // Register command to open a dead code item
  const openDeadCodeCommand = vscode.commands.registerCommand(
    "deadCodeFinder.openDeadCode",
    async (item: DeadCodeItem) => {
      await openDeadCode(item);
    }
  );
  context.subscriptions.push(openDeadCodeCommand);

  // Register command to open settings
  const openSettingsCommand = vscode.commands.registerCommand(
    "deadCodeFinder.openSettings",
    async () => {
      await openSettings();
    }
  );
  context.subscriptions.push(openSettingsCommand);
}

/**
 * Open a document at the line containing dead code
 */
async function openDeadCode(item: DeadCodeItem): Promise<void> {
  try {
    Logger.info(`Opening file at line ${item.lineNumber}: ${item.filePath}`);

    // Create a URI for the file
    const uri = vscode.Uri.file(item.filePath);

    // Open the document
    const document = await vscode.workspace.openTextDocument(uri);
    const editor = await vscode.window.showTextDocument(document);

    // Get zero-based line number
    const lineNumber = Math.max(0, item.lineNumber - 1);

    // Create a range for the line
    const range = document.lineAt(lineNumber).range;

    // Reveal the line in the editor
    editor.revealRange(range, vscode.TextEditorRevealType.InCenter);

    // Select the line
    editor.selection = new vscode.Selection(range.start, range.end);
  } catch (error) {
    Logger.error(`Error opening dead code location`, error as Error);
    vscode.window.showErrorMessage(
      `Error opening file: ${(error as Error).message}`
    );
  }
}

/**
 * Open extension settings
 */
async function openSettings(): Promise<void> {
  Logger.info("Opening Dead Code Finder settings");
  await vscode.commands.executeCommand(
    "workbench.action.openSettings",
    "deadCodeFinder"
  );
}
