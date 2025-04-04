import * as vscode from "vscode";
import { DeadCodeItem } from "../analyzers/analyzer";
import { generateWhitelist } from "../analyzers/python/whitelist";
import { Logger } from "../utils/logging";

/**
 * Register whitelist commands
 */
export function registerWhitelistCommands(
  context: vscode.ExtensionContext,
  getDeadCodeItems: () => DeadCodeItem[]
): void {
  // Command to generate a whitelist from current results
  const generateWhitelistCommand = vscode.commands.registerCommand(
    "deadCodeFinder.generateWhitelist",
    async () => {
      await generateWhitelistFromResults(getDeadCodeItems);
    }
  );
  context.subscriptions.push(generateWhitelistCommand);

  // Command to whitelist a specific item
  const whitelistItemCommand = vscode.commands.registerCommand(
    "deadCodeFinder.whitelistItem",
    async (item: DeadCodeItem) => {
      await whitelistSingleItem(item);
    }
  );
  context.subscriptions.push(whitelistItemCommand);
}

/**
 * Generate a whitelist file from current dead code results
 */
async function generateWhitelistFromResults(
  getDeadCodeItems: () => DeadCodeItem[]
): Promise<void> {
  try {
    const items = getDeadCodeItems();

    if (items.length === 0) {
      vscode.window.showInformationMessage(
        "No dead code items to whitelist. Run an analysis first."
      );
      return;
    }

    Logger.info(`Generating whitelist for ${items.length} items`);
    await generateWhitelist(items);
  } catch (error) {
    Logger.error("Error generating whitelist", error as Error);
    vscode.window.showErrorMessage(
      `Error generating whitelist: ${(error as Error).message}`
    );
  }
}

/**
 * Add a single item to the whitelist
 */
async function whitelistSingleItem(item: DeadCodeItem): Promise<void> {
  try {
    Logger.info(`Whitelisting item: ${item.name}`);
    await generateWhitelist([item]);
  } catch (error) {
    Logger.error(`Error whitelisting item: ${item.name}`, error as Error);
    vscode.window.showErrorMessage(
      `Error whitelisting item: ${(error as Error).message}`
    );
  }
}
