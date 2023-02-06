// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as chokidar from "chokidar";
import { IndentationText } from "ts-morph";
import * as vscode from "vscode";

import { extractFunction } from "./extract-function";
import { extractRefactorTypes } from "./extract-function/constants";
import { TSMorphWatcher } from "./extract-function/file-watcher";

import type { TExtractRefactorTypes } from "./extract-function/constants";

export async function activate(context: vscode.ExtensionContext) {
  const initialArgs = pluckMandatorVsCodeAttrsOrThrow(vscode);
  const chokidarWatcher = chokidar.watch("file, dir, glob, or array", {
    cwd: initialArgs.pwd,
    ignored: [/(^|[/\\])\../, (path) => path.includes("node_modules")],
    // ignore dotfiles
    persistent: true,
  });
  console.log("Building watcher server binding...");
  const watcher = new TSMorphWatcher(
    {
      manipulationSettings: {
        indentationText: IndentationText.TwoSpaces,
        useTrailingCommas: true,
      },
      tsConfigFilePath: `${initialArgs.pwd}/tsconfig.json`,
    },
    chokidarWatcher
  );
  console.log("Getting available project from watcher...");
  let project = await watcher.getNext();
  console.log("Project ready...");
  const disposable = vscode.commands.registerCommand(
    "seso-refactors.helloWorld",
    async () => {
      project = await watcher.getNext();
      const { cursorPosition, focusedFilePath, pwd } =
        pluckMandatorVsCodeAttrsOrThrow(vscode);
      try {
        const placeHolder = buildDestinationDomainPathSuggested({
          cwf: focusedFilePath,
          refactorType: extractRefactorTypes.DOMAIN_SERVICE,
        });
        const proposedTypeReferenceChain = (await vscode.window.showInputBox({
          ignoreFocusOut: true,
          prompt:
            "Provide the complete runtimeContext path for your new provider",
          title: "The $r path",
          value: placeHolder,
        })) as string;

        if (!proposedTypeReferenceChain) {
          throw new Error("Bad type reference chain");
        }
        await extractFunction({
          alphaDomain: "ddd",
          cursorPosition,
          filePath: focusedFilePath,
          project,
          providerIdentifierPath: proposedTypeReferenceChain
            .split("$r")
            .pop()
            .split(".")
            .filter(Boolean)
            .join("."),
          pwd,
        });
        await vscode.window.showInformationMessage(`Done.`);
      } catch (error) {
        console.error("REFACTOR CRASH");
        console.error(error);
      } finally {
        console.error("REFACTOR FINALLY BLOCK");
        console.log("Done");
        console.timeEnd();
      }
    }
  );
  context.subscriptions.push(disposable);
}

export function buildDestinationDomainPathSuggested(p: {
  cwf: string;
  refactorType: TExtractRefactorTypes;
}) {
  const betaAndGammaDomainStr = (() => {
    const p1 = String(p.cwf.split("ddd").pop());
    if (p1.includes("/application/")) {
      return p1.split("/application/").shift().split("/").join("."); // looks like: Shared/Media
    }
    if (p1.includes("/domain/")) {
      return p1.split("/domain/").shift().split("/").join("."); // looks like: Shared/Media
    }
    if (p1.includes("/infrastructure/")) {
      return p1.split("/infrastructure/").shift().split("/").join("."); // looks like: Shared/Media
    }
  })();

  switch (p.refactorType) {
    case extractRefactorTypes.APPLICATION_EVENTLISTENER:
      return `$r${betaAndGammaDomainStr}.application.eventListener.`;
    case extractRefactorTypes.APPLICATION_USECASE:
      return `$r${betaAndGammaDomainStr}.application.useCase.`;
    case extractRefactorTypes.APPLICATION_SERVICE:
      return `$r${betaAndGammaDomainStr}.application.service`;
    case extractRefactorTypes.DOMAIN_ENTITY:
      return `$r${betaAndGammaDomainStr}.domain.entity.__DOESNT_WORK_GOOD`;
    case extractRefactorTypes.DOMAIN_SERVICE:
      return `$r${betaAndGammaDomainStr}.domain.service.`;
    case extractRefactorTypes.DOMAIN_VALUEOBJECT:
      return `$r${betaAndGammaDomainStr}.domain.valueObject.__DOESNT_WORK_GOOD`;
    case extractRefactorTypes.INFRASTRUCTURE_SERVICE:
      return `$r${betaAndGammaDomainStr}.infrastructure.service.`;
    default:
      throw new Error("Something went wrong");
  }
}
function pluckMandatorVsCodeAttrsOrThrow(vscodeLibRef: typeof vscode) {
  const workspaceFolders = vscodeLibRef?.workspace?.workspaceFolders;
  const activeTextEditor = vscodeLibRef.window.activeTextEditor;
  if (!activeTextEditor) {
    throw new Error("No active editor");
  }
  const selection = activeTextEditor.selection;
  const focusedFilePath = activeTextEditor.document.fileName;
  const selectionStart = selection.start;
  const document = activeTextEditor.document;
  const cursorPosition = document.offsetAt(selectionStart);
  if (!workspaceFolders) {
    throw new Error("Bad workspaceFolders");
  }
  if (!activeTextEditor) {
    throw new Error("Bad activeTextEditor");
  }

  return {
    cursorPosition,
    focusedFilePath,
    pwd: workspaceFolders[0].uri.path,
  };
}
// This method is called when your extension is deactivated
export function deactivate() {
  // watcher.dispose();
}
