import * as vscode from "vscode";
import { DeadCodeItem } from "../analyzers/analyzer";
import { Logger } from "../utils/logging";

/**
 * Diagnostics collection for dead code warnings
 */
let diagnosticsCollection: vscode.DiagnosticCollection;

/**
 * Initialize the diagnostics provider
 */
export function initDiagnosticsProvider(
  context: vscode.ExtensionContext
): void {
  // Create diagnostics collection
  diagnosticsCollection =
    vscode.languages.createDiagnosticCollection("deadCodeFinder");
  context.subscriptions.push(diagnosticsCollection);

  Logger.debug("Diagnostics provider initialized");
}

/**
 * Update diagnostics for dead code items
 */
export function updateDiagnostics(items: DeadCodeItem[]): void {
  // Clear existing diagnostics
  diagnosticsCollection.clear();

  // Group by file
  const fileMap = new Map<string, DeadCodeItem[]>();

  for (const item of items) {
    if (!fileMap.has(item.filePath)) {
      fileMap.set(item.filePath, []);
    }
    fileMap.get(item.filePath)!.push(item);
  }

  // Create diagnostics for each file
  fileMap.forEach((fileItems, filePath) => {
    const diagnostics: vscode.Diagnostic[] = [];

    for (const item of fileItems) {
      const lineNumber = Math.max(0, item.lineNumber - 1); // Convert to 0-based
      const range = new vscode.Range(
        lineNumber,
        0,
        lineNumber,
        Number.MAX_SAFE_INTEGER
      );

      // Create diagnostic with appropriate severity based on confidence
      const diagnostic = new vscode.Diagnostic(
        range,
        `Unused ${item.type}: '${item.name}' (${item.confidence}% confidence)`,
        getDiagnosticSeverity(item.confidence)
      );

      // Add code and source
      diagnostic.code = "dead-code";
      diagnostic.source = "Dead Code Finder";

      // Add related information if available
      if (item.details) {
        diagnostic.relatedInformation = [
          new vscode.DiagnosticRelatedInformation(
            new vscode.Location(vscode.Uri.file(item.filePath), range),
            item.details
          ),
        ];
      }

      diagnostics.push(diagnostic);
    }

    // Add diagnostics to collection
    diagnosticsCollection.set(vscode.Uri.file(filePath), diagnostics);
  });

  Logger.debug(
    `Updated diagnostics for ${items.length} items across ${fileMap.size} files`
  );
}

/**
 * Clear all diagnostics
 */
export function clearDiagnostics(): void {
  diagnosticsCollection.clear();
  Logger.debug("Cleared all diagnostics");
}

/**
 * Get diagnostic severity based on confidence level
 */
function getDiagnosticSeverity(confidence: number): vscode.DiagnosticSeverity {
  if (confidence >= 90) {
    return vscode.DiagnosticSeverity.Warning;
  } else if (confidence >= 70) {
    return vscode.DiagnosticSeverity.Information;
  } else {
    return vscode.DiagnosticSeverity.Hint;
  }
}
