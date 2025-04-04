import * as vscode from "vscode";
import * as path from "path";
import { DeadCodeItem } from "../analyzers/analyzer";
import { Logger } from "../utils/logging";

/**
 * Tree item types for the dead code tree view
 */
export enum DeadCodeTreeItemType {
  FILE,
  DEAD_CODE_ITEM,
}

/**
 * Tree item representing a file or dead code item in the tree view
 */
export class DeadCodeTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly type: DeadCodeTreeItemType,
    public readonly deadCodeItem?: DeadCodeItem,
    public readonly children: DeadCodeTreeItem[] = []
  ) {
    super(
      label,
      type === DeadCodeTreeItemType.FILE
        ? vscode.TreeItemCollapsibleState.Expanded
        : vscode.TreeItemCollapsibleState.None
    );

    // Set properties based on type
    if (type === DeadCodeTreeItemType.FILE) {
      this.description = "";
    } else if (deadCodeItem) {
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

/**
 * Tree data provider for the dead code tree view
 */
export class DeadCodeTreeProvider
  implements vscode.TreeDataProvider<DeadCodeTreeItem>
{
  private _onDidChangeTreeData: vscode.EventEmitter<
    DeadCodeTreeItem | undefined
  > = new vscode.EventEmitter<DeadCodeTreeItem | undefined>();
  readonly onDidChangeTreeData: vscode.Event<DeadCodeTreeItem | undefined> =
    this._onDidChangeTreeData.event;

  private _items: DeadCodeItem[] = [];
  private _treeItems: DeadCodeTreeItem[] = [];

  /**
   * Refresh the tree view
   */
  public refresh(items: DeadCodeItem[] = []): void {
    Logger.debug(`Refreshing DeadCodeTreeProvider with ${items.length} items`);
    this._items = items;
    this._treeItems = this.buildTreeItems(items);
    this._onDidChangeTreeData.fire(undefined);
  }

  /**
   * Get the tree item for a given element
   */
  public getTreeItem(element: DeadCodeTreeItem): vscode.TreeItem {
    return element;
  }

  /**
   * Get the children of a given element
   */
  public getChildren(element?: DeadCodeTreeItem): Thenable<DeadCodeTreeItem[]> {
    if (!element) {
      return Promise.resolve(this._treeItems);
    }
    return Promise.resolve(element.children);
  }

  /**
   * Get all dead code items
   */
  public getItems(): DeadCodeItem[] {
    return this._items;
  }

  /**
   * Build tree items from dead code items
   */
  private buildTreeItems(items: DeadCodeItem[]): DeadCodeTreeItem[] {
    // Group items by file
    const fileMap = new Map<string, DeadCodeItem[]>();

    for (const item of items) {
      const filePath = item.filePath;
      if (!fileMap.has(filePath)) {
        fileMap.set(filePath, []);
      }
      fileMap.get(filePath)!.push(item);
    }

    // Create tree items
    const result: DeadCodeTreeItem[] = [];

    fileMap.forEach((fileItems, filePath) => {
      // Create child items
      const children: DeadCodeTreeItem[] = [];

      // Sort items by line number
      fileItems.sort((a, b) => a.lineNumber - b.lineNumber);

      for (const item of fileItems) {
        children.push(
          new DeadCodeTreeItem(
            item.name,
            DeadCodeTreeItemType.DEAD_CODE_ITEM,
            item
          )
        );
      }

      // Create parent file item
      const fileItem = new DeadCodeTreeItem(
        path.basename(filePath),
        DeadCodeTreeItemType.FILE,
        undefined,
        children
      );

      fileItem.description = path.dirname(filePath);
      result.push(fileItem);
    });

    // Sort files alphabetically
    result.sort((a, b) => a.label.localeCompare(b.label));

    return result;
  }
}

/**
 * Register the dead code tree view
 */
export function registerDeadCodeTreeView(context: vscode.ExtensionContext): {
  treeDataProvider: DeadCodeTreeProvider;
  treeView: vscode.TreeView<DeadCodeTreeItem>;
} {
  const treeDataProvider = new DeadCodeTreeProvider();
  const treeView = vscode.window.createTreeView("deadCodeExplorer", {
    treeDataProvider,
    showCollapseAll: true,
  });

  context.subscriptions.push(treeView);

  return { treeDataProvider, treeView };
}
