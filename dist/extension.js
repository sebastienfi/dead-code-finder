/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.activate = activate;
exports.deactivate = deactivate;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = __importStar(__webpack_require__(1));
const logging_1 = __webpack_require__(2);
const deadCodeView_1 = __webpack_require__(3);
const analyze_1 = __webpack_require__(5);
const navigation_1 = __webpack_require__(11);
const whitelist_1 = __webpack_require__(12);
const diagnostics_1 = __webpack_require__(14);
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
function activate(context) {
    // Initialize logger
    logging_1.Logger.initialize(context);
    logging_1.Logger.info("Activating Dead Code Finder extension");
    // Initialize diagnostics provider
    (0, diagnostics_1.initDiagnosticsProvider)(context);
    // Store dead code items for access across commands
    let deadCodeItems = [];
    // Register the tree view for displaying dead code results
    const { treeDataProvider } = (0, deadCodeView_1.registerDeadCodeTreeView)(context);
    // Register commands for analyzing code
    (0, analyze_1.registerAnalyzeCommand)(context, (items) => {
        // Store items for other commands
        deadCodeItems = items;
        // Update tree view with results
        treeDataProvider.refresh(items);
        // Update diagnostics
        const config = vscode.workspace.getConfiguration("deadCodeFinder");
        if (config.get("showDiagnostics", true)) {
            (0, diagnostics_1.updateDiagnostics)(items);
        }
        else {
            (0, diagnostics_1.clearDiagnostics)();
        }
    });
    // Register navigation commands
    (0, navigation_1.registerNavigationCommands)(context);
    // Register whitelist commands
    (0, whitelist_1.registerWhitelistCommands)(context, () => deadCodeItems);
    // Set up configuration change listener
    const configWatcher = vscode.workspace.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration("deadCodeFinder")) {
            // Update logger level based on configuration
            const config = vscode.workspace.getConfiguration("deadCodeFinder");
            const logLevel = config.get("logLevel", "info");
            logging_1.Logger.info(`Configuration changed, updating log level to ${logLevel}`);
            // Handle diagnostics visibility change
            if (e.affectsConfiguration("deadCodeFinder.showDiagnostics")) {
                if (config.get("showDiagnostics", true)) {
                    (0, diagnostics_1.updateDiagnostics)(deadCodeItems);
                }
                else {
                    (0, diagnostics_1.clearDiagnostics)();
                }
            }
        }
    });
    context.subscriptions.push(configWatcher);
    // Setup auto-analysis on file save if enabled
    const config = vscode.workspace.getConfiguration("deadCodeFinder");
    if (config.get("enableAutoAnalysis", false)) {
        setupAutoAnalysis(context, treeDataProvider);
    }
    logging_1.Logger.info("Dead Code Finder extension activated");
}
/**
 * Set up auto-analysis on file save
 */
function setupAutoAnalysis(context, treeDataProvider) {
    const fileWatcher = vscode.workspace.onDidSaveTextDocument((document) => {
        // Only analyze Python files for now
        if (document.languageId === "python") {
            const config = vscode.workspace.getConfiguration("deadCodeFinder");
            if (config.get("enableAutoAnalysis", false)) {
                logging_1.Logger.debug(`Auto-analyzing file: ${document.fileName}`);
                vscode.commands.executeCommand("deadCodeFinder.analyzeFile");
            }
        }
    });
    context.subscriptions.push(fileWatcher);
}
// This method is called when your extension is deactivated
function deactivate() {
    // Clear diagnostics on deactivation
    (0, diagnostics_1.clearDiagnostics)();
    logging_1.Logger.info("Deactivating Dead Code Finder extension");
}


/***/ }),
/* 1 */
/***/ ((module) => {

module.exports = require("vscode");

/***/ }),
/* 2 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Logger = exports.LogLevel = void 0;
const vscode = __importStar(__webpack_require__(1));
/**
 * Logging levels for the extension
 */
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 1] = "INFO";
    LogLevel[LogLevel["WARN"] = 2] = "WARN";
    LogLevel[LogLevel["ERROR"] = 3] = "ERROR";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
/**
 * Logger class for the extension
 */
class Logger {
    static _outputChannel;
    static _logLevel = LogLevel.INFO;
    /**
     * Initialize the logger
     */
    static initialize(context) {
        this._outputChannel = vscode.window.createOutputChannel("Dead Code Finder");
        context.subscriptions.push(this._outputChannel);
        // Get the log level from configuration
        const config = vscode.workspace.getConfiguration("deadCodeFinder");
        const configLevel = config.get("logLevel", "info");
        this._logLevel = this.getLogLevelFromString(configLevel);
    }
    /**
     * Set the logging level
     */
    static setLogLevel(level) {
        this._logLevel = level;
    }
    /**
     * Log a debug message
     */
    static debug(message) {
        this.log(LogLevel.DEBUG, message);
    }
    /**
     * Log an info message
     */
    static info(message) {
        this.log(LogLevel.INFO, message);
    }
    /**
     * Log a warning message
     */
    static warn(message) {
        this.log(LogLevel.WARN, message);
    }
    /**
     * Log an error message
     */
    static error(message, error) {
        let fullMessage = message;
        if (error) {
            fullMessage += `\n${error.message}`;
            if (error.stack) {
                fullMessage += `\n${error.stack}`;
            }
        }
        this.log(LogLevel.ERROR, fullMessage);
    }
    /**
     * Log a message at the specified level
     */
    static log(level, message) {
        if (level < this._logLevel) {
            return;
        }
        if (!this._outputChannel) {
            // Create output channel if not initialized
            this._outputChannel =
                vscode.window.createOutputChannel("Dead Code Finder");
        }
        const timestamp = new Date().toISOString();
        const levelStr = LogLevel[level];
        const formattedMessage = `[${timestamp}] [${levelStr}] ${message}`;
        this._outputChannel.appendLine(formattedMessage);
    }
    /**
     * Convert a string log level to the enum value
     */
    static getLogLevelFromString(level) {
        switch (level.toLowerCase()) {
            case "debug":
                return LogLevel.DEBUG;
            case "info":
                return LogLevel.INFO;
            case "warn":
            case "warning":
                return LogLevel.WARN;
            case "error":
                return LogLevel.ERROR;
            default:
                return LogLevel.INFO;
        }
    }
    /**
     * Show the output channel
     */
    static show() {
        this._outputChannel.show();
    }
}
exports.Logger = Logger;


/***/ }),
/* 3 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DeadCodeTreeProvider = exports.DeadCodeTreeItem = exports.DeadCodeTreeItemType = void 0;
exports.registerDeadCodeTreeView = registerDeadCodeTreeView;
const vscode = __importStar(__webpack_require__(1));
const path = __importStar(__webpack_require__(4));
const logging_1 = __webpack_require__(2);
/**
 * Tree item types for the dead code tree view
 */
var DeadCodeTreeItemType;
(function (DeadCodeTreeItemType) {
    DeadCodeTreeItemType[DeadCodeTreeItemType["FILE"] = 0] = "FILE";
    DeadCodeTreeItemType[DeadCodeTreeItemType["DEAD_CODE_ITEM"] = 1] = "DEAD_CODE_ITEM";
})(DeadCodeTreeItemType || (exports.DeadCodeTreeItemType = DeadCodeTreeItemType = {}));
/**
 * Tree item representing a file or dead code item in the tree view
 */
class DeadCodeTreeItem extends vscode.TreeItem {
    label;
    type;
    deadCodeItem;
    children;
    constructor(label, type, deadCodeItem, children = []) {
        super(label, type === DeadCodeTreeItemType.FILE
            ? vscode.TreeItemCollapsibleState.Expanded
            : vscode.TreeItemCollapsibleState.None);
        this.label = label;
        this.type = type;
        this.deadCodeItem = deadCodeItem;
        this.children = children;
        // Set properties based on type
        if (type === DeadCodeTreeItemType.FILE) {
            this.iconPath = {
                light: path.join(__filename, "..", "..", "..", "resources", "light", "file.svg"),
                dark: path.join(__filename, "..", "..", "..", "resources", "dark", "file.svg"),
            };
            this.description = "";
        }
        else if (deadCodeItem) {
            this.iconPath = {
                light: path.join(__filename, "..", "..", "..", "resources", "light", "method.svg"),
                dark: path.join(__filename, "..", "..", "..", "resources", "dark", "method.svg"),
            };
            this.description = `${deadCodeItem.type} (${deadCodeItem.confidence}% confidence)`;
            this.tooltip =
                deadCodeItem.details ||
                    `${deadCodeItem.type} '${deadCodeItem.name}' at line ${deadCodeItem.lineNumber}`;
            this.command = {
                title: "Open Dead Code",
                command: "deadCodeFinder.openDeadCode",
                arguments: [deadCodeItem],
            };
        }
        this.contextValue =
            type === DeadCodeTreeItemType.DEAD_CODE_ITEM ? "deadCodeItem" : "file";
    }
}
exports.DeadCodeTreeItem = DeadCodeTreeItem;
/**
 * Tree data provider for the dead code tree view
 */
class DeadCodeTreeProvider {
    _onDidChangeTreeData = new vscode.EventEmitter();
    onDidChangeTreeData = this._onDidChangeTreeData.event;
    _items = [];
    _treeItems = [];
    /**
     * Refresh the tree view
     */
    refresh(items = []) {
        logging_1.Logger.debug(`Refreshing DeadCodeTreeProvider with ${items.length} items`);
        this._items = items;
        this._treeItems = this.buildTreeItems(items);
        this._onDidChangeTreeData.fire(undefined);
    }
    /**
     * Get the tree item for a given element
     */
    getTreeItem(element) {
        return element;
    }
    /**
     * Get the children of a given element
     */
    getChildren(element) {
        if (!element) {
            return Promise.resolve(this._treeItems);
        }
        return Promise.resolve(element.children);
    }
    /**
     * Get all dead code items
     */
    getItems() {
        return this._items;
    }
    /**
     * Build tree items from dead code items
     */
    buildTreeItems(items) {
        // Group items by file
        const fileMap = new Map();
        for (const item of items) {
            const filePath = item.filePath;
            if (!fileMap.has(filePath)) {
                fileMap.set(filePath, []);
            }
            fileMap.get(filePath).push(item);
        }
        // Create tree items
        const result = [];
        fileMap.forEach((fileItems, filePath) => {
            // Create child items
            const children = [];
            // Sort items by line number
            fileItems.sort((a, b) => a.lineNumber - b.lineNumber);
            for (const item of fileItems) {
                children.push(new DeadCodeTreeItem(item.name, DeadCodeTreeItemType.DEAD_CODE_ITEM, item));
            }
            // Create parent file item
            const fileItem = new DeadCodeTreeItem(path.basename(filePath), DeadCodeTreeItemType.FILE, undefined, children);
            fileItem.description = path.dirname(filePath);
            result.push(fileItem);
        });
        // Sort files alphabetically
        result.sort((a, b) => a.label.localeCompare(b.label));
        return result;
    }
}
exports.DeadCodeTreeProvider = DeadCodeTreeProvider;
/**
 * Register the dead code tree view
 */
function registerDeadCodeTreeView(context) {
    const treeDataProvider = new DeadCodeTreeProvider();
    const treeView = vscode.window.createTreeView("deadCodeExplorer", {
        treeDataProvider,
        showCollapseAll: true,
    });
    context.subscriptions.push(treeView);
    return { treeDataProvider, treeView };
}


/***/ }),
/* 4 */
/***/ ((module) => {

module.exports = require("path");

/***/ }),
/* 5 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.registerAnalyzeCommand = registerAnalyzeCommand;
exports.analyzeWorkspace = analyzeWorkspace;
exports.analyzeFile = analyzeFile;
const vscode = __importStar(__webpack_require__(1));
const pythonAnalyzer_1 = __webpack_require__(6);
const logging_1 = __webpack_require__(2);
/**
 * Status bar item for showing analysis status
 */
let statusBarItem;
/**
 * Register the analyze command and status bar item
 */
function registerAnalyzeCommand(context, onAnalysisComplete) {
    // Create status bar item
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBarItem.text = "$(search) Find Dead Code";
    statusBarItem.command = "deadCodeFinder.analyze";
    statusBarItem.tooltip = "Find unused methods and functions in your code";
    context.subscriptions.push(statusBarItem);
    statusBarItem.show();
    // Register command for analyzing the workspace
    const analyzeCommand = vscode.commands.registerCommand("deadCodeFinder.analyze", async () => {
        await analyzeWorkspace(onAnalysisComplete);
    });
    context.subscriptions.push(analyzeCommand);
    // Register command for analyzing the current file
    const analyzeFileCommand = vscode.commands.registerCommand("deadCodeFinder.analyzeFile", async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage("No active file to analyze");
            return;
        }
        await analyzeFile(editor.document.uri.fsPath, onAnalysisComplete);
    });
    context.subscriptions.push(analyzeFileCommand);
}
/**
 * Analyze Python files in the workspace
 */
async function analyzeWorkspace(onAnalysisComplete) {
    try {
        logging_1.Logger.info("Starting workspace analysis");
        updateStatus("$(sync~spin) Analyzing workspace...");
        // Get Python files in workspace
        const pythonFiles = await pythonAnalyzer_1.PythonAnalyzer.getWorkspacePythonFiles();
        if (pythonFiles.length === 0) {
            vscode.window.showInformationMessage("No Python files found in workspace");
            updateStatus("$(search) Find Dead Code");
            return;
        }
        logging_1.Logger.debug(`Found ${pythonFiles.length} Python files to analyze`);
        await analyzePaths(pythonFiles, onAnalysisComplete);
    }
    catch (error) {
        logging_1.Logger.error("Error analyzing workspace", error);
        vscode.window.showErrorMessage(`Error analyzing workspace: ${error.message}`);
        updateStatus("$(search) Find Dead Code");
    }
}
/**
 * Analyze a specific Python file
 */
async function analyzeFile(filePath, onAnalysisComplete) {
    try {
        logging_1.Logger.info(`Starting analysis of file: ${filePath}`);
        updateStatus(`$(sync~spin) Analyzing ${filePath}...`);
        await analyzePaths([filePath], onAnalysisComplete);
    }
    catch (error) {
        logging_1.Logger.error(`Error analyzing file ${filePath}`, error);
        vscode.window.showErrorMessage(`Error analyzing file: ${error.message}`);
        updateStatus("$(search) Find Dead Code");
    }
}
/**
 * Analyze a list of paths for dead code
 */
async function analyzePaths(paths, onAnalysisComplete) {
    if (paths.length === 0) {
        vscode.window.showInformationMessage("No paths to analyze");
        updateStatus("$(search) Find Dead Code");
        return;
    }
    try {
        const analyzer = new pythonAnalyzer_1.PythonAnalyzer();
        const result = await analyzer.analyze(paths);
        if (!result.success) {
            if (result.errors.length > 0) {
                vscode.window.showErrorMessage(`Analysis failed: ${result.errors.join(", ")}`);
            }
            else {
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
        updateStatus(`$(alert) Found ${result.deadCodeItems.length} dead code items`);
        onAnalysisComplete(result.deadCodeItems);
    }
    catch (error) {
        logging_1.Logger.error("Error analyzing paths", error);
        vscode.window.showErrorMessage(`Error during analysis: ${error.message}`);
        updateStatus("$(search) Find Dead Code");
    }
}
/**
 * Update the status bar item text
 */
function updateStatus(text) {
    statusBarItem.text = text;
}


/***/ }),
/* 6 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PythonAnalyzer = void 0;
const vscode = __importStar(__webpack_require__(1));
const path = __importStar(__webpack_require__(4));
const vulture_1 = __webpack_require__(7);
const logging_1 = __webpack_require__(2);
/**
 * Python analyzer implementation using Vulture for dead code detection
 */
class PythonAnalyzer {
    /**
     * Get the language ID supported by this analyzer
     */
    getLanguageId() {
        return "python";
    }
    /**
     * Check if the analyzer dependencies are available
     */
    async isAvailable() {
        const installed = await (0, vulture_1.isVultureInstalled)();
        if (!installed) {
            const message = "Vulture is not installed or not found in any of the expected locations. Would you like to install it or configure a custom path?";
            const install = "Install";
            const manualInstall = "Manual Install";
            const configureCustomPath = "Configure Custom Path";
            const showInstructions = "Show Instructions";
            const cancel = "Cancel";
            const response = await vscode.window.showWarningMessage(message, install, manualInstall, configureCustomPath, showInstructions, cancel);
            if (response === install) {
                const success = await this.installDependencies();
                if (!success) {
                    vscode.window.showErrorMessage("Automatic installation failed. Please try installing manually or configure a custom path.");
                }
                // Recheck if Vulture is now installed
                return await (0, vulture_1.isVultureInstalled)();
            }
            else if (response === manualInstall) {
                // Open a terminal for manual installation
                const terminal = vscode.window.createTerminal("Vulture Installation");
                terminal.show();
                terminal.sendText("pip install vulture --user");
                vscode.window.showInformationMessage("After installation completes, please try analyzing again.");
                return false;
            }
            else if (response === configureCustomPath) {
                // Prompt user for a custom path
                const customPath = await vscode.window.showInputBox({
                    prompt: "Enter the path to your Vulture binary",
                    placeHolder: "e.g. ~/.local/bin/vulture",
                    validateInput: (value) => {
                        return value && value.trim() ? null : "Path cannot be empty";
                    },
                });
                if (customPath) {
                    // Save the custom path in settings
                    const config = vscode.workspace.getConfiguration("deadCodeFinder");
                    await config.update("vulturePath", customPath, vscode.ConfigurationTarget.Global);
                    vscode.window.showInformationMessage(`Custom Vulture path set to: ${customPath}`);
                    // Recheck if Vulture is now recognized
                    return await (0, vulture_1.isVultureInstalled)();
                }
                return false;
            }
            else if (response === showInstructions) {
                // Show a more detailed information message with instructions
                vscode.window.showInformationMessage("To use Vulture with this extension, you have several options:\n\n" +
                    "1. Install with pip: pip install vulture --user\n" +
                    "2. Install with uv: uv pip install vulture\n" +
                    "3. Use uvx if you have it installed\n" +
                    "4. Configure a custom path to your vulture binary in Settings > Dead Code Finder > Vulture Path\n\n" +
                    "After installation or configuration, try analyzing again.");
                return false;
            }
            return false;
        }
        return true;
    }
    /**
     * Install dependencies required by the analyzer
     */
    async installDependencies() {
        return (0, vulture_1.installVulture)();
    }
    /**
     * Analyze the given paths for dead code
     */
    async analyze(paths) {
        // Ensure vulture is installed
        if (!(await this.isAvailable())) {
            return {
                deadCodeItems: [],
                errors: [
                    "Vulture is not installed or not found. Please install it or configure a custom path to use the Python analyzer.",
                ],
                warnings: [],
                success: false,
            };
        }
        // Get configuration
        const config = vscode.workspace.getConfiguration("deadCodeFinder");
        const minConfidence = config.get("minConfidence", 60);
        // Run analysis
        return (0, vulture_1.runVultureAnalysis)(paths, minConfidence);
    }
    /**
     * Get the URI for navigating to a dead code item
     */
    getDeadCodeUri(item) {
        return vscode.Uri.file(item.filePath);
    }
    /**
     * Get the range for highlighting a dead code item
     */
    getDeadCodeRange(item) {
        // Vulture only provides the line number, so we use the full line
        const line = item.lineNumber - 1; // Convert to 0-based
        return new vscode.Range(line, 0, line, 0);
    }
    /**
     * Dispose of any resources
     */
    dispose() {
        // No resources to dispose
    }
    /**
     * Get workspace Python files
     */
    static async getWorkspacePythonFiles() {
        const pythonFiles = [];
        // Get all workspace folders
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            return pythonFiles;
        }
        // Get configuration for exclude patterns
        const config = vscode.workspace.getConfiguration("deadCodeFinder");
        const excludePatterns = config.get("excludePatterns", [
            "**/venv/**",
            "**/node_modules/**",
            "**/.*/**",
        ]);
        // Join exclude patterns for the findFiles exclude parameter
        const excludePattern = excludePatterns.length > 0 ? `{${excludePatterns.join(",")}}` : null;
        logging_1.Logger.debug(`Using exclude pattern: ${excludePattern}`);
        // Find Python files
        for (const folder of workspaceFolders) {
            try {
                const pattern = new vscode.RelativePattern(folder, "**/*.py");
                const files = await vscode.workspace.findFiles(pattern, excludePattern);
                // Convert to path strings
                for (const file of files) {
                    pythonFiles.push(file.fsPath);
                }
            }
            catch (error) {
                logging_1.Logger.error(`Error finding Python files in ${folder.name}`, error);
            }
        }
        return pythonFiles;
    }
    /**
     * Get Python files in the given folder
     */
    static async getPythonFilesInFolder(folderPath) {
        try {
            const folder = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(folderPath));
            if (!folder) {
                return [];
            }
            // Get configuration for exclude patterns
            const config = vscode.workspace.getConfiguration("deadCodeFinder");
            const excludePatterns = config.get("excludePatterns", [
                "**/venv/**",
                "**/node_modules/**",
                "**/.*/**",
            ]);
            // Join exclude patterns for the findFiles exclude parameter
            const excludePattern = excludePatterns.length > 0 ? `{${excludePatterns.join(",")}}` : null;
            const pattern = new vscode.RelativePattern(folder, path.join(path.relative(folder.uri.fsPath, folderPath), "**/*.py"));
            const files = await vscode.workspace.findFiles(pattern, excludePattern);
            return files.map((file) => file.fsPath);
        }
        catch (error) {
            logging_1.Logger.error(`Error finding Python files in ${folderPath}`, error);
            return [];
        }
    }
}
exports.PythonAnalyzer = PythonAnalyzer;


/***/ }),
/* 7 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.isVultureInstalled = isVultureInstalled;
exports.installVulture = installVulture;
exports.runVultureAnalysis = runVultureAnalysis;
exports.parseVultureOutput = parseVultureOutput;
const vscode = __importStar(__webpack_require__(1));
const fs = __importStar(__webpack_require__(8));
const process_1 = __webpack_require__(9);
const logging_1 = __webpack_require__(2);
/**
 * Pattern to match Vulture output lines
 * Example: path/to/file.py:42: unused function 'my_function' (60% confidence)
 */
const VULTURE_OUTPUT_PATTERN = /^(.+):(\d+): unused (.+) '(.+)' \((\d+)% confidence\)$/;
/**
 * Check if Vulture is installed
 */
async function isVultureInstalled() {
    try {
        // 1. Check via pip (current method)
        const pipResult = await (0, process_1.executePythonCommand)([
            "-m",
            "pip",
            "show",
            "vulture",
        ]);
        if (pipResult.code === 0) {
            logging_1.Logger.debug("Vulture found via pip");
            return true;
        }
        // 2. Check if vulture is directly available in PATH
        try {
            const directResult = await (0, process_1.executeCommand)("vulture", ["--version"]);
            if (directResult.code === 0) {
                logging_1.Logger.debug("Vulture found directly in PATH");
                return true;
            }
        }
        catch (error) {
            // Silently continue to other methods
        }
        // 3. Check for availability via uvx
        try {
            const uvxResult = await (0, process_1.executeCommand)("uvx", ["vulture", "--version"]);
            if (uvxResult.code === 0) {
                logging_1.Logger.debug("Vulture found via uvx");
                return true;
            }
        }
        catch (error) {
            // Silently continue to other methods
        }
        // 4. Check for custom binary path
        const config = vscode.workspace.getConfiguration("deadCodeFinder");
        const customBinaryPath = config.get("vulturePath");
        if (customBinaryPath && fs.existsSync(customBinaryPath)) {
            logging_1.Logger.debug(`Found custom Vulture binary at: ${customBinaryPath}`);
            return true;
        }
        logging_1.Logger.debug("Vulture not found by any method");
        return false;
    }
    catch (error) {
        logging_1.Logger.error("Error checking for Vulture", error);
        return false;
    }
}
/**
 * Install Vulture via pip
 */
async function installVulture() {
    try {
        logging_1.Logger.info("Installing Vulture...");
        // Show progress notification to the user
        return await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Installing Vulture...",
            cancellable: false,
        }, async (progress) => {
            progress.report({ increment: 0, message: "Starting installation..." });
            // Try with pip first
            let result = await (0, process_1.executePythonCommand)([
                "-m",
                "pip",
                "install",
                "vulture",
                "--user", // Add --user flag to avoid permission issues
            ]);
            // If pip fails, try with pip3
            if (result.code !== 0) {
                progress.report({
                    increment: 30,
                    message: "Trying alternate installation method...",
                });
                // Try with pip3 if pip fails
                result = await (0, process_1.executePythonCommand)([
                    "-m",
                    "pip3",
                    "install",
                    "vulture",
                    "--user",
                ]);
            }
            progress.report({
                increment: 70,
                message: "Verifying installation...",
            });
            // Verify installation was successful
            const verifyResult = await isVultureInstalled();
            if (result.code === 0 && verifyResult) {
                progress.report({ increment: 100, message: "Installation complete" });
                logging_1.Logger.info("Vulture installed successfully");
                vscode.window.showInformationMessage("Vulture installed successfully");
                return true;
            }
            else {
                logging_1.Logger.error(`Failed to install Vulture: ${result.stderr}`);
                // Show detailed error message with installation instructions
                vscode.window
                    .showErrorMessage("Failed to install Vulture automatically. Please try installing manually with 'pip install vulture' in your terminal.", "Open Terminal")
                    .then((selection) => {
                    if (selection === "Open Terminal") {
                        const terminal = vscode.window.createTerminal("Vulture Installation");
                        terminal.show();
                        terminal.sendText("pip install vulture --user");
                    }
                });
                return false;
            }
        });
    }
    catch (error) {
        logging_1.Logger.error("Error installing Vulture", error);
        vscode.window.showErrorMessage(`Error installing Vulture: ${error.message}. Please try installing manually with 'pip install vulture'.`);
        return false;
    }
}
/**
 * Determine the best way to run Vulture
 */
async function determineVultureMethod() {
    const config = vscode.workspace.getConfiguration("deadCodeFinder");
    const customBinaryPath = config.get("vulturePath");
    // 1. Check custom path first, if configured
    if (customBinaryPath && fs.existsSync(customBinaryPath)) {
        return { method: "custom", path: customBinaryPath };
    }
    // 2. Check pip
    try {
        const pipResult = await (0, process_1.executePythonCommand)([
            "-m",
            "pip",
            "show",
            "vulture",
        ]);
        if (pipResult.code === 0) {
            return { method: "pip" };
        }
    }
    catch (error) {
        // Silently continue to other methods
    }
    // 3. Check direct PATH access
    try {
        const directResult = await (0, process_1.executeCommand)("vulture", ["--version"]);
        if (directResult.code === 0) {
            return { method: "direct" };
        }
    }
    catch (error) {
        // Silently continue to other methods
    }
    // 4. Check uvx
    try {
        const uvxResult = await (0, process_1.executeCommand)("uvx", ["vulture", "--version"]);
        if (uvxResult.code === 0) {
            return { method: "uvx" };
        }
    }
    catch (error) {
        // Silently continue
    }
    // Default to pip method (which will fail if not available)
    return { method: "pip" };
}
/**
 * Run Vulture analysis on the given paths
 */
async function runVultureAnalysis(paths, minConfidence = 60) {
    const result = {
        deadCodeItems: [],
        errors: [],
        warnings: [],
        success: false,
    };
    try {
        // Get configuration
        const config = vscode.workspace.getConfiguration("deadCodeFinder");
        const whitelistFile = config.get("whitelistFile");
        // Determine how to run vulture
        const vultureMethod = await determineVultureMethod();
        logging_1.Logger.info(`Running Vulture using method: ${vultureMethod.method}`);
        let processResult;
        // Prepare args common to all methods
        const commonArgs = ["--min-confidence", minConfidence.toString()];
        // Add whitelist file if specified and exists
        if (whitelistFile && fs.existsSync(whitelistFile)) {
            commonArgs.push(whitelistFile);
        }
        // Add the paths to analyze
        const fullArgs = [...commonArgs, ...paths];
        // Run with the appropriate method
        switch (vultureMethod.method) {
            case "custom":
                logging_1.Logger.debug(`Running custom Vulture binary: ${vultureMethod.path} ${fullArgs.join(" ")}`);
                processResult = await (0, process_1.executeCommand)(vultureMethod.path, fullArgs);
                break;
            case "direct":
                logging_1.Logger.debug(`Running Vulture directly: vulture ${fullArgs.join(" ")}`);
                processResult = await (0, process_1.executeCommand)("vulture", fullArgs);
                break;
            case "uvx":
                logging_1.Logger.debug(`Running Vulture via uvx: uvx vulture ${fullArgs.join(" ")}`);
                processResult = await (0, process_1.executeCommand)("uvx", ["vulture", ...fullArgs]);
                break;
            case "pip":
            default:
                logging_1.Logger.debug(`Running Vulture as Python module: python -m vulture ${fullArgs.join(" ")}`);
                processResult = await (0, process_1.executePythonCommand)([
                    "-m",
                    "vulture",
                    ...fullArgs,
                ]);
                break;
        }
        // Check for errors
        if (processResult.code !== 0 && processResult.code !== 3) {
            // Code 3 means dead code was found, which is what we want
            result.errors.push(`Vulture exited with code ${processResult.code}`);
            if (processResult.stderr) {
                result.errors.push(processResult.stderr);
            }
            return result;
        }
        // Parse output
        result.deadCodeItems = parseVultureOutput(processResult);
        result.success = true;
        logging_1.Logger.info(`Vulture found ${result.deadCodeItems.length} dead code items`);
        return result;
    }
    catch (error) {
        const err = error;
        result.errors.push(err.message);
        logging_1.Logger.error("Error running Vulture analysis", err);
        return result;
    }
}
/**
 * Parse the output from Vulture into DeadCodeItem objects
 */
function parseVultureOutput(processResult) {
    const items = [];
    if (!processResult.stdout) {
        return items;
    }
    const lines = processResult.stdout.split("\n");
    for (const line of lines) {
        if (!line.trim()) {
            continue;
        }
        const match = line.match(VULTURE_OUTPUT_PATTERN);
        if (match) {
            const [_, filePath, lineNumber, type, name, confidence] = match;
            items.push({
                filePath: filePath,
                lineNumber: parseInt(lineNumber, 10),
                name: name,
                type: type,
                confidence: parseInt(confidence, 10),
                details: line,
            });
        }
        else {
            logging_1.Logger.debug(`Could not parse Vulture output line: ${line}`);
        }
    }
    return items;
}


/***/ }),
/* 8 */
/***/ ((module) => {

module.exports = require("fs");

/***/ }),
/* 9 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.executeCommand = executeCommand;
exports.isCommandAvailable = isCommandAvailable;
exports.executePythonCommand = executePythonCommand;
const cp = __importStar(__webpack_require__(10));
const vscode = __importStar(__webpack_require__(1));
/**
 * Execute a command as a child process
 * @param command The command to execute
 * @param args Arguments to pass to the command
 * @param options Options for executing the command
 * @returns Promise with the process result
 */
async function executeCommand(command, args, options = {}) {
    return new Promise((resolve) => {
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
async function isCommandAvailable(command) {
    try {
        const isWindows = process.platform === "win32";
        const testCommand = isWindows ? "where" : "which";
        const testArgs = isWindows ? [command] : [command];
        const result = await executeCommand(testCommand, testArgs);
        return result.code === 0;
    }
    catch (error) {
        return false;
    }
}
/**
 * Execute a Python command (handling Python executable selection)
 * @param args Arguments to pass to the Python interpreter
 * @param options Options for executing the command
 * @returns Promise with the process result
 */
async function executePythonCommand(args, options = {}) {
    // Try to get python path from VS Code Python extension
    const pythonConfig = vscode.workspace.getConfiguration("python");
    let pythonPath = pythonConfig.get("defaultInterpreterPath") || "python";
    // Try multiple Python paths in sequence if the first one fails
    // Start with most common paths that should work for most users
    const pythonPaths = [
        // VS Code configured Python (most reliable if set)
        pythonPath,
        // Standard system commands (should work for most users)
        "python",
        "python3",
        // Common system paths
        "/usr/bin/python3",
        "/usr/bin/python",
        "/usr/local/bin/python3",
        "/usr/local/bin/python",
    ];
    // Add platform-specific paths
    if (process.platform === "win32") {
        // Windows Python installations
        pythonPaths.push("C:\\Python39\\python.exe", "C:\\Python310\\python.exe", "C:\\Python311\\python.exe");
    }
    else if (process.platform === "darwin") {
        // macOS homebrew and other common paths
        pythonPaths.push("/opt/homebrew/bin/python3", "/opt/local/bin/python3");
    }
    // Add virtual env paths - used by all Python version managers
    if (process.env.VIRTUAL_ENV) {
        // If a virtual environment is active, prioritize its Python
        pythonPaths.unshift(`${process.env.VIRTUAL_ENV}/bin/python`, `${process.env.VIRTUAL_ENV}/Scripts/python.exe` // For Windows
        );
    }
    // Try each Python executable in sequence
    for (const path of pythonPaths) {
        try {
            const result = await executeCommand(path, args, options);
            // If successful or has any output (even with errors), return the result
            if (result.code === 0 || result.code === 3 || result.stdout.length > 0) {
                // Remember this path for future calls if it's valid
                if (path.startsWith("/") ||
                    path.startsWith("C:\\") ||
                    !path.includes("/")) {
                    try {
                        pythonConfig.update("defaultInterpreterPath", path, vscode.ConfigurationTarget.Global);
                    }
                    catch (error) {
                        // Ignore errors updating config
                    }
                }
                return result;
            }
        }
        catch (error) {
            // Continue to the next path
        }
    }
    // Add version managers only as a last resort
    if (process.env.HOME) {
        // Common version manager paths
        const versionManagerPaths = [];
        // pyenv
        if (process.platform !== "win32") {
            versionManagerPaths.push(`${process.env.HOME}/.pyenv/shims/python`, `${process.env.HOME}/.pyenv/shims/python3`);
        }
        // Try version manager paths
        for (const path of versionManagerPaths) {
            try {
                const result = await executeCommand(path, args, options);
                if (result.code === 0 ||
                    result.code === 3 ||
                    result.stdout.length > 0) {
                    try {
                        pythonConfig.update("defaultInterpreterPath", path, vscode.ConfigurationTarget.Global);
                    }
                    catch (error) {
                        // Ignore errors updating config
                    }
                    return result;
                }
            }
            catch (error) {
                // Continue to the next path
            }
        }
    }
    // If all paths failed, return a more descriptive error
    return {
        stdout: "",
        stderr: `Failed to execute Python command. Could not find a working Python interpreter with required packages.`,
        code: null,
    };
}


/***/ }),
/* 10 */
/***/ ((module) => {

module.exports = require("child_process");

/***/ }),
/* 11 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.registerNavigationCommands = registerNavigationCommands;
const vscode = __importStar(__webpack_require__(1));
const logging_1 = __webpack_require__(2);
/**
 * Register commands for navigating to dead code
 */
function registerNavigationCommands(context) {
    // Register command to open a dead code item
    const openDeadCodeCommand = vscode.commands.registerCommand("deadCodeFinder.openDeadCode", async (item) => {
        await openDeadCode(item);
    });
    context.subscriptions.push(openDeadCodeCommand);
    // Register command to open settings
    const openSettingsCommand = vscode.commands.registerCommand("deadCodeFinder.openSettings", async () => {
        await openSettings();
    });
    context.subscriptions.push(openSettingsCommand);
}
/**
 * Open a document at the line containing dead code
 */
async function openDeadCode(item) {
    try {
        logging_1.Logger.info(`Opening file at line ${item.lineNumber}: ${item.filePath}`);
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
    }
    catch (error) {
        logging_1.Logger.error(`Error opening dead code location`, error);
        vscode.window.showErrorMessage(`Error opening file: ${error.message}`);
    }
}
/**
 * Open extension settings
 */
async function openSettings() {
    logging_1.Logger.info("Opening Dead Code Finder settings");
    await vscode.commands.executeCommand("workbench.action.openSettings", "deadCodeFinder");
}


/***/ }),
/* 12 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.registerWhitelistCommands = registerWhitelistCommands;
const vscode = __importStar(__webpack_require__(1));
const whitelist_1 = __webpack_require__(13);
const logging_1 = __webpack_require__(2);
/**
 * Register whitelist commands
 */
function registerWhitelistCommands(context, getDeadCodeItems) {
    // Command to generate a whitelist from current results
    const generateWhitelistCommand = vscode.commands.registerCommand("deadCodeFinder.generateWhitelist", async () => {
        await generateWhitelistFromResults(getDeadCodeItems);
    });
    context.subscriptions.push(generateWhitelistCommand);
    // Command to whitelist a specific item
    const whitelistItemCommand = vscode.commands.registerCommand("deadCodeFinder.whitelistItem", async (item) => {
        await whitelistSingleItem(item);
    });
    context.subscriptions.push(whitelistItemCommand);
}
/**
 * Generate a whitelist file from current dead code results
 */
async function generateWhitelistFromResults(getDeadCodeItems) {
    try {
        const items = getDeadCodeItems();
        if (items.length === 0) {
            vscode.window.showInformationMessage("No dead code items to whitelist. Run an analysis first.");
            return;
        }
        logging_1.Logger.info(`Generating whitelist for ${items.length} items`);
        await (0, whitelist_1.generateWhitelist)(items);
    }
    catch (error) {
        logging_1.Logger.error("Error generating whitelist", error);
        vscode.window.showErrorMessage(`Error generating whitelist: ${error.message}`);
    }
}
/**
 * Add a single item to the whitelist
 */
async function whitelistSingleItem(item) {
    try {
        logging_1.Logger.info(`Whitelisting item: ${item.name}`);
        await (0, whitelist_1.generateWhitelist)([item]);
    }
    catch (error) {
        logging_1.Logger.error(`Error whitelisting item: ${item.name}`, error);
        vscode.window.showErrorMessage(`Error whitelisting item: ${error.message}`);
    }
}


/***/ }),
/* 13 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DEFAULT_WHITELIST_FILENAME = void 0;
exports.generateWhitelistEntry = generateWhitelistEntry;
exports.generateWhitelist = generateWhitelist;
const vscode = __importStar(__webpack_require__(1));
const fs = __importStar(__webpack_require__(8));
const path = __importStar(__webpack_require__(4));
const logging_1 = __webpack_require__(2);
/**
 * Default whitelist file name
 */
exports.DEFAULT_WHITELIST_FILENAME = "whitelist.py";
/**
 * Generate a whitelist entry for a dead code item
 */
function generateWhitelistEntry(item) {
    // Extract module path from file path
    const filePath = item.filePath;
    const fileExt = path.extname(filePath);
    const modulePath = filePath
        .substring(0, filePath.length - fileExt.length)
        .replace(/[\/\\]/g, ".");
    // Generate import statement and whitelist line
    return `from ${modulePath} import ${item.name}\n${item.name}\n`;
}
/**
 * Generate a whitelist file for a list of dead code items
 */
async function generateWhitelist(items, targetPath) {
    try {
        // Determine whitelist file path
        const config = vscode.workspace.getConfiguration("deadCodeFinder");
        const whitelistPath = targetPath || config.get("whitelistFile");
        if (!whitelistPath) {
            // If no path specified, ask the user for a location
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders) {
                vscode.window.showErrorMessage("No workspace folder open");
                return undefined;
            }
            const defaultUri = vscode.Uri.file(path.join(workspaceFolders[0].uri.fsPath, exports.DEFAULT_WHITELIST_FILENAME));
            const uri = await vscode.window.showSaveDialog({
                defaultUri,
                filters: {
                    "Python Files": ["py"],
                },
                title: "Save Whitelist File",
            });
            if (!uri) {
                return undefined;
            }
            return generateWhitelistFile(items, uri.fsPath);
        }
        return generateWhitelistFile(items, whitelistPath);
    }
    catch (error) {
        logging_1.Logger.error("Error generating whitelist", error);
        vscode.window.showErrorMessage(`Error generating whitelist: ${error.message}`);
        return undefined;
    }
}
/**
 * Generate the actual whitelist file content and write to disk
 */
async function generateWhitelistFile(items, filePath) {
    try {
        // Generate whitelist content
        let content = "# Whitelist for Vulture\n";
        content += "# Generated by Dead Code Finder VSCode extension\n\n";
        // Add each item to the whitelist
        const uniqueItems = new Map();
        for (const item of items) {
            uniqueItems.set(item.name, item);
        }
        for (const item of uniqueItems.values()) {
            content += generateWhitelistEntry(item);
        }
        // Write to file
        fs.writeFileSync(filePath, content, "utf8");
        logging_1.Logger.info(`Generated whitelist at ${filePath}`);
        vscode.window.showInformationMessage(`Whitelist generated at ${filePath}`);
        return filePath;
    }
    catch (error) {
        logging_1.Logger.error(`Error writing whitelist to ${filePath}`, error);
        throw error;
    }
}


/***/ }),
/* 14 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.initDiagnosticsProvider = initDiagnosticsProvider;
exports.updateDiagnostics = updateDiagnostics;
exports.clearDiagnostics = clearDiagnostics;
const vscode = __importStar(__webpack_require__(1));
const logging_1 = __webpack_require__(2);
/**
 * Diagnostics collection for dead code warnings
 */
let diagnosticsCollection;
/**
 * Initialize the diagnostics provider
 */
function initDiagnosticsProvider(context) {
    // Create diagnostics collection
    diagnosticsCollection =
        vscode.languages.createDiagnosticCollection("deadCodeFinder");
    context.subscriptions.push(diagnosticsCollection);
    logging_1.Logger.debug("Diagnostics provider initialized");
}
/**
 * Update diagnostics for dead code items
 */
function updateDiagnostics(items) {
    // Clear existing diagnostics
    diagnosticsCollection.clear();
    // Group by file
    const fileMap = new Map();
    for (const item of items) {
        if (!fileMap.has(item.filePath)) {
            fileMap.set(item.filePath, []);
        }
        fileMap.get(item.filePath).push(item);
    }
    // Create diagnostics for each file
    fileMap.forEach((fileItems, filePath) => {
        const diagnostics = [];
        for (const item of fileItems) {
            const lineNumber = Math.max(0, item.lineNumber - 1); // Convert to 0-based
            const range = new vscode.Range(lineNumber, 0, lineNumber, Number.MAX_SAFE_INTEGER);
            // Create diagnostic with appropriate severity based on confidence
            const diagnostic = new vscode.Diagnostic(range, `Unused ${item.type}: '${item.name}' (${item.confidence}% confidence)`, getDiagnosticSeverity(item.confidence));
            // Add code and source
            diagnostic.code = "dead-code";
            diagnostic.source = "Dead Code Finder";
            // Add related information if available
            if (item.details) {
                diagnostic.relatedInformation = [
                    new vscode.DiagnosticRelatedInformation(new vscode.Location(vscode.Uri.file(item.filePath), range), item.details),
                ];
            }
            diagnostics.push(diagnostic);
        }
        // Add diagnostics to collection
        diagnosticsCollection.set(vscode.Uri.file(filePath), diagnostics);
    });
    logging_1.Logger.debug(`Updated diagnostics for ${items.length} items across ${fileMap.size} files`);
}
/**
 * Clear all diagnostics
 */
function clearDiagnostics() {
    diagnosticsCollection.clear();
    logging_1.Logger.debug("Cleared all diagnostics");
}
/**
 * Get diagnostic severity based on confidence level
 */
function getDiagnosticSeverity(confidence) {
    if (confidence >= 90) {
        return vscode.DiagnosticSeverity.Warning;
    }
    else if (confidence >= 70) {
        return vscode.DiagnosticSeverity.Information;
    }
    else {
        return vscode.DiagnosticSeverity.Hint;
    }
}


/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(0);
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;
//# sourceMappingURL=extension.js.map