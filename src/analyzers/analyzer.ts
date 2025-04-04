import * as vscode from "vscode";

/**
 * Represents a dead code item found during analysis
 */
export interface DeadCodeItem {
  /** Full path to the file containing the dead code */
  filePath: string;
  /** The line number where the dead code starts (1-based) */
  lineNumber: number;
  /** The column number where the dead code starts (1-based) */
  columnNumber?: number;
  /** The name of the dead code item (function, method, etc.) */
  name: string;
  /** The type of the dead code (function, method, class, etc.) */
  type: string;
  /** Confidence level of this being dead code (0-100) */
  confidence: number;
  /** Additional information about the dead code item */
  details?: string;
}

/**
 * Result of a dead code analysis
 */
export interface AnalysisResult {
  /** List of dead code items found */
  deadCodeItems: DeadCodeItem[];
  /** Any errors encountered during analysis */
  errors: string[];
  /** Warning messages from the analysis */
  warnings: string[];
  /** Whether the analysis completed successfully */
  success: boolean;
}

/**
 * Base interface for all language-specific dead code analyzers
 */
export interface IAnalyzer {
  /**
   * Get the language ID that this analyzer supports
   */
  getLanguageId(): string;

  /**
   * Check if the analyzer is available (e.g., required tools are installed)
   */
  isAvailable(): Promise<boolean>;

  /**
   * Install any dependencies required by the analyzer
   */
  installDependencies(): Promise<boolean>;

  /**
   * Analyze files or directories for dead code
   */
  analyze(paths: string[]): Promise<AnalysisResult>;

  /**
   * Get the URI for a dead code item (for navigation)
   */
  getDeadCodeUri(item: DeadCodeItem): vscode.Uri;

  /**
   * Get a range for a dead code item (for highlighting)
   */
  getDeadCodeRange(item: DeadCodeItem): vscode.Range;

  /**
   * Dispose of any resources used by the analyzer
   */
  dispose(): void;
}
