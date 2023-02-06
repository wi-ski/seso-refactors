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
  // FormatCodeSettings,
  LanguageService,
  Node,
  SourceFile,
  // UserPreferences,
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

// const formatFilePretty = (
//   sf: SourceFile,
//   formSettings: FormatCodeSettings,
//   uprefs: UserPreferences
// ) => {
//   sf.fixUnusedIdentifiers(formSettings, uprefs);
//   sf.fixMissingImports(formSettings, uprefs);
//   sf.organizeImports(formSettings, uprefs);
//   // Todo: Somehow trigger editor file formatting
//   sf.formatText(formSettings);
// };
const tsesoPrefix = "TSeso.DDD.";
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

const moveDeclarationToDestinationAndUpdateReferences = ({
  destinationSourceFilePath,
  initialNodeAtCursorPositionToFindDeclarationOf,
  languageService,
  project,
  proposedTypeChainReferenceIdentifierName,
  proposedTypeChainReferenceLong,
}: {
  destinationSourceFilePath: string;
  initialNodeAtCursorPositionToFindDeclarationOf: Node;
  languageService: LanguageService;
  project: Project;
  proposedTypeChainReferenceIdentifierName: string;
  proposedTypeChainReferenceLong: string;
}) => {
  // const formatCodeSettings =
  //   project.manipulationSettings.getFormatCodeSettings();
  // const userPreferences = project.manipulationSettings.getUserPreferences();

  if (!initialNodeAtCursorPositionToFindDeclarationOf) {
    throw new Error("Bad initialNodeAtCursorPositionToFindDeclarationOf");
  }
  const definitions = languageService.getDefinitions(
    initialNodeAtCursorPositionToFindDeclarationOf
  );
  // Only handling if has single defintion currently.
  if (definitions.length > 1) {
    throw new Error("Too many defintions found");
  }
  const definitionNodeForDefintion = definitions[0].getdefinitionNode();
  if (!definitionNodeForDefintion) {
    throw new Error("Bad definitionNodeForDefintion");
  }
  const destinationRefactorSourceFile = project.getSourceFileOrThrow(
    destinationSourceFilePath
  );

  console.log("Crawling the tree...");
  console.log("Looking for references to:");
  console.log(definitionNodeForDefintion.getText());
  console.timeLog();
  const referenceNodes = languageService.findReferencesAsNodes(
    definitionNodeForDefintion
  );
  referenceNodes.forEach((focusedNode) => {
    const focusedSourceFile = focusedNode.getSourceFile();
    console.log("focusedSourceFile TEXT");
    console.log(focusedSourceFile.getText());
    const parentNode = focusedNode.getParentOrThrow();
    const parentKind = parentNode.getKindName();
    const parentText = parentNode.getText();
    const focusedNodeTextAtPost = focusedSourceFile
      .getDescendantAtPos(focusedNode.getPos())
      ?.getText();
    const parentNodeTextAtPos = focusedSourceFile
      .getDescendantAtPos(parentNode.getPos())
      ?.getText();
    console.log({
      destinationRefactorSourceFile:
        destinationRefactorSourceFile.getFilePath(),
      focusedNodeTextAtPost,
      nodeFilePath: focusedSourceFile.getFilePath(),
      nodeKind: focusedNode.getKindName(),
      nodePOS: focusedNode.getPos(),
      nodeText: focusedNode.getText(),
      parentKind,
      parentNodePOS: parentNode.getPos(),
      parentNodeTextAtPos,
      parentText,
      sourceFileSaved: focusedSourceFile.isSaved(),
    });
    switch (parentKind) {
      case "TypeAliasDeclaration": {
        // Leave as-is.
        break;
      }
      case "FirstNode":
      case "QualifiedName":
        console.log({
          ReplacingTextQualifiedName: 1,
          parentNodeNext: parentNode.getFullText(),
          parentNodePOS: parentNode.getPos(),
          proposedTypeChainReferenceLong,
        });

        parentNode
          .asKindOrThrow(SyntaxKind.QualifiedName)
          ?.replaceWithText(proposedTypeChainReferenceLong);
        break;
      case "TypeReference": {
        console.log({
          ReplacingTextTypeReference: 1,
          parentNodeNext: parentNode.getFullText(),
          parentNodePOS: parentNode.getPos(),
          proposedTypeChainReferenceLong,
        });
        parentNode
          .asKindOrThrow(SyntaxKind.TypeReference)
          ?.replaceWithText(proposedTypeChainReferenceLong);
        break;
      }
      case "Identifier":
      case "ImportDeclaration":
      case "Parameter":
      case "ImportSpecifier":
        console.error("Ignoring parent kind");
        console.error(parentKind);
        break;
      default:
        console.error("UNHANDLED parentKind");
        console.error(parentKind);
        break;
    }
  });
  const structure = {
    ...definitionNodeForDefintion
      .asKindOrThrow(SyntaxKind.TypeAliasDeclaration)
      .getStructure(),
    isExported: true,
    name: proposedTypeChainReferenceIdentifierName,
  };
  // Readme. For some reason - magical - we have to move/remove the declaration last.
  destinationRefactorSourceFile.addTypeAlias(structure);
  definitionNodeForDefintion
    .asKindOrThrow(SyntaxKind.TypeAliasDeclaration)
    ?.remove();
};

const createTypeFilesIfNotExistOrAppendToExisting = (
  p: Project,
  domainShapeConf: TExtensionParamsBlob
) => {
  domainShapeConf.pathsToFileContent.forEach((pathToContentObj) => {
    console.log(`Attempting to instantiate file: ${pathToContentObj.path}`);
    console.timeLog();
    let sourceFileToProcess: SourceFile;
    try {
      // Explodes if existing
      sourceFileToProcess = p.createSourceFile(pathToContentObj.path, "", {
        overwrite: false,
      });
    } catch (e: unknown) {
      // Explodes if unhappy
      sourceFileToProcess = p.getSourceFileOrThrow(pathToContentObj.path);
    }
    pathToContentObj.content(sourceFileToProcess);
  });
};

type TTask = () => Promise<unknown>;
type TTaskQueue = TTask[];

export async function activate(context: vscode.ExtensionContext) {
  let taskQueue: TTaskQueue = [];
  let taskLock = 0;
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
  const removeFileFromProject = (e: { path: string }) => {
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
  const addFileToProject = (e: { path: string }) => {
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
  const updateFileInProject = (e: { path: string }) => {
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
          title: "TSeso.DDD Domain Path",
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
              return "Must start with TSeso.DDD.";
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

        // Note: This is the cursor's position in the file - the number ts-morph needs.
        console.log("DOING - getDescendantAtPosOrThrow(sourceFile, offset); ");
        console.timeLog();
        const targetNode = getDescendantAtPosOrThrow(sourceFile, offset);
        const languageService = project.getLanguageService();
        const onlyDefintionNodeForSelectedNode =
          getTypesSingleDefintionNodeAndSourceFileOrThrow(
            languageService,
            targetNode
          );
        const args = {
          ...constructedArgs,
          definitionName: onlyDefintionNodeForSelectedNode.node
            .getSymbolOrThrow()
            .getName(),
          focusedFilePath: filePath,
          onlyDefintionNodeForSelectedNode,
          targetRefactoringSourceFile:
            onlyDefintionNodeForSelectedNode.sourceFile,
        } as const;

        console.log({
          args,
        });

        createTypeFilesIfNotExistOrAppendToExisting(project, args);
        moveDeclarationToDestinationAndUpdateReferences({
          destinationSourceFilePath:
            args.domainNameZetaSuperRootTypeDefinitionFilePath,
          initialNodeAtCursorPositionToFindDeclarationOf: targetNode,
          languageService,
          project,
          proposedTypeChainReferenceIdentifierName:
            args.proposedTypeChainReferenceIdentifierName,
          proposedTypeChainReferenceLong: args.proposedTypeChainReferenceLong,
        });
        console.log("Doing - Saving files");
        console.timeLog();
        await project.save();
        await vscode.window.showInformationMessage(
          `New Location: ${args.domainNameZetaSuperRootTypeDefinitionFilePath}`
        );
      } catch (error) {
        console.error("REFACTOR CRASH");
        console.error(error);
      } finally {
        console.error("REFACTOR FINALLY BLOCK");
        await clearJobTaskQueueAndReset();
        taskLock = 0;
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
