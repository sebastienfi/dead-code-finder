import * as assert from "assert";
import * as vscode from "vscode";
import {
  DeadCodeItem,
  AnalysisResult,
  IAnalyzer,
} from "../../analyzers/analyzer";

suite("Analyzer Interface Test Suite", () => {
  // Mock analyzer implementing the IAnalyzer interface
  class MockAnalyzer implements IAnalyzer {
    private languageId: string = "mock";
    private available: boolean = true;
    private mockItems: DeadCodeItem[] = [];

    constructor(
      languageId: string,
      available: boolean,
      mockItems: DeadCodeItem[] = []
    ) {
      this.languageId = languageId;
      this.available = available;
      this.mockItems = mockItems;
    }

    getLanguageId(): string {
      return this.languageId;
    }

    async isAvailable(): Promise<boolean> {
      return this.available;
    }

    async installDependencies(): Promise<boolean> {
      this.available = true;
      return true;
    }

    async analyze(paths: string[]): Promise<AnalysisResult> {
      return {
        deadCodeItems: this.mockItems,
        errors: [],
        warnings: [],
        success: true,
      };
    }

    getDeadCodeUri(item: DeadCodeItem): vscode.Uri {
      return vscode.Uri.file(item.filePath);
    }

    getDeadCodeRange(item: DeadCodeItem): vscode.Range {
      const line = item.lineNumber - 1;
      return new vscode.Range(line, 0, line, 0);
    }

    dispose(): void {
      // Nothing to dispose
    }
  }

  test("IAnalyzer implementation basic functionality", async () => {
    // Create mock items
    const mockItems: DeadCodeItem[] = [
      {
        filePath: "/path/to/file.py",
        lineNumber: 10,
        name: "unused_function",
        type: "function",
        confidence: 90,
      },
      {
        filePath: "/path/to/file.py",
        lineNumber: 20,
        name: "unused_class",
        type: "class",
        confidence: 80,
      },
    ];

    // Create mock analyzer
    const analyzer = new MockAnalyzer("python", true, mockItems);

    // Test basic properties
    assert.strictEqual(analyzer.getLanguageId(), "python");
    assert.strictEqual(await analyzer.isAvailable(), true);

    // Test analysis
    const result = await analyzer.analyze(["/path/to/file.py"]);
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.deadCodeItems.length, 2);
    assert.strictEqual(result.deadCodeItems[0].name, "unused_function");
    assert.strictEqual(result.deadCodeItems[1].name, "unused_class");

    // Test URI and range generation
    const uri = analyzer.getDeadCodeUri(mockItems[0]);
    assert.strictEqual(uri.fsPath, mockItems[0].filePath);

    const range = analyzer.getDeadCodeRange(mockItems[0]);
    assert.strictEqual(range.start.line, mockItems[0].lineNumber - 1);
  });

  test("IAnalyzer with unavailable dependencies", async () => {
    // Create mock analyzer with dependencies not available
    const analyzer = new MockAnalyzer("python", false);

    // Test availability
    assert.strictEqual(await analyzer.isAvailable(), false);

    // Test installing dependencies
    const installed = await analyzer.installDependencies();
    assert.strictEqual(installed, true);
    assert.strictEqual(await analyzer.isAvailable(), true);
  });
});
