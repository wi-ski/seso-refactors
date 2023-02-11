// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

import * as generateProvidersAndBarrelExports from "./generate-provider-and-barrel-exports";

const PREFIX = `seso-refactors`;
const bundles = Object.entries(
  generateProvidersAndBarrelExports.commandNamesToHandlers
);

export async function activate(context: vscode.ExtensionContext) {
  console.log("Activating...");
  console.log(bundles);
  bundles.map(([refactorName, refactorHandler]) => {
    const command = [PREFIX, refactorName].join(".");
    console.log("Registering...");
    console.log(command);
    const disposable = vscode.commands.registerCommand(
      command, // Looks like: `seso-refactors.generateFoo`
      () => refactorHandler(vscode)
    );
    context.subscriptions.push(disposable);
  });
}
export function deactivate() {
  // This method is called when your extension is deactivated
}
