import * as vscode from "vscode";
import { DeadCodeItem } from "../analyzers/analyzer";
import { PythonAnalyzer } from "../analyzers/python/pythonAnalyzer";
import { Logger } from "../utils/logging";

/**
 * Register navigation commands for dead code
 */
export function registerNavigationCommands(
  context: vscode.ExtensionContext
): void {
  // Command to open a dead code item
  const openDeadCodeCommand = vscode.commands.registerCommand(
    "deadCodeFinder.openDeadCode",
    async (item: DeadCodeItem) => {
      await openDeadCode(item);
    }
  );
  context.subscriptions.push(openDeadCodeCommand);
}

/**
 * Open a dead code item in the editor
 */
export async function openDeadCode(item: DeadCodeItem): Promise<void> {
  try {
    Logger.debug(
      `Opening dead code: ${item.name} in ${item.filePath}:${item.lineNumber}`
    );

    // Get analyzer for this item's language (currently only Python supported)
    const analyzer = new PythonAnalyzer();

    // Get URI and range for the item
    const uri = analyzer.getDeadCodeUri(item);
    const range = analyzer.getDeadCodeRange(item);

    // Open the document and show the range
    const document = await vscode.workspace.openTextDocument(uri);
    const editor = await vscode.window.showTextDocument(document);

    // Reveal the range in the editor
    editor.revealRange(range, vscode.TextEditorRevealType.InCenter);

    // Set selection to the range
    editor.selection = new vscode.Selection(range.start, range.start);
  } catch (error) {
    Logger.error(`Error opening dead code: ${item.name}`, error as Error);
    vscode.window.showErrorMessage(
      `Error opening dead code: ${(error as Error).message}`
    );
  }
}
