// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as path from "path";

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

const yankPathsFromObj = <T extends Record<string, any>>(
  ps: string[][],
  o: T
): T => {
  let res = {};
  console.log("yankPathsFromObj");
  console.log(ps);
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
    console.log("buildBaseArgsOrThrow");
    console.log(res);
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

  if (!proposedTypeReferenceChain) {
    throw new Error("Bad type reference chain");
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
            content: attr,
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
type TBaseArgsContext = Awaited<
  ReturnType<ReturnType<typeof buildBaseArgsOrThrow>>
>;
type TFinaArgsContext = Awaited<
  ReturnType<typeof promptUserWithSuggestedIdentifier>
>;

const generateApplicationEventlistener = async (_a: TFinaArgsContext) => {};
const generateApplicationService = async (_a: TFinaArgsContext) => {};
const generateApplicationUsecase = async (_a: TFinaArgsContext) => {};
const generateDomainEntity = async (_a: TFinaArgsContext) => {};
const generateDomainService = async (_a: TFinaArgsContext) => {};
const generateDomainValueobject = async (_a: TFinaArgsContext) => {};
const generateInfrastructureService = async (_a: TFinaArgsContext) => {};
const generateApplicationDto = async (_a: TFinaArgsContext) => {
  console.log("generateApplicationDto");
  console.log(_a);
  const finalArgs = buildPathsToFileContent(_a);
  console.log("finalArgs");
  console.log(finalArgs);
};

type TMaybePromise<T> = Promise<T> | T;
function asyncPipe<A, B, C, D>(
  cd: (b: C) => TMaybePromise<D>,
  bc: (b: B) => TMaybePromise<C>,
  ab: (a: A) => TMaybePromise<B>
): (a: TMaybePromise<A>) => Promise<D>;
function asyncPipe(...fns: ((...a: any[]) => Promise<any>)[]) {
  return (x: any) =>
    fns
      .slice()
      .reverse() // Note: Reverse mutates the array. Boo.
      .reduce(async (y, fn) => fn(await y), x);
}
export const commandNamesToHandlers: TCommandNamesToHandlers = {
  [constants.generateableProviderTypes.APPLICATION_EVENTLISTENER]: asyncPipe(
    generateApplicationEventlistener,
    promptUserWithSuggestedIdentifier,
    buildBaseArgsOrThrow(
      constants.generateableProviderTypes.APPLICATION_EVENTLISTENER
    )
  ),
  [constants.generateableProviderTypes.APPLICATION_SERVICE]: asyncPipe(
    generateApplicationService,
    promptUserWithSuggestedIdentifier,
    buildBaseArgsOrThrow(
      constants.generateableProviderTypes.APPLICATION_SERVICE
    )
  ),
  [constants.generateableProviderTypes.APPLICATION_USECASE]: asyncPipe(
    generateApplicationUsecase,
    promptUserWithSuggestedIdentifier,
    buildBaseArgsOrThrow(
      constants.generateableProviderTypes.APPLICATION_USECASE
    )
  ),
  [constants.generateableProviderTypes.APPLICATION_DTO]: asyncPipe(
    generateApplicationDto,
    promptUserWithSuggestedIdentifier,
    buildBaseArgsOrThrow(constants.generateableProviderTypes.APPLICATION_DTO)
  ),
  [constants.generateableProviderTypes.DOMAIN_ENTITY]: asyncPipe(
    generateDomainEntity,
    promptUserWithSuggestedIdentifier,
    buildBaseArgsOrThrow(constants.generateableProviderTypes.DOMAIN_ENTITY)
  ),
  [constants.generateableProviderTypes.DOMAIN_SERVICE]: asyncPipe(
    generateDomainService,
    promptUserWithSuggestedIdentifier,
    buildBaseArgsOrThrow(constants.generateableProviderTypes.DOMAIN_SERVICE)
  ),
  [constants.generateableProviderTypes.DOMAIN_VALUEOBJECT]: asyncPipe(
    generateDomainValueobject,
    promptUserWithSuggestedIdentifier,
    buildBaseArgsOrThrow(constants.generateableProviderTypes.DOMAIN_VALUEOBJECT)
  ),
  [constants.generateableProviderTypes.INFRASTRUCTURE_SERVICE]: asyncPipe(
    generateInfrastructureService,
    promptUserWithSuggestedIdentifier,
    buildBaseArgsOrThrow(
      constants.generateableProviderTypes.INFRASTRUCTURE_SERVICE
    )
  ),
};
