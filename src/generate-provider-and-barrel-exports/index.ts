// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as path from "path";

import * as fse from "fs-extra";
import * as R from "ramda";
import * as vscode from "vscode";

import * as constants from "./constants";
import * as providerTemplate from "./templates";

import type {
  TCommandNamesToHandlers,
  TDomainShapeConfig,
  TDomainShapeConfigAlpha,
  TDomainShapeConfigBeta,
  TDomainShapeConfigGamma,
  TGenerateableProviderTypes,
  TPathsToFileContentObj,
} from "./constants";

type TVSCode = typeof vscode;

const yankPathsFromObj = <T extends Record<string, unknown>>(
  ps: string[][],
  o: T
): T => {
  let res = {};
  ps.forEach((p) => {
    const valAtPath = R.path(p, o);
    res = R.assocPath(p, valAtPath, res);
  });
  return res as T;
};

const generateTypesToYankPaths: Record<TGenerateableProviderTypes, string[][]> =
  {
    [constants.generateableProviderTypes.APPLICATION_SERVICE]: [
      ["index"],
      ["application", "index"],
      ["application", "service"],
    ],
    [constants.generateableProviderTypes.APPLICATION_USECASE]: [
      ["index"],
      ["application", "index"],
      ["application", "useCase"],
    ],
    [constants.generateableProviderTypes.APPLICATION_EVENTLISTENER]: [
      ["index"],
      ["application", "index"],
      ["application", "eventListener"],
    ],
    [constants.generateableProviderTypes.APPLICATION_DTO]: [
      ["index"],
      ["application", "index"],
      ["application", "dto"],
    ],
    [constants.generateableProviderTypes.DOMAIN_ENTITY]: [
      ["index"],
      ["domain", "index"],
      ["domain", "entity"],
    ],
    [constants.generateableProviderTypes.DOMAIN_SERVICE]: [
      ["index"],
      ["domain", "index"],
      ["domain", "service"],
    ],
    [constants.generateableProviderTypes.DOMAIN_VALUEOBJECT]: [
      ["index"],
      ["domain", "index"],
      ["domain", "valueObject"],
    ],
    [constants.generateableProviderTypes.INFRASTRUCTURE_SERVICE]: [
      ["index"],
      ["infrastructure", "index"],
      ["infrastructure", "service"],
    ],
  };

const buildBaseArgsOrThrow =
  (refactorType: TGenerateableProviderTypes) =>
  async (vscodeLibRef: TVSCode) => {
    const workspaceFolders = vscodeLibRef?.workspace?.workspaceFolders;
    const activeTextEditor = vscodeLibRef.window.activeTextEditor;
    if (!activeTextEditor) {
      throw new Error("No active editor");
    }
    if (!workspaceFolders) {
      throw new Error("Bad workspaceFolders");
    }
    const selection = activeTextEditor.selection;
    const focusedFilePath = activeTextEditor.document.fileName;
    const selectionStart = selection.start;
    const document = activeTextEditor.document;
    const cwf = activeTextEditor.document.fileName;
    const cursorPosition = document.offsetAt(selectionStart);

    const res = {
      cursorPosition,
      cwf,
      focusedFilePath,
      pwd: workspaceFolders[0].uri.path,
      refactorType,
    };
    return res;
  };

async function promptUserWithSuggestedIdentifier(p: TBaseArgsContext) {
  const betaAndGammaDomainStr = (() => {
    const p1 = String(p.cwf.split("ddd").pop());
    if (p1.includes("/application/")) {
      return p1
        .split("/application/")
        .shift()
        .split("/")
        .filter(Boolean)
        .join("."); // looks like: Shared/Media
    }
    if (p1.includes("/domain/")) {
      return p1.split("/domain/").shift().split("/").filter(Boolean).join("."); // looks like: Shared/Media
    }
    if (p1.includes("/infrastructure/")) {
      return p1
        .split("/infrastructure/")
        .shift()
        .split("/")
        .filter(Boolean)
        .join("."); // looks like: Shared/Media
    }
  })();

  let placeholder = "";
  switch (p.refactorType) {
    case constants.generateableProviderTypes.APPLICATION_EVENTLISTENER:
      placeholder = `${betaAndGammaDomainStr}.application.eventListener.`;
      break;
    case constants.generateableProviderTypes.APPLICATION_USECASE:
      placeholder = `${betaAndGammaDomainStr}.application.useCase.`;
      break;
    case constants.generateableProviderTypes.APPLICATION_SERVICE:
      placeholder = `${betaAndGammaDomainStr}.application.service.`;
      break;
    case constants.generateableProviderTypes.APPLICATION_DTO:
      placeholder = `${betaAndGammaDomainStr}.application.dto.`;
      break;
    case constants.generateableProviderTypes.DOMAIN_ENTITY:
      placeholder = `${betaAndGammaDomainStr}.domain.entity.`;
      break;
    case constants.generateableProviderTypes.DOMAIN_SERVICE:
      placeholder = `${betaAndGammaDomainStr}.domain.service.`;
      break;
    case constants.generateableProviderTypes.DOMAIN_VALUEOBJECT:
      placeholder = `${betaAndGammaDomainStr}.domain.valueObject.`;
      break;
    case constants.generateableProviderTypes.INFRASTRUCTURE_SERVICE:
      placeholder = `${betaAndGammaDomainStr}.infrastructure.service.`;
      break;
    default:
      throw new Error("Bad Generator Type.");
  }

  const proposedTypeReferenceChain = (await vscode.window.showInputBox({
    ignoreFocusOut: true,
    prompt: "Provide the complete runtimeContext path for your new provider",
    title: "The $r path",
    value: placeholder,
  })) as string;

  console.log("proposedTypeReferenceChain");
  console.log(proposedTypeReferenceChain);

  if (!proposedTypeReferenceChain) {
    throw new Error("Generator command aborted.");
  }
  const split = proposedTypeReferenceChain.split(".");
  const providerName = String(proposedTypeReferenceChain.split(".").pop());
  const alphaDomain = "ddd";
  const betaDomain = split[0];
  const gammaDomain = split.length > 4 ? split[1] : null;

  const res = {
    ...p,
    alphaDomain,
    betaDomain,
    gammaDomain,
    placeholder,
    providerName,
  };
  return res;
}

function buildPathsToFileContent(p: TFinaArgsContext) {
  const _almostDomainShapeConfig: TDomainShapeConfig = {
    application: {
      dto: {
        index: providerTemplate.buildBarrelExportProvider,
        [p.providerName]: providerTemplate.buildProviderApplicationDTO,
      },
      eventListener: {
        index: providerTemplate.buildBarrelExportProvider,
        [p.providerName]:
          providerTemplate.buildProviderApplicationEventListener,
      },
      index: providerTemplate.buildBarrelExportApplicationLayer,
      service: {
        index: providerTemplate.buildBarrelExportProvider,
        [p.providerName]: providerTemplate.buildProviderApplicationService,
      },
      useCase: {
        index: providerTemplate.buildBarrelExportProvider,
        [p.providerName]: providerTemplate.buildProviderApplicationUseCase,
      },
    },
    domain: {
      entity: {
        index: providerTemplate.buildBarrelExportProvider,
        [p.providerName]: providerTemplate.buildProviderDomainEntity,
      },
      index: providerTemplate.buildBarrelExportDomainLayer,
      service: {
        index: providerTemplate.buildBarrelExportProvider,
        [p.providerName]: providerTemplate.buildProviderDomainService,
      },
      valueObject: {
        index: providerTemplate.buildBarrelExportProvider,
        [p.providerName]: providerTemplate.buildProviderDomainValueObject,
      },
    },
    index: providerTemplate.buildBarrelExportDomainRoot,
    infrastructure: {
      index: providerTemplate.buildBarrelExportInfrastructureLayer,
      service: {
        index: providerTemplate.buildBarrelExportProvider,
        [p.providerName]: providerTemplate.buildProviderInfrastructureService,
      },
    },
  };

  const pathsToYank = generateTypesToYankPaths[p.refactorType];
  const almostDomainShapeConfig = yankPathsFromObj(
    pathsToYank,
    _almostDomainShapeConfig
  );

  // Note: Not used if gamma undefined
  const domainShapeGamma: TDomainShapeConfigGamma = {
    index: providerTemplate.buildBarrelExportBetaDomainRoot,
    [p.gammaDomain]: almostDomainShapeConfig,
  };
  const betaDomainConfig: TDomainShapeConfigBeta = {
    index: providerTemplate.buildBarrelExportAlphaDomainRoot,
    [p.betaDomain]: p.gammaDomain ? domainShapeGamma : almostDomainShapeConfig,
  };

  const alphaDomainShapeConfig: TDomainShapeConfigAlpha = {
    [p.alphaDomain]: betaDomainConfig,
  };

  const pathsToFileContent: TPathsToFileContentObj[] = [];
  function runner(
    o: TDomainShapeConfig | TDomainShapeConfigAlpha | TDomainShapeConfigBeta,
    pp: string[]
  ): void {
    const keys = Object.keys(o);
    if (keys.length) {
      return keys.forEach((k) => {
        const attr = o[k];
        if (typeof attr === "function") {
          pathsToFileContent.push({
            content: attr, // Is content builder.
            path: path.join(p.pwd, ...pp, `${k}.ts`),
          });
        } else {
          return runner(attr, pp.concat(k));
        }
      });
    }
  }
  runner(alphaDomainShapeConfig, []);
  return { ...p, pathsToFileContent };
}

export type TBaseArgsContext = Awaited<
  ReturnType<ReturnType<typeof buildBaseArgsOrThrow>>
>;
export type TFinaArgsContext = Awaited<
  ReturnType<typeof promptUserWithSuggestedIdentifier>
>;
const generateApplicationEventlistener = async (_a: TFinaArgsContext) => {};
const generateApplicationService = async (_a: TFinaArgsContext) => {};
const generateApplicationUsecase = async (_a: TFinaArgsContext) => {};
const generateDomainEntity = async (_a: TFinaArgsContext) => {};
const generateDomainService = async (_a: TFinaArgsContext) => {};
const generateDomainValueobject = async (_a: TFinaArgsContext) => {};
const generateInfrastructureService = async (_a: TFinaArgsContext) => {};
const generateApplicationDto = async (argsContext: TFinaArgsContext) => {
  const { pathsToFileContent } = buildPathsToFileContent(argsContext);
  for (let index = 0; index < pathsToFileContent.length; index++) {
    const p = pathsToFileContent[index];
    console.log("Starting writes...");
    const isFreshFile = !(await fse.exists(p.path));
    const fileContent = isFreshFile
      ? ""
      : await fse.readFile(p.path, { encoding: "utf8" });
    const configuratorFnOpts = {
      argsContext,
      sourcefileContext: {
        fileContent,
        filePath: p.path,
        fs: fse,
        isFreshFile,
      },
      templateParams: {
        TEMPLATE_FN_BODY: "",
        TEMPLATE_PARAMS_BLOB: "",
        TEMPLATE_PARAMS_TYPE: "",
        TEMPLATE_PARAMS_TYPE_NAME: "",
        TEMPLATE_PROVIDER_NAME: argsContext.providerName,
        TEMPLATE_RESPONSE_TYPE: "",
        TEMPLATE_RESPONSE_TYPE_NAME: "",
      },
    };

    console.log("Ensuring file...");
    console.log(p.path);
    await fse.ensureFile(p.path);
    await fse.writeFile(p.path, p.content(configuratorFnOpts));
  }
};

type TMaybePromise<T> = Promise<T> | T;
function asyncPipe<A, B, C, D>(
  // Note: is reverse order.
  cd: (b: C) => TMaybePromise<D>,
  bc: (b: B) => TMaybePromise<C>,
  ab: (a: A) => TMaybePromise<B>
): (a: TMaybePromise<A>) => Promise<D>;
function asyncPipe(...fns: ((...a: unknown[]) => Promise<unknown>)[]) {
  return (x: unknown) =>
    fns
      .slice()
      .reverse() // Note: Reverse mutates the array. Boo.
      .reduce(async (y, fn) => fn(await y), x);
}

const progressFeedbackWrapper = <T extends (fn: any) => Promise<any>>(
  fn: T,
  feedbackMsg: string
): T => {
  const customCancellationToken = new vscode.CancellationTokenSource();
  customCancellationToken.token.onCancellationRequested(() => {
    customCancellationToken.dispose();
  });
  return async function progressWrapper(ps) {
    return vscode.window.withProgress(
      {
        cancellable: true,
        location: vscode.ProgressLocation.Notification,
        title: "Seso DDD Generator",
      },
      async (progress) => {
        progress.report({ message: feedbackMsg });
        const result = await fn(ps);
        progress.report({ message: `${feedbackMsg} [Complete]` });
        return result;
      }
    );
  } as T;
};

export const commandNamesToHandlers: TCommandNamesToHandlers = {
  [constants.generateableProviderTypes.APPLICATION_EVENTLISTENER]: asyncPipe(
    progressFeedbackWrapper(
      generateApplicationEventlistener,
      "Generating files and barrel exports..."
    ),
    progressFeedbackWrapper(
      promptUserWithSuggestedIdentifier,
      "Prompting for provider identifier..."
    ),
    progressFeedbackWrapper(
      buildBaseArgsOrThrow(
        constants.generateableProviderTypes.APPLICATION_EVENTLISTENER
      ),
      "Building base arguments context..."
    )
  ),
  [constants.generateableProviderTypes.APPLICATION_SERVICE]: asyncPipe(
    progressFeedbackWrapper(
      generateApplicationService,
      "Generating files and barrel exports..."
    ),
    progressFeedbackWrapper(
      promptUserWithSuggestedIdentifier,
      "Prompting for provider identifier..."
    ),
    progressFeedbackWrapper(
      buildBaseArgsOrThrow(
        constants.generateableProviderTypes.APPLICATION_SERVICE
      ),
      "Building base arguments context..."
    )
  ),
  [constants.generateableProviderTypes.APPLICATION_USECASE]: asyncPipe(
    progressFeedbackWrapper(
      generateApplicationUsecase,
      "Generating files and barrel exports..."
    ),
    progressFeedbackWrapper(
      promptUserWithSuggestedIdentifier,
      "Prompting for provider identifier..."
    ),
    progressFeedbackWrapper(
      buildBaseArgsOrThrow(
        constants.generateableProviderTypes.APPLICATION_USECASE
      ),
      "Building base arguments context..."
    )
  ),
  [constants.generateableProviderTypes.APPLICATION_DTO]: asyncPipe(
    progressFeedbackWrapper(
      generateApplicationDto,
      "Generating files and barrel exports..."
    ),
    progressFeedbackWrapper(
      promptUserWithSuggestedIdentifier,
      "Prompting for provider identifier..."
    ),
    progressFeedbackWrapper(
      buildBaseArgsOrThrow(constants.generateableProviderTypes.APPLICATION_DTO),
      "Building base arguments context..."
    )
  ),
  [constants.generateableProviderTypes.DOMAIN_ENTITY]: asyncPipe(
    progressFeedbackWrapper(
      generateDomainEntity,
      "Generating files and barrel exports..."
    ),
    progressFeedbackWrapper(
      promptUserWithSuggestedIdentifier,
      "Prompting for provider identifier..."
    ),
    progressFeedbackWrapper(
      buildBaseArgsOrThrow(constants.generateableProviderTypes.DOMAIN_ENTITY),
      "Building base arguments context..."
    )
  ),
  [constants.generateableProviderTypes.DOMAIN_SERVICE]: asyncPipe(
    progressFeedbackWrapper(
      generateDomainService,
      "Generating files and barrel exports..."
    ),
    progressFeedbackWrapper(
      promptUserWithSuggestedIdentifier,
      "Prompting for provider identifier..."
    ),
    progressFeedbackWrapper(
      buildBaseArgsOrThrow(constants.generateableProviderTypes.DOMAIN_SERVICE),
      "Building base arguments context..."
    )
  ),
  [constants.generateableProviderTypes.DOMAIN_VALUEOBJECT]: asyncPipe(
    progressFeedbackWrapper(
      generateDomainValueobject,
      "Generating files and barrel exports..."
    ),
    progressFeedbackWrapper(
      promptUserWithSuggestedIdentifier,
      "Prompting for provider identifier..."
    ),
    progressFeedbackWrapper(
      buildBaseArgsOrThrow(
        constants.generateableProviderTypes.DOMAIN_VALUEOBJECT
      ),
      "Building base arguments context..."
    )
  ),
  [constants.generateableProviderTypes.INFRASTRUCTURE_SERVICE]: asyncPipe(
    progressFeedbackWrapper(
      generateInfrastructureService,
      "Generating files and barrel exports..."
    ),
    progressFeedbackWrapper(
      promptUserWithSuggestedIdentifier,
      "Prompting for provider identifier..."
    ),
    progressFeedbackWrapper(
      buildBaseArgsOrThrow(
        constants.generateableProviderTypes.INFRASTRUCTURE_SERVICE
      ),
      "Building base arguments context..."
    )
  ),
};
