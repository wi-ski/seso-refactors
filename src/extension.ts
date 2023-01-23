// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { IndentationText, Project, SyntaxKind } from "ts-morph";
import * as vscode from "vscode";

import {
  buildArgsFromDomainTypePath,
  buildDestinationDomainPathSuggested,
} from "./helpers";

import type { TExtensionParamsBlob } from "./helpers";
import type {
  FormatCodeSettings,
  LanguageService,
  Node,
  SourceFile,
  UserPreferences,
} from "ts-morph";

const pluckMandatorVsCodeAttrsOrThrow = (vscodeLibRef: typeof vscode) => {
  const workspaceFolders = vscodeLibRef?.workspace?.workspaceFolders;
  const activeTextEditor = vscodeLibRef.window.activeTextEditor;
  if (!workspaceFolders) {
    throw new Error("Bad workspaceFolders");
  }
  if (!activeTextEditor) {
    throw new Error("Bad activeTextEditor");
  }

  return {
    pwd: workspaceFolders[0].uri.path,
  };
};
const getDescendantAtPosOrThrow = (sf: SourceFile, pos: number) => {
  const n = sf.getDescendantAtPos(pos);
  if (n) return n;
  throw new Error("Could not find childAtPos");
};

const formatFilePretty = (
  sf: SourceFile,
  formSettings: FormatCodeSettings,
  uprefs: UserPreferences
) => {
  sf.fixUnusedIdentifiers(formSettings, uprefs);
  sf.fixMissingImports(formSettings, uprefs);
  sf.organizeImports(formSettings, uprefs);
  // Todo: Somehow trigger editor file formatting
  sf.formatText(formSettings);
};
const tsesoPrefix = "TSeso.TD.";
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
const getTypesSingleDefintionNodeAndSourceFileOrThrow = (
  ls: LanguageService,
  n: Node
): {
  node: Node;
  sourceFile: SourceFile;
  symbolNameAtDefintion: string;
} => {
  console.log(
    `DOING - getTypesSingleDefintionNodeAndSourceFileOrThrow for: ${n.getText()}. File: ${n
      .getSourceFile()
      .getFilePath()}`
  );
  console.timeLog();

  const defintions = ls.getDefinitions(n).map((nn) => ({
    node: nn.getNode(),
    sourceFile: nn.getSourceFile(),
    symbolNameAtDefintion: nn.getNode().getSymbolOrThrow().getName(),
  }));
  if (defintions.length > 1) {
    throw new Error(
      `Found more than one defintion, files: ${defintions
        .map((d) => d.sourceFile.getSourceFile().getFilePath())
        .join(",")}`
    );
  }
  const d = defintions.pop();
  if (!d) {
    throw new Error("Didn't find a defintion node");
  }
  const symbolNameAtDefintion = d.symbolNameAtDefintion;
  console.log(
    `DONE - getTypesSingleDefintionNodeAndSourceFileOrThrow for: ${n.getText()}. File: ${n
      .getSourceFile()
      .getFilePath()}`
  );
  console.log(`symbolNameAtDefintion: ${symbolNameAtDefintion}`);
  console.timeLog();
  return d;
};
type TTask = () => Promise<any>;
type TTaskQueue = TTask[];

export async function activate(context: vscode.ExtensionContext) {
  let taskQueue: TTaskQueue = [];
  let taskLock = 0;
  async function clearJobTaskQueueAndReset() {
    taskLock = 1;
    try {
      for (let taskIds = 0; taskIds < taskQueue.length; taskIds++) {
        const t = taskQueue[taskIds];
        await t();
      }
    } catch (error) {
      console.error(error);
    } finally {
      taskQueue = [];
      taskLock = 0;
    }
  }
  setInterval(async () => {
    if (taskLock) {
      console.log("Lock detected, exiting.");
      return;
    }
    console.log("Clearing file watch task queue");
    await clearJobTaskQueueAndReset();
  }, 1000);

  const { pwd } = pluckMandatorVsCodeAttrsOrThrow(vscode);

  // Activate.
  const project = new Project({
    manipulationSettings: {
      indentationText: IndentationText.TwoSpaces,
      useTrailingCommas: true,
    },
    tsConfigFilePath: `${pwd}/tsconfig.json`,
  });
  const dirs = project.getRootDirectories();
  const removeFileFromProject = (e: any) => {
    console.log("project.getSourceFileOrThrow(e.path).removeSourceFile()");
    console.log(e.path);
    const sf = project.getSourceFile(e.path);
    if (sf) {
      return taskQueue.push(async () => project.removeSourceFile(sf));
    }
    console.error(
      `(Ignoring file system event REMOVE) Attempted to remove untrack SourceFile: ${e.path}`
    );
  };
  const addFileToProject = (e: any) => {
    console.log("project.getSourceFileOrThrow(e.path).addSourceFileAtPath()");
    console.log(e.path);
    const sf = project.getSourceFile(e.path);
    if (sf) {
      return taskQueue.push(async () =>
        project.addSourceFileAtPathIfExists(e.path)
      );
    }
    console.error(
      `(Ignoring file system event ADD) Attempted to add untrack SourceFile: ${e.path}`
    );
  };
  const updateFileInProject = (e: any) => {
    console.log("project.getSourceFileOrThrow(e.path).refreshFromFileSystem()");
    console.log(e.path);
    const sf = project.getSourceFile(e.path);
    if (sf) {
      return taskQueue.push(async () =>
        project.getSourceFileOrThrow(e.path).refreshFromFileSystem()
      );
    }
    console.error(
      `(Ignoring file system event UPDATE) Attempted to update untrack SourceFile: ${e.path}`
    );
  };

  let watchers: vscode.FileSystemWatcher[] = [];

  const resetFileSystemWatchersToHandleKnownBugInVsCode = () => {
    // See: https://github.com/microsoft/vscode/issues/60813
    watchers.forEach((w) => w.dispose());
    watchers = dirs.map((d) => {
      const p = `${d.getPath()}/**/**.{ts,tsx}`;
      console.log(`watcher path: ${p}`);
      const w = vscode.workspace.createFileSystemWatcher(p);
      w.onDidChange(updateFileInProject);
      w.onDidDelete(removeFileFromProject);
      w.onDidCreate(addFileToProject);
      return w;
    });
  };
  resetFileSystemWatchersToHandleKnownBugInVsCode();
  const disposable = vscode.commands.registerCommand(
    "seso-refactors.helloWorld",
    async () => {
      console.time();
      // return vscode.window.withProgress(
      //   {
      //     location: vscode.ProgressLocation.Notification,
      //     title: "Doing Stuff...",
      //   },
      //   async (progress) => {
      //             progress.report(`${++done}/${total}`);
      //   }
      // );
      try {
        taskLock = 1;
        await clearJobTaskQueueAndReset();
        const formatCodeSettings =
          project.manipulationSettings.getFormatCodeSettings();
        const userPreferences =
          project.manipulationSettings.getUserPreferences();
        const languageService = project.getLanguageService();
        const activeTextEditor = vscode.window.activeTextEditor;
        if (!activeTextEditor) {
          throw new Error("No active editor");
        }
        const selection = activeTextEditor.selection;
        const filePath = activeTextEditor.document.fileName;
        const selectionStart = selection.start;
        const document = activeTextEditor.document;
        const offset = document.offsetAt(selectionStart);
        const sourceFile = project.getSourceFileOrThrow(filePath);
        const nodeAtCursor = getDescendantAtPosOrThrow(sourceFile, offset);
        // buildDestinationDomainPathSuggested
        console.log("nodeAtCursor.getText()");
        const focusedNodeText = nodeAtCursor.getText();
        const placeHolder = buildDestinationDomainPathSuggested({
          cwf: filePath,
          nodeText: focusedNodeText,
        });
        console.log({ filePath, focusedNodeText, placeHolder });
        const _proposedTypeReferenceChain = (await vscode.window.showInputBox({
          ignoreFocusOut: true,
          prompt: "Provide the complete domain path for your new provider",
          title: "TSeso.TD Domain Path",
          validateInput: (_v) => {
            const v = String(_v);
            const startsWithTSesoPrefix = v.startsWith(tsesoPrefix);
            const isNotTooDepp = v.split(".").length < 10;
            const endsRight =
              v.includes("Domain.ValueObject") ||
              v.includes("Domain.Entity") ||
              v.includes("Application.DTO") ||
              v.includes("Infrastructure.Schema");
            if (!startsWithTSesoPrefix) {
              return "Must start with TSeso.TD.";
            }
            if (!isNotTooDepp) {
              return "Path too deep.";
            }
            if (!endsRight) {
              return "Invalid path.";
            }
            const array = v.split(".");
            for (let index = 0; index < array.length; index++) {
              const element = array[index];
              const firstChar = String(element.split("")[0]);
              if (firstChar.toUpperCase() === firstChar) {
                continue;
              }
              return "All Domains Must Be Capitalized.";
            }
            return null;
          },
          value: placeHolder,
        })) as string;

        if (!_proposedTypeReferenceChain) {
          throw new Error("Bad type reference chain");
        }

        const constructedArgs = buildArgsFromDomainTypePath({
          proposedTypeReferenceChain: _proposedTypeReferenceChain,
          pwd,
        });

        const createTypeFilesIfNotExistOrAppendToExisting = (
          p: Project,
          domainShapeConf: TExtensionParamsBlob
        ) => {
          domainShapeConf.pathsToFileContent.forEach((pathToContentObj) => {
            console.log(
              `Attempting to instantiate file: ${pathToContentObj.path}`
            );
            console.timeLog();
            let sourceFileToProcess: SourceFile;
            try {
              // Explodes if existing
              sourceFileToProcess = p.createSourceFile(
                pathToContentObj.path,
                "",
                { overwrite: false }
              );
            } catch (e: any) {
              // Explodes if unhappy
              sourceFileToProcess = p.getSourceFileOrThrow(
                pathToContentObj.path
              );
            }
            pathToContentObj.content(sourceFileToProcess);
          });
        };

        // Note: This is the cursor's position in the file - the number ts-morph needs.
        console.log("DOING - getDescendantAtPosOrThrow(sourceFile, offset); ");
        console.timeLog();
        const targetNode = getDescendantAtPosOrThrow(sourceFile, offset);
        console.log({
          SELECTING: 1,
          offset,
          selectionStart,
          targetNode: targetNode.getText(),
        });
        const onlyDefintionNodeForSelectedNode =
          getTypesSingleDefintionNodeAndSourceFileOrThrow(
            languageService,
            targetNode
          );
        console.log({
          getFilePath:
            onlyDefintionNodeForSelectedNode.sourceFile.getFilePath(),
          onlyDefintionNodeForSelectedNode:
            onlyDefintionNodeForSelectedNode.node.getText(),
          symbolNameAtDefintion:
            onlyDefintionNodeForSelectedNode.symbolNameAtDefintion,
        });
        const args = {
          ...constructedArgs,
          definitionName: onlyDefintionNodeForSelectedNode.node
            .getSymbolOrThrow()
            .getName(),
          focusedFilePath: filePath,
          onlyDefintionNodeForSelectedNode,
          pwd,
          targetRefactoringSourceFile:
            onlyDefintionNodeForSelectedNode.sourceFile,
          trackedFiles: [] as SourceFile[],
        } as const;

        console.dir(
          {
            args,
          },
          { depth: 100 }
        );

        // Create domain files if not exist
        // Locate defintion node
        // Find declaration node
        //    -> Add declaration node to targetDestinationRefactorSourceFile
        //    -> Remove declaration node from targetRefactorSourceFile
        // Find all references to declaration node
        //    -> Remove import declarations (handled by removeUnusedImports)
        //    -> Replace not-chained references with TSeso.namespaced.thing
        //    -> Replace chained references with TSeso.namespaced.thing
        // Add TSeso import if not exist
        // Delete old imports

        createTypeFilesIfNotExistOrAppendToExisting(project, args);

        const initialNodeAtCursorPositionToFindDeclarationOf =
          sourceFile.getDescendantAtPos(offset);
        if (!initialNodeAtCursorPositionToFindDeclarationOf) {
          throw new Error("Bad initialNodeAtCursorPositionToFindDeclarationOf");
        }
        const defintions = languageService.getDefinitions(
          initialNodeAtCursorPositionToFindDeclarationOf
        );
        const declarationNodeForDefintion = defintions[0].getDeclarationNode();
        // Only handling if has single defintion currently.
        if (defintions.length > 1) {
          throw new Error("Bad declarationNodeForDefintion length");
        }
        if (!declarationNodeForDefintion) {
          throw new Error("Bad declarationNodeForDefintion");
        }

        const targetRefactorSourceFile =
          declarationNodeForDefintion.getSourceFile();
        const destinationRefactorSourceFile = project.getSourceFileOrThrow(
          args.domainNameZetaSuperRootTypeDefinitionFilePath
        );

        console.log("Crawling the tree...");
        console.timeLog();
        const referencesToDeclarationNodeToIterateAndMaybeReplace =
          languageService.findReferences(declarationNodeForDefintion);
        referencesToDeclarationNodeToIterateAndMaybeReplace.forEach(
          (declarationNodeReference) => {
            declarationNodeReference.getReferences().forEach((dd) => {
              const currentSourceFile = dd.getSourceFile();
              const n = dd.getNode();
              const parentNode = n.getParentOrThrow();
              // const parentOfFirstNodeKind = dd.getNode().getParentIfKind(SyntaxKind.FirstNode);
              // const nodeFilePath=n.getSourceFile().getFilePath();
              // const nodeKind=n.getKindName();
              // const nodeText=n.getText();
              // const nodePos=n.getPos();
              // const parentFilePath=parentNode.getSourceFile().getFilePath();
              const parentKind = parentNode.getKindName();
              // const parentPos=parentNode.getPos();
              // const parentOfFirstNodeKindText=parentOfFirstNodeKind?.getText();
              const parentText = parentNode.getText();
              console.log({
                nodKind: n.getKindName(),
                nodeFilePath: currentSourceFile.getFilePath(),
                nodeText: n.getText(),
                parentKind,
                parentText,
              });
              switch (parentKind) {
                case "TypeAliasDeclaration":
                  destinationRefactorSourceFile.addTypeAlias({
                    isExported: true,
                    ...parentNode
                      .asKindOrThrow(SyntaxKind.TypeAliasDeclaration)
                      .getStructure(),
                  });

                  break;
                case "ImportDeclaration":
                  break;
                case "TypeReference":
                case "QualifiedName": {
                  parentNode.replaceWithText(
                    args.proposedTypeChainReferenceShort
                  );
                  break;
                }
                default:
                  break;
              }
              console.timeLog();
              args.trackedFiles.push(currentSourceFile);
            });
          }
        );
        console.log("Doing - Removing TypeAliasDeclaration");
        console.timeLog();
        console.log({
          declarationNodeForDefintiongetFilePath: declarationNodeForDefintion
            .getSourceFile()
            .getFilePath(),
          declarationNodeForDefintiongetFileText: declarationNodeForDefintion
            .getSourceFile()
            .getText(),
          declarationNodeForDefintiongetText:
            declarationNodeForDefintion.getText(),
        });
        declarationNodeForDefintion
          .asKindOrThrow(SyntaxKind.TypeAliasDeclaration)
          .remove();
        console.log("DONE - Removing TypeAliasDeclaration");
        console.timeLog();
        args.trackedFiles.push(targetRefactorSourceFile);
        args.trackedFiles.push(destinationRefactorSourceFile);
        console.log("Doing - Formatting files");
        console.timeLog();
        args.trackedFiles.forEach((f) =>
          formatFilePretty(f, formatCodeSettings, userPreferences)
        );
        console.log("Done - Formatting files");
        console.timeLog();
        console.log("Doing - Saving files");
        console.timeLog();
        await project.save();
        await Promise.all(
          args.trackedFiles.map((f) => f.refreshFromFileSystem())
        );
        console.log("Doing - Saving files");
        console.timeLog();
        console.log("Refreshing files...");
        // await Promise.all(args.trackedFiles.map(f => f.refreshFromFileSystem()));
        console.log("Waiting for tasks...");
        await vscode.window.showInformationMessage(
          `New Location: ${destinationRefactorSourceFile.getFilePath()}`
        );
      } catch (error) {
        console.error("REFACTOR CRASH");
        console.error(error);
      } finally {
        console.error("REFACTOR FINALLY BLOCK");
        await clearJobTaskQueueAndReset();
        taskLock = 0;
        resetFileSystemWatchersToHandleKnownBugInVsCode();
        console.log("Done");
        console.timeEnd();
      }
    }
  );
  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {
  // watcher.dispose();
}
