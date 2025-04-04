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
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
function activate(context) {
    // Initialize logger
    logging_1.Logger.initialize(context);
    logging_1.Logger.info("Activating Dead Code Finder extension");
    // Register the tree view for displaying dead code results
    const { treeDataProvider } = (0, deadCodeView_1.registerDeadCodeTreeView)(context);
    // Register commands for analyzing code
    (0, analyze_1.registerAnalyzeCommand)(context, (items) => {
        // Update tree view with results
        treeDataProvider.refresh(items);
    });
    // Register navigation commands
    (0, navigation_1.registerNavigationCommands)(context);
    // Set up file save listener for auto-analysis
    const configWatcher = vscode.workspace.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration("deadCodeFinder")) {
            // Update logger level based on configuration
            const config = vscode.workspace.getConfiguration("deadCodeFinder");
            const logLevel = config.get("logLevel", "info");
            logging_1.Logger.info(`Configuration changed, updating log level to ${logLevel}`);
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
            this.description = "";
        }
        else if (deadCodeItem) {
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
            const message = "Vulture is not installed. Would you like to install it?";
            const install = "Install";
            const response = await vscode.window.showWarningMessage(message, install);
            if (response === install) {
                return this.installDependencies();
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
                    "Vulture is not installed. Please install it to use the Python analyzer.",
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
        // Find Python files
        for (const folder of workspaceFolders) {
            try {
                const pattern = new vscode.RelativePattern(folder, "**/*.py");
                const files = await vscode.workspace.findFiles(pattern, "**/node_modules/**");
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
            const pattern = new vscode.RelativePattern(folder, path.join(path.relative(folder.uri.fsPath, folderPath), "**/*.py"));
            const files = await vscode.workspace.findFiles(pattern, "**/node_modules/**");
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
        const result = await (0, process_1.executePythonCommand)(["-m", "pip", "show", "vulture"]);
        return result.code === 0;
    }
    catch (error) {
        return false;
    }
}
/**
 * Install Vulture via pip
 */
async function installVulture() {
    try {
        logging_1.Logger.info("Installing Vulture...");
        const result = await (0, process_1.executePythonCommand)([
            "-m",
            "pip",
            "install",
            "vulture",
        ]);
        if (result.code === 0) {
            logging_1.Logger.info("Vulture installed successfully");
            return true;
        }
        else {
            logging_1.Logger.error(`Failed to install Vulture: ${result.stderr}`);
            return false;
        }
    }
    catch (error) {
        logging_1.Logger.error("Error installing Vulture", error);
        return false;
    }
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
        // Prepare vulture command
        const args = [
            "-m",
            "vulture",
            "--min-confidence",
            minConfidence.toString(),
            ...paths,
        ];
        // Get whitelist file if specified
        const config = vscode.workspace.getConfiguration("deadCodeFinder");
        const whitelistFile = config.get("whitelistFile");
        if (whitelistFile && fs.existsSync(whitelistFile)) {
            args.push(whitelistFile);
        }
        // Run vulture
        logging_1.Logger.debug(`Running Vulture with args: ${args.join(" ")}`);
        const processResult = await (0, process_1.executePythonCommand)(args);
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
    const pythonPath = pythonConfig.get("defaultInterpreterPath") || "python";
    return executeCommand(pythonPath, args, options);
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
exports.openDeadCode = openDeadCode;
const vscode = __importStar(__webpack_require__(1));
const pythonAnalyzer_1 = __webpack_require__(6);
const logging_1 = __webpack_require__(2);
/**
 * Register navigation commands for dead code
 */
function registerNavigationCommands(context) {
    // Command to open a dead code item
    const openDeadCodeCommand = vscode.commands.registerCommand("deadCodeFinder.openDeadCode", async (item) => {
        await openDeadCode(item);
    });
    context.subscriptions.push(openDeadCodeCommand);
}
/**
 * Open a dead code item in the editor
 */
async function openDeadCode(item) {
    try {
        logging_1.Logger.debug(`Opening dead code: ${item.name} in ${item.filePath}:${item.lineNumber}`);
        // Get analyzer for this item's language (currently only Python supported)
        const analyzer = new pythonAnalyzer_1.PythonAnalyzer();
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
    }
    catch (error) {
        logging_1.Logger.error(`Error opening dead code: ${item.name}`, error);
        vscode.window.showErrorMessage(`Error opening dead code: ${error.message}`);
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