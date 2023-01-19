// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as path from "path";

import { IndentationText, Project, SyntaxKind } from "ts-morph";
import * as vscode from "vscode";

import type {
  FormatCodeSettings,
  LanguageService,
  Node,
  SourceFile,
  UserPreferences,
} from "ts-morph";

const tsesoPrefix = "TSeso.TD.";

type TTask = () => Promise<any>;
type TTaskQueue = TTask[];
async function clearJobTaskQueue(queue: TTaskQueue) {
  for (let taskIds = 0; taskIds < queue.length; taskIds++) {
    const t = queue[taskIds];
    await t();
  }
}

export async function activate(context: vscode.ExtensionContext) {
  let taskQueue: (() => Promise<any>)[] = [];
  let taskLock = 0;
  setInterval(async () => {
    if (taskLock) {
      console.log("Lock detected, exiting.");
      return;
    }
    console.log("Clearing file watch task queue");
    await clearJobTaskQueue(taskQueue);
    taskQueue = [];
  }, 1000);
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
      try {
        taskLock = 1;
        console.log("Waiting for tasks to complete...");
        await clearJobTaskQueue(taskQueue);
        taskQueue = [];
        const _destinationDomain = (await vscode.window.showInputBox({
          ignoreFocusOut: true,
          prompt: "Provide the complete domain path for your new provider",
          title: "TSeso.TD Domain Path",
          validateInput: (_v) => {
            const v = String(_v);
            const startsWithTSesoPrefix = v.startsWith(tsesoPrefix);
            const isNotTooDepp = v.split(".").length < 10;
            const endsRight =
              v.endsWith("Domain.ValueObject") ||
              v.endsWith("Domain.Entity") ||
              v.endsWith("Application.DTO") ||
              v.endsWith("Infrastructure.Schema");
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
          value: tsesoPrefix,
        })) as string;
        // const destinationDomain = "Shared.Media.Application.DTO";
        const destinationDomain = _destinationDomain
          .split(tsesoPrefix)
          .pop()
          ?.split(".")
          .filter((s) => s !== ".")
          .join(".");
        if (!destinationDomain) {
          throw new Error("Bad destinationDomain");
        }

        const domainFolderPart = "ddd";
        const defaultDomainBarrelExportFileContent =
          () => `export * as Application from "./application/types";
  export * as Domain from "./domain/types";
  export * as Infrastructure from "./infrastructure/types";
  `;
        const defaultInfrastructureTypeFileContent = () =>
          `export * as Schema from "./Schema";`;
        const defaultApplicationTypeFileContent = () =>
          `export * as DTO from "./DTO";`;
        const defaultDomainTypeFileContent =
          () => `export * as Entity from "./Entity";
  export * as ValueObject from "./ValueObject";
      `;
        const emptyTypeFileContent =
          () => `import type * as TSeso from "@/lib/types";
  export {};
      `;
        const topLevelNamespace = "TSeso.TD";
        const domainFilePathPart = (() => {
          if (destinationDomain.includes(".Application.")) {
            return `${destinationDomain
              .split(".Application.")[0]
              .split(".")
              .join("/")}`;
          }
          if (destinationDomain.includes(".Domain.")) {
            return `${destinationDomain
              .split(".Domain.")[0]
              .split(".")
              .join("/")}`;
          }
          if (destinationDomain.includes(".Infrastructure.")) {
            return `${destinationDomain
              .split(".Infrastructure.")[0]
              .split(".")
              .join("/")}`;
          }
        })() as string;
        const defaultArgs = {
          destinationDomain,
          destinationFilePath: (() => {
            if (destinationDomain.includes(".Application.")) {
              const secondPart = "application";
              const thirdPart = destinationDomain.split(".Application.")[1];
              return `${path.join(
                pwd,
                domainFolderPart,
                domainFilePathPart,
                secondPart,
                "types",
                thirdPart
              )}.ts`;
            }
            if (destinationDomain.includes(".Domain.")) {
              const secondPart = "domain";
              const thirdPart = destinationDomain.split(".Domain.")[1];
              return `${path.join(
                pwd,
                domainFolderPart,
                domainFilePathPart,
                secondPart,
                "types",
                thirdPart
              )}.ts`;
            }
            if (destinationDomain.includes(".Infrastructure.")) {
              const secondPart = "infrastructure";
              const thirdPart = destinationDomain.split(".Infrastructure.")[1];
              return `${path.join(
                pwd,
                domainFolderPart,
                domainFilePathPart,
                secondPart,
                "types",
                thirdPart
              )}.ts`;
            }
          })() as string,
          domainFolderPart,
          domainShapeConfig: {
            application: {
              types: {
                "DTO.ts": emptyTypeFileContent(),
                "index.ts": defaultApplicationTypeFileContent(),
              },
            },
            domain: {
              types: {
                "Entity.ts": emptyTypeFileContent(),
                "ValueObject.ts": emptyTypeFileContent(),
                "index.ts": defaultDomainTypeFileContent(),
              },
            },
            infrastructure: {
              types: {
                "Schema.ts": emptyTypeFileContent(),
                "index.ts": defaultInfrastructureTypeFileContent(),
              },
            },
            "types.ts": defaultDomainBarrelExportFileContent(),
          },
          topLevelNamespace,
        } as const;

        const formatFilePretty = (
          sourceFile: SourceFile,
          formSettings: FormatCodeSettings,
          uprefs: UserPreferences
        ) => {
          sourceFile.fixUnusedIdentifiers(formSettings, uprefs);
          sourceFile.fixMissingImports(formSettings, uprefs);
          sourceFile.organizeImports(formSettings, uprefs);
          // Todo: Somehow trigger file formatting
          sourceFile.formatText(formSettings);
        };

        // This method is called when your extension is activated
        // Your extension is activated the very first time the command is executed
        const getTypesSingleDefintionNodeAndSourceFileOrThrow = (
          languageService: LanguageService,
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

          const defintions = languageService.getDefinitions(n).map((n) => ({
            node: n.getNode(),
            sourceFile: n.getSourceFile(),
            symbolNameAtDefintion: n.getNode().getSymbolOrThrow().getName(),
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

        const getDescendantAtPosOrThrow = (
          sourceFile: SourceFile,
          pos: number
        ) => {
          const n = sourceFile.getDescendantAtPos(pos);
          if (n) {
            return n;
          }
          throw new Error(
            `Could not find desc in file ${sourceFile.getFilePath()} at position ${pos}`
          );
        };
        function buildPathsToFileContent(
          object: Record<string, any>
        ): { content: string; path: string }[] {
          const result: any[] = [];
          function runner(o: Record<string, any>, p: string[]): void {
            const keys = Object.keys(o);
            if (keys.length) {
              return keys.forEach((k) => {
                const attr = o[k];
                if (typeof attr === "string") {
                  return result.push({
                    content: attr,
                    path: `${p.join("/")}/${k}`,
                  });
                }
                return runner(attr, p.concat(k));
              });
            }
          }
          runner(object, []);
          return result;
        }

        const createTypeFilesIfNotExistOrAppendToExisting = (
          project: Project,
          domainShapeConf: (typeof defaultArgs)["domainShapeConfig"]
        ) => {
          const pathsToContent = buildPathsToFileContent(domainShapeConf).map(
            (o) => {
              return {
                ...o,
                path: `${pwd}/${defaultArgs.domainFolderPart}/${domainFilePathPart}/${o.path}`,
              };
            }
          );
          pathsToContent.forEach((pathToContentObj) => {
            console.log(
              `Attempting to instantiate file: ${pathToContentObj.path}`
            );
            console.timeLog();
            try {
              project.createSourceFile(
                pathToContentObj.path,
                pathToContentObj.content,
                {
                  overwrite: false,
                }
              );
            } catch (e: any) {
              console.error(e);
            }
          });
        };
        console.log(
          "DOING - project.manipulationSettings.getFormatCodeSettings();"
        );
        console.timeLog();
        const formatCodeSettings =
          project.manipulationSettings.getFormatCodeSettings();
        console.log(
          "DOING - project.manipulationSettings.getUserPreferences();"
        );
        console.timeLog();
        const userPreferences =
          project.manipulationSettings.getUserPreferences();
        // Dunno what this does yet.

        console.log("DOING - project.getLanguageService();");
        console.timeLog();
        const languageService = project.getLanguageService();

        console.log("DOING - ctiveTextEditor.selection;");
        console.timeLog();
        const activeTextEditor = vscode.window.activeTextEditor;
        if (!activeTextEditor) {
          throw new Error("No active editor");
        }
        const selection = activeTextEditor.selection;
        console.log("DOING - activeTextEditor.document.fileName;");
        console.timeLog();
        const filePath = activeTextEditor.document.fileName;
        console.log("DOING - selection.start;");
        console.timeLog();
        const selectionStart = selection.start;
        console.log("DOING - activeTextEditor.document;");
        console.timeLog();
        const document = activeTextEditor.document;
        console.log("DOING - document.offsetAt(selectionStart);");
        console.timeLog();
        const offset = document.offsetAt(selectionStart);
        console.log("DOING - project.getSourceFileOrThrow(filePath);");
        console.timeLog();
        const sourceFile = project.getSourceFileOrThrow(filePath);
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
          ...defaultArgs,
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

        console.log({
          args,
        });

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

        createTypeFilesIfNotExistOrAppendToExisting(
          project,
          args.domainShapeConfig
        );

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
          defaultArgs.destinationFilePath
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
              if (parentKind === "TypeAliasDeclaration") {
                // Shove the declaration in the destination file\
                destinationRefactorSourceFile.addTypeAlias({
                  isExported: true,
                  ...parentNode
                    .asKindOrThrow(SyntaxKind.TypeAliasDeclaration)
                    .getStructure(),
                });
              }

              if (parentKind === "ImportDeclaration") {
                // Leave these alone, they git nixed by formatFilePretty
                return;
              }
              if (["TypeReference", "QualifiedName"].includes(parentKind)) {
                parentNode.replaceWithText(
                  `TSeso.TD.${args.destinationDomain}.${args.definitionName}`
                );
                return;
              }

              // console.log({
              //   nodeFilePath,
              //   nodeKind,
              //   nodePos,
              //   nodeText,
              //   parentFilePath,
              //   parentKind,
              //   parentPos,
              //   parentOfFirstNodeKindText,
              //   parentText,
              // });
              console.log("ASDASD");
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
        await clearJobTaskQueue(taskQueue);
        taskQueue = [];
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
