import * as vscode from "vscode";
import * as path from "path";
import { IAnalyzer, DeadCodeItem, AnalysisResult } from "../analyzer";
import {
  isVultureInstalled,
  installVulture,
  runVultureAnalysis,
} from "./vulture";
import { Logger } from "../../utils/logging";

/**
 * Python analyzer implementation using Vulture for dead code detection
 */
export class PythonAnalyzer implements IAnalyzer {
  /**
   * Get the language ID supported by this analyzer
   */
  public getLanguageId(): string {
    return "python";
  }

  /**
   * Check if the analyzer dependencies are available
   */
  public async isAvailable(): Promise<boolean> {
    const installed = await isVultureInstalled();
    if (!installed) {
      const message = "Vulture is not installed. Would you like to install it?";
      const install = "Install";
      const manualInstall = "Manual Install";
      const showInstructions = "Show Instructions";
      const cancel = "Cancel";

      const response = await vscode.window.showWarningMessage(
        message,
        install,
        manualInstall,
        showInstructions,
        cancel
      );

      if (response === install) {
        const success = await this.installDependencies();
        if (!success) {
          vscode.window.showErrorMessage(
            "Automatic installation failed. Please try installing manually."
          );
        }

        // Recheck if Vulture is now installed
        return await isVultureInstalled();
      } else if (response === manualInstall) {
        // Open a terminal for manual installation
        const terminal = vscode.window.createTerminal("Vulture Installation");
        terminal.show();
        terminal.sendText("pip install vulture --user");

        vscode.window.showInformationMessage(
          "After installation completes, please try analyzing again."
        );

        return false;
      } else if (response === showInstructions) {
        // Show a more detailed information message with instructions
        vscode.window.showInformationMessage(
          "To install Vulture manually:\n\n" +
            "1. Open a terminal\n" +
            "2. Run: pip install vulture --user\n" +
            "3. Restart VS Code\n\n" +
            "If that doesn't work, try with pip3 instead of pip."
        );
        return false;
      }

      return false;
    }

    return true;
  }

  /**
   * Install dependencies required by the analyzer
   */
  public async installDependencies(): Promise<boolean> {
    return installVulture();
  }

  /**
   * Analyze the given paths for dead code
   */
  public async analyze(paths: string[]): Promise<AnalysisResult> {
    // Ensure vulture is installed
    if (!(await this.isAvailable())) {
      return {
        deadCodeItems: [],
        errors: [
          "Vulture is not installed. Please install it to use the Python analyzer.",
        ],
        warnings: [],
        success: false,
      };
    }

    // Get configuration
    const config = vscode.workspace.getConfiguration("deadCodeFinder");
    const minConfidence = config.get<number>("minConfidence", 60);

    // Run analysis
    return runVultureAnalysis(paths, minConfidence);
  }

  /**
   * Get the URI for navigating to a dead code item
   */
  public getDeadCodeUri(item: DeadCodeItem): vscode.Uri {
    return vscode.Uri.file(item.filePath);
  }

  /**
   * Get the range for highlighting a dead code item
   */
  public getDeadCodeRange(item: DeadCodeItem): vscode.Range {
    // Vulture only provides the line number, so we use the full line
    const line = item.lineNumber - 1; // Convert to 0-based
    return new vscode.Range(line, 0, line, 0);
  }

  /**
   * Dispose of any resources
   */
  public dispose(): void {
    // No resources to dispose
  }

  /**
   * Get workspace Python files
   */
  public static async getWorkspacePythonFiles(): Promise<string[]> {
    const pythonFiles: string[] = [];

    // Get all workspace folders
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      return pythonFiles;
    }

    // Get configuration for exclude patterns
    const config = vscode.workspace.getConfiguration("deadCodeFinder");
    const excludePatterns = config.get<string[]>("excludePatterns", [
      "**/venv/**",
      "**/node_modules/**",
      "**/.*/**",
    ]);

    // Join exclude patterns for the findFiles exclude parameter
    const excludePattern =
      excludePatterns.length > 0 ? `{${excludePatterns.join(",")}}` : null;
    Logger.debug(`Using exclude pattern: ${excludePattern}`);

    // Find Python files
    for (const folder of workspaceFolders) {
      try {
        const pattern = new vscode.RelativePattern(folder, "**/*.py");
        const files = await vscode.workspace.findFiles(pattern, excludePattern);

        // Convert to path strings
        for (const file of files) {
          pythonFiles.push(file.fsPath);
        }
      } catch (error) {
        Logger.error(
          `Error finding Python files in ${folder.name}`,
          error as Error
        );
      }
    }

    return pythonFiles;
  }

  /**
   * Get Python files in the given folder
   */
  public static async getPythonFilesInFolder(
    folderPath: string
  ): Promise<string[]> {
    try {
      const folder = vscode.workspace.getWorkspaceFolder(
        vscode.Uri.file(folderPath)
      );
      if (!folder) {
        return [];
      }

      // Get configuration for exclude patterns
      const config = vscode.workspace.getConfiguration("deadCodeFinder");
      const excludePatterns = config.get<string[]>("excludePatterns", [
        "**/venv/**",
        "**/node_modules/**",
        "**/.*/**",
      ]);

      // Join exclude patterns for the findFiles exclude parameter
      const excludePattern =
        excludePatterns.length > 0 ? `{${excludePatterns.join(",")}}` : null;

      const pattern = new vscode.RelativePattern(
        folder,
        path.join(path.relative(folder.uri.fsPath, folderPath), "**/*.py")
      );
      const files = await vscode.workspace.findFiles(pattern, excludePattern);

      return files.map((file) => file.fsPath);
    } catch (error) {
      Logger.error(
        `Error finding Python files in ${folderPath}`,
        error as Error
      );
      return [];
    }
  }
}
