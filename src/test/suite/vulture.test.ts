import * as assert from "assert";
import * as path from "path";
import { parseVultureOutput } from "../../analyzers/python/vulture";
import { ProcessResult } from "../../utils/process";
import * as vulture from "../../analyzers/python/vulture";
import * as sinon from "sinon";
import * as vscode from "vscode";

suite("Vulture Integration Test Suite", () => {
  // Create a sandbox for stubbing functions
  let sandbox: sinon.SinonSandbox;

  setup(() => {
    // Create a new sandbox before each test
    sandbox = sinon.createSandbox();
  });

  teardown(() => {
    // Restore all stubs after each test
    sandbox.restore();
  });

  test("isVultureInstalled should check multiple methods", async () => {
    // Mock the execution functions to simulate different scenarios
    const executePythonCommandStub = sandbox.stub();
    const executeCommandStub = sandbox.stub();
    const existsSyncStub = sandbox.stub();

    // Replace the original functions with our stubs
    sandbox.replace(
      require("../../utils/process"),
      "executePythonCommand",
      executePythonCommandStub
    );
    sandbox.replace(
      require("../../utils/process"),
      "executeCommand",
      executeCommandStub
    );
    sandbox.replace(require("fs"), "existsSync", existsSyncStub);

    // Test 1: pip method succeeds
    executePythonCommandStub.resolves({
      code: 0,
      stdout: "vulture is installed",
      stderr: "",
    });
    assert.strictEqual(
      await vulture.isVultureInstalled(),
      true,
      "Should detect via pip"
    );

    // Reset stubs for the next test
    executePythonCommandStub.reset();
    executeCommandStub.reset();

    // Test 2: pip fails but direct PATH succeeds
    executePythonCommandStub.resolves({
      code: 1,
      stdout: "",
      stderr: "pip not found",
    });
    executeCommandStub
      .withArgs("vulture", ["--version"])
      .resolves({ code: 0, stdout: "vulture 1.0", stderr: "" });
    assert.strictEqual(
      await vulture.isVultureInstalled(),
      true,
      "Should detect via direct PATH"
    );

    // Reset stubs for the next test
    executePythonCommandStub.reset();
    executeCommandStub.reset();

    // Test 3: pip and direct PATH fail but uvx succeeds
    executePythonCommandStub.resolves({
      code: 1,
      stdout: "",
      stderr: "pip not found",
    });
    executeCommandStub
      .withArgs("vulture", ["--version"])
      .rejects(new Error("command not found"));
    executeCommandStub
      .withArgs("uvx", ["vulture", "--version"])
      .resolves({ code: 0, stdout: "vulture 1.0", stderr: "" });
    assert.strictEqual(
      await vulture.isVultureInstalled(),
      true,
      "Should detect via uvx"
    );

    // Reset stubs for the next test
    executePythonCommandStub.reset();
    executeCommandStub.reset();
    existsSyncStub.reset();

    // Test 4: Only custom path succeeds
    executePythonCommandStub.resolves({
      code: 1,
      stdout: "",
      stderr: "pip not found",
    });
    executeCommandStub
      .withArgs("vulture", ["--version"])
      .rejects(new Error("command not found"));
    executeCommandStub
      .withArgs("uvx", ["vulture", "--version"])
      .rejects(new Error("command not found"));

    // Mock the vscode configuration
    const getConfigurationStub = sandbox
      .stub(vscode.workspace, "getConfiguration")
      .returns({
        get: (_: string, defaultValue: any) => "/custom/path/to/vulture",
      } as any);

    existsSyncStub.withArgs("/custom/path/to/vulture").returns(true);
    assert.strictEqual(
      await vulture.isVultureInstalled(),
      true,
      "Should detect via custom path"
    );

    // Reset stubs for the next test
    executePythonCommandStub.reset();
    executeCommandStub.reset();
    existsSyncStub.reset();
    getConfigurationStub.restore();

    // Test 5: All methods fail
    executePythonCommandStub.resolves({
      code: 1,
      stdout: "",
      stderr: "pip not found",
    });
    executeCommandStub
      .withArgs("vulture", ["--version"])
      .rejects(new Error("command not found"));
    executeCommandStub
      .withArgs("uvx", ["vulture", "--version"])
      .rejects(new Error("command not found"));

    // Mock the vscode configuration
    const getConfigurationStub2 = sandbox
      .stub(vscode.workspace, "getConfiguration")
      .returns({
        get: (_: string, defaultValue: any) => "",
      } as any);

    assert.strictEqual(
      await vulture.isVultureInstalled(),
      false,
      "Should return false when all methods fail"
    );
  });

  test("parseVultureOutput with valid output", () => {
    // Create mock Vulture output
    const mockOutput = `/path/to/file.py:10: unused function 'unused_function' (90% confidence)
/path/to/file.py:20: unused class 'UnusedClass' (80% confidence)
/path/to/file.py:30: unused method 'unused_method' (100% confidence)
/path/to/another_file.py:5: unused import 'os' (90% confidence)`;

    const mockResult: ProcessResult = {
      stdout: mockOutput,
      stderr: "",
      code: 3, // Vulture exit code for dead code found
    };

    // Parse the output
    const deadCodeItems = parseVultureOutput(mockResult);

    // Verify the results
    assert.strictEqual(deadCodeItems.length, 4);

    // Check first item
    assert.strictEqual(deadCodeItems[0].filePath, "/path/to/file.py");
    assert.strictEqual(deadCodeItems[0].lineNumber, 10);
    assert.strictEqual(deadCodeItems[0].name, "unused_function");
    assert.strictEqual(deadCodeItems[0].type, "function");
    assert.strictEqual(deadCodeItems[0].confidence, 90);

    // Check second item
    assert.strictEqual(deadCodeItems[1].filePath, "/path/to/file.py");
    assert.strictEqual(deadCodeItems[1].lineNumber, 20);
    assert.strictEqual(deadCodeItems[1].name, "UnusedClass");
    assert.strictEqual(deadCodeItems[1].type, "class");
    assert.strictEqual(deadCodeItems[1].confidence, 80);

    // Check third item
    assert.strictEqual(deadCodeItems[2].filePath, "/path/to/file.py");
    assert.strictEqual(deadCodeItems[2].lineNumber, 30);
    assert.strictEqual(deadCodeItems[2].name, "unused_method");
    assert.strictEqual(deadCodeItems[2].type, "method");
    assert.strictEqual(deadCodeItems[2].confidence, 100);

    // Check fourth item
    assert.strictEqual(deadCodeItems[3].filePath, "/path/to/another_file.py");
    assert.strictEqual(deadCodeItems[3].lineNumber, 5);
    assert.strictEqual(deadCodeItems[3].name, "os");
    assert.strictEqual(deadCodeItems[3].type, "import");
    assert.strictEqual(deadCodeItems[3].confidence, 90);
  });

  test("parseVultureOutput with empty output", () => {
    const mockResult: ProcessResult = {
      stdout: "",
      stderr: "",
      code: 0, // Vulture exit code for no dead code found
    };

    // Parse the output
    const deadCodeItems = parseVultureOutput(mockResult);

    // Verify the results
    assert.strictEqual(deadCodeItems.length, 0);
  });

  test("parseVultureOutput with invalid output format", () => {
    const mockOutput = `This is not valid Vulture output
Neither is this
/path/to/file.py:10: unused function 'unused_function' (90% confidence)
Invalid line format`;

    const mockResult: ProcessResult = {
      stdout: mockOutput,
      stderr: "",
      code: 0,
    };

    // Parse the output
    const deadCodeItems = parseVultureOutput(mockResult);

    // Verify the results - should only parse the valid line
    assert.strictEqual(deadCodeItems.length, 1);
    assert.strictEqual(deadCodeItems[0].name, "unused_function");
  });
});
