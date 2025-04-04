// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { Logger } from "./utils/logging";
import { registerDeadCodeTreeView } from "./views/deadCodeView";
import { registerAnalyzeCommand } from "./commands/analyze";
import { registerNavigationCommands } from "./commands/navigation";
import { DeadCodeItem } from "./analyzers/analyzer";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Initialize logger
  Logger.initialize(context);
  Logger.info("Activating Dead Code Finder extension");

  // Register the tree view for displaying dead code results
  const { treeDataProvider } = registerDeadCodeTreeView(context);

  // Register commands for analyzing code
  registerAnalyzeCommand(context, (items: DeadCodeItem[]) => {
    // Update tree view with results
    treeDataProvider.refresh(items);
  });

  // Register navigation commands
  registerNavigationCommands(context);

  // Set up file save listener for auto-analysis
  const configWatcher = vscode.workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration("deadCodeFinder")) {
      // Update logger level based on configuration
      const config = vscode.workspace.getConfiguration("deadCodeFinder");
      const logLevel = config.get<string>("logLevel", "info");
      Logger.info(`Configuration changed, updating log level to ${logLevel}`);
    }
  });
  context.subscriptions.push(configWatcher);

  // Setup auto-analysis on file save if enabled
  const config = vscode.workspace.getConfiguration("deadCodeFinder");
  if (config.get<boolean>("enableAutoAnalysis", false)) {
    setupAutoAnalysis(context, treeDataProvider);
  }

  Logger.info("Dead Code Finder extension activated");
}

/**
 * Set up auto-analysis on file save
 */
function setupAutoAnalysis(
  context: vscode.ExtensionContext,
  treeDataProvider: any
) {
  const fileWatcher = vscode.workspace.onDidSaveTextDocument((document) => {
    // Only analyze Python files for now
    if (document.languageId === "python") {
      const config = vscode.workspace.getConfiguration("deadCodeFinder");
      if (config.get<boolean>("enableAutoAnalysis", false)) {
        Logger.debug(`Auto-analyzing file: ${document.fileName}`);
        vscode.commands.executeCommand("deadCodeFinder.analyzeFile");
      }
    }
  });
  context.subscriptions.push(fileWatcher);
}

// This method is called when your extension is deactivated
export function deactivate() {
  Logger.info("Deactivating Dead Code Finder extension");
}
