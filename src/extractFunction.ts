import * as path from "path";

import * as R from "ramda";
import { Project, SymbolFlags, SyntaxKind } from "ts-morph";

import type { Identifier, SourceFile } from "ts-morph";

const project = new Project({
  tsConfigFilePath:
    "/Users/willdembinski/projects/seso-refactors/tsconfig.json",
});
const extractRefactorTypes = {
  APPLICATION_SERVICE: "APPLICATION_SERVICE",
  APPLICATION_USECASE: "APPLICATION_USECASE",
  DOMAIN_ENTITY: "DOMAIN_ENTITY",
  DOMAIN_SERVICE: "DOMAIN_SERVICE",
  DOMAIN_VALUEOBJECT: "DOMAIN_VALUEOBJECT",
  INFRASTRUCTURE_SERVICE: "INFRASTRUCTURE_SERVICE",
} as const;
type TExtractRefactorTypes = keyof typeof extractRefactorTypes;
const yankPathsFromObj = <T extends Record<string, any>>(
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

type TTemplateParams = {
  TEMPLATE_FN_BODY: string;
  TEMPLATE_PARAMS_BLOB: string;
  TEMPLATE_PARAMS_TYPE: string;
  TEMPLATE_PARAMS_TYPE_NAME: string;
  TEMPLATE_PROVIDER_NAME: string;
  TEMPLATE_RESPONSE_TYPE: string;
  TEMPLATE_RESPONSE_TYPE_NAME: string;
};

type TSourceFileConfig = {
  isFreshFile: boolean;
  sourceFile: SourceFile;
};

type TSourceFileConfiguratorFn = (config: {
  sourcefileConfig: TSourceFileConfig;
  templateParams: TTemplateParams;
}) => void;
type TSourceFileConfiguratorObj = Record<string, TSourceFileConfiguratorFn>;

export type TDomainShapeConfig = {
  application: {
    eventListener: TSourceFileConfiguratorObj;
    index: TSourceFileConfiguratorFn;
    service: TSourceFileConfiguratorObj;
    useCase: TSourceFileConfiguratorObj;
  };
  domain: {
    entity: TSourceFileConfiguratorObj;
    index: TSourceFileConfiguratorFn;
    service: TSourceFileConfiguratorObj;
    valueObject: TSourceFileConfiguratorObj;
  };
  index: TSourceFileConfiguratorFn;
  infrastructure: {
    index: TSourceFileConfiguratorFn;
    service: TSourceFileConfiguratorObj;
  };
};
export type TDomainShapeConfigAlpha = {
  [pathPart: string]:
    | TDomainShapeConfigBeta
    | TDomainShapeConfigGamma
    | TSourceFileConfiguratorFn;
  index: TSourceFileConfiguratorFn;
};

export type TDomainShapeConfigBeta = {
  [pathPart: string]:
    | TDomainShapeConfig
    | TDomainShapeConfigGamma
    | TSourceFileConfiguratorFn;
  index: TSourceFileConfiguratorFn;
};
export type TDomainShapeConfigGamma = {
  [pathPart: string]:
    | TSourceFileConfiguratorFn
    | { [pathPart: string]: TDomainShapeConfig | TSourceFileConfiguratorFn };
  index: TSourceFileConfiguratorFn;
};

type TPathsToFileContentObj = {
  content: TSourceFileConfiguratorFn;
  path: string;
};
function template(strings, ...keys) {
  return (...values) => {
    const dict = values.at(-1) || {};
    const result = [strings[0]];
    keys.forEach((key, i) => {
      const value = Number.isInteger(key) ? values[key] : dict[key];
      result.push(value, strings[i + 1]);
    });
    return result.join("");
  };
}
const templateDomainServiceFiller = template`
import type * as TSeso from "@/lib/types";

export type ${"TEMPLATE_PARAMS_TYPE_NAME"} = ${"TEMPLATE_PARAMS_TYPE"};
export type ${"TEMPLATE_RESPONSE_TYPE_NAME"} = ${"TEMPLATE_RESPONSE_TYPE"};

export const ${"TEMPLATE_PROVIDER_NAME"}: TSeso.TDDD.domain.TDomainService<${"TEMPLATE_PARAMS_TYPE_NAME"}, ${"TEMPLATE_RESPONSE_TYPE_NAME"}> = (
  $r,
  ${"TEMPLATE_PARAMS_BLOB"}
) => {
  ${"TEMPLATE_FN_BODY"}
};
`;
const buildProviderApplicationEventListener: TSourceFileConfiguratorFn = (
  _p
) => {};
const buildProviderApplicationService: TSourceFileConfiguratorFn = (_p) => {};
const buildProviderApplicationUseCase: TSourceFileConfiguratorFn = (_p) => {};
const buildProviderDomainEntity: TSourceFileConfiguratorFn = (_p) => {};
const buildProviderDomainService: TSourceFileConfiguratorFn = (p) => {
  return templateDomainServiceFiller(p.templateParams);
};
const buildProviderDomainValueObject: TSourceFileConfiguratorFn = (_p) => {};
const buildProvicerInfrastructureService: TSourceFileConfiguratorFn = (
  _p
) => {};
const buildBarrelExportProvider: TSourceFileConfiguratorFn = (_p) => {};
const buildBarrelExportInfrastructureLayer: TSourceFileConfiguratorFn = (
  _p
) => {};
const buildBarrelExportApplicationLayer: TSourceFileConfiguratorFn = (_p) => {};
const buildBarrelExportDomainLayer: TSourceFileConfiguratorFn = (_p) => {};
const buildBarrelExportDomainRoot: TSourceFileConfiguratorFn = (_p) => {};
const buildBarrelExportAlphaDomainRoot: TSourceFileConfiguratorFn = (_p) => {};
const buildBarrelExportBetaDomainRoot: TSourceFileConfiguratorFn = (_p) => {};
const buildBarrelExportGammDomainRoot: TSourceFileConfiguratorFn = (_p) => {};

function buildPathsToFileContent(p: {
  alphaDomain: string;
  betaDomain: string;
  gammaDomain: string;
  providerName: string;
  pwd: string;
  refactorType: TExtractRefactorTypes;
}): TPathsToFileContentObj[] {
  const extractRefactorTypesToYankPaths: Record<
    TExtractRefactorTypes,
    string[][]
  > = {
    [extractRefactorTypes.APPLICATION_SERVICE]: [
      ["index"],
      ["application", "index"],
      ["application", "service"],
    ],
    [extractRefactorTypes.APPLICATION_USECASE]: [
      ["index"],
      ["application", "index"],
      ["application", "usecase"],
    ],
    [extractRefactorTypes.DOMAIN_ENTITY]: [
      ["index"],
      ["domain", "index"],
      ["domain", "entity"],
    ],
    [extractRefactorTypes.DOMAIN_SERVICE]: [
      ["index"],
      ["domain", "index"],
      ["domain", "service"],
    ],
    [extractRefactorTypes.DOMAIN_VALUEOBJECT]: [
      ["index"],
      ["domain", "index"],
      ["domain", "valueobject"],
    ],
    [extractRefactorTypes.INFRASTRUCTURE_SERVICE]: [
      ["index"],
      ["infrastructure", "index"],
      ["infrastructure", "service"],
    ],
  };
  const _almostDomainShapeConfig: TDomainShapeConfig = {
    application: {
      eventListener: {
        index: buildBarrelExportProvider,
        [p.providerName]: buildProviderApplicationEventListener,
      },
      index: buildBarrelExportApplicationLayer,
      service: {
        index: buildBarrelExportProvider,
        [p.providerName]: buildProviderApplicationService,
      },
      useCase: {
        index: buildBarrelExportProvider,
        [p.providerName]: buildProviderApplicationUseCase,
      },
    },
    domain: {
      entity: {
        index: buildBarrelExportProvider,
        [p.providerName]: buildProviderDomainEntity,
      },
      index: buildBarrelExportDomainLayer,
      service: {
        index: buildBarrelExportProvider,
        [p.providerName]: buildProviderDomainService,
      },
      valueObject: {
        index: buildBarrelExportProvider,
        [p.providerName]: buildProviderDomainValueObject,
      },
    },
    index: buildBarrelExportDomainRoot,
    infrastructure: {
      index: buildBarrelExportInfrastructureLayer,
      service: {
        index: buildBarrelExportProvider,
        [p.providerName]: buildProvicerInfrastructureService,
      },
    },
  };
  const pathsToYank = extractRefactorTypesToYankPaths[p.refactorType];
  const almostDomainShapeConfig = yankPathsFromObj(
    pathsToYank,
    _almostDomainShapeConfig
  );
  const wouldBeBetaDomainConfig: TDomainShapeConfigBeta = {
    [p.betaDomain]: almostDomainShapeConfig,
    index: buildBarrelExportBetaDomainRoot,
  };
  const wouldBeGammDomainConfig: TDomainShapeConfigGamma = {
    [p.betaDomain]: {
      [p.gammaDomain]: almostDomainShapeConfig,
      index: buildBarrelExportGammDomainRoot,
    },
    index: buildBarrelExportBetaDomainRoot,
  };

  const domainShapeConfig: TDomainShapeConfigAlpha = {
    index: buildBarrelExportAlphaDomainRoot,
    [p.alphaDomain]: p.gammaDomain
      ? wouldBeGammDomainConfig
      : wouldBeBetaDomainConfig,
  };
  const pathsToFileContent: TPathsToFileContentObj[] = [];
  function runner(
    o:
      | TDomainShapeConfig
      | TDomainShapeConfigAlpha
      | TDomainShapeConfigBeta
      | TDomainShapeConfigGamma,
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
  runner(domainShapeConfig, []);
  return pathsToFileContent;
}

const buildSymbolBundle = (identiferNode: Identifier) => {
  const identiferNodeSourceFilePath = identiferNode
    .getSourceFile()
    .getFilePath();
  const identifierNodeText = identiferNode.getText();
  const identifierNodeStart = identiferNode.getStart();
  const identifierNodeEnd = identiferNode.getEnd();
  const identifierNodeKind = identiferNode.getKindName();
  const identiferNodeLineText = identiferNode
    .getSourceFile()
    .getText()
    .split("\n")[identiferNode.getEndLineNumber() - 1];
  const identifierSymbol = identiferNode.getSymbol();
  const identifierSymbolName = identifierSymbol.getName();
  const declarationNode = identifierSymbol.getDeclarations()[0];
  const declarationNodeText = declarationNode.getText();
  const declarationNodePosStart = declarationNode.getStart();
  const declarationNodePosEnd = declarationNode.getEnd();
  const declarationSourceFilePath = declarationNode
    .getSourceFile()
    .getFilePath();
  const declarationNodeLineText = declarationNode
    .getSourceFile()
    .getText()
    .split("\n")[declarationNode.getEndLineNumber() - 1];
  const symbolTypeAtLocation =
    identifierSymbol.getTypeAtLocation(identiferNode);
  const symbolTypeAtLocationText = symbolTypeAtLocation.getText();
  const symbolType = identifierSymbol.getDeclaredType();
  const symbolFlags = identifierSymbol.getFlags();
  const symbolFlagsText = SymbolFlags[identifierSymbol.getFlags()];
  const symbbolTypeText = symbolType.getText();
  return {
    declarationNodeLineText,
    declarationNodePosEnd,
    declarationNodePosStart,
    declarationNodeText,
    declarationSourceFilePath,
    identiferNodeLineText,
    identiferNodeSourceFilePath,
    identifierNodeEnd,
    identifierNodeKind,
    identifierNodeStart,
    identifierNodeText,
    identifierSymbolName,
    symbbolTypeText,
    symbolFlags,
    symbolFlagsText,
    symbolTypeAtLocationText,
  };
};

type TExtractFunctionParams = {
  cursorPos: number;
  targetFilePath: string;
  writeFileConfigs: {
    alphaDomain: string;
    betaDomain: string;
    gammaDomain: string;
    providerIdentifierPath: string;
    providerName: string;
    pwd: string;
    refactorType: TExtractRefactorTypes;
  };
};
const extractFunction = async ({
  cursorPos,
  targetFilePath,
  writeFileConfigs,
}: TExtractFunctionParams) => {
  const sourceFile = project.getSourceFileOrThrow(targetFilePath);
  const descAtPos = sourceFile.getDescendantAtPos(cursorPos);
  const targetDescendantVariableStatement =
    descAtPos.getFirstAncestorByKindOrThrow(SyntaxKind.VariableStatement);

  const targetDescendantIdentifier =
    targetDescendantVariableStatement.getFirstDescendantByKindOrThrow(
      SyntaxKind.Identifier
    );

  const targetDescendantIdentifierTypeSymbol =
    targetDescendantIdentifier.getSymbol();
  const targetDescendantIdentifierName =
    targetDescendantIdentifierTypeSymbol.getName();
  const targetDescendantIdentifierType = targetDescendantIdentifierTypeSymbol
    .getTypeAtLocation(targetDescendantIdentifier)
    .getText();

  const symbolFlagsWeKeep = [
    SymbolFlags.BlockScopedVariable,
    SymbolFlags.FunctionScopedVariable,
    SymbolFlags.AliasExcludes,
    SymbolFlags.TypeAlias,
  ];

  const identifiers = targetDescendantVariableStatement.getDescendantsOfKind(
    SyntaxKind.Identifier
  );
  const allSymbolBundles = identifiers.map((i) => {
    return buildSymbolBundle(i);
  });
  const filteredSymbolBundles = allSymbolBundles.filter((b) =>
    symbolFlagsWeKeep.includes(b.symbolFlags)
  );
  const symbolBundlesDeclaredOutsideIdentifier = filteredSymbolBundles.filter(
    (b) => {
      return !targetDescendantVariableStatement.containsRange(
        b.declarationNodePosStart,
        b.declarationNodePosEnd
      );
    }
  );

  const finalParamBlob = `{
    ${symbolBundlesDeclaredOutsideIdentifier.reduce((acc, next) => {
      return `${acc + next.identifierSymbolName},`;
    }, "")}
  }`;
  const finalParamBlobType = `{
${symbolBundlesDeclaredOutsideIdentifier.reduce((acc, next) => {
  switch (next.symbolFlags) {
    case SymbolFlags.BlockScopedVariable:
      return `${acc}${next.identifierSymbolName}: ${next.symbolTypeAtLocationText},`;
    default:
      console.log(
        `Excluding symbol type: ${next.symbolFlagsText}. Line text: ${next.identiferNodeLineText}`
      );
      return acc;
  }
}, "")}"BetaDomain.GammaDomain.domain.service.providerName"
}`;
  const finalFnBody = `
  ${targetDescendantVariableStatement.getText()}
  return ${targetDescendantIdentifierName};
`;

  const templateParams: TTemplateParams = {
    TEMPLATE_FN_BODY: finalFnBody,
    TEMPLATE_PARAMS_BLOB: finalParamBlob,
    TEMPLATE_PARAMS_TYPE: finalParamBlobType,
    TEMPLATE_PARAMS_TYPE_NAME: "TParams",
    TEMPLATE_PROVIDER_NAME: writeFileConfigs.providerName,
    TEMPLATE_RESPONSE_TYPE: targetDescendantIdentifierType,
    TEMPLATE_RESPONSE_TYPE_NAME: "TResponse",
  };

  const pathsToFileContent = buildPathsToFileContent(writeFileConfigs).map(
    (o) => {
      const _sf = project.getSourceFile(o.path);
      const sf = _sf || project.createSourceFile(o.path);
      const sourcefileConfig = {
        isFreshFile: !!_sf,
        sourceFile: sf,
      };
      return { ...o, content: o.content({ sourcefileConfig, templateParams }) };
    }
  );
  console.dir({ pathsToFileContent }, { depth: 10 });
};
// Testy
const providerIdentifierPath =
  "BetaDomain.GammaDomain.domain.service.providerName";
const refactorType = (() => {
  if (providerIdentifierPath.includes("domain.service")) {
    return extractRefactorTypes.DOMAIN_SERVICE;
  }
  if (providerIdentifierPath.includes("domain.entity")) {
    return extractRefactorTypes.DOMAIN_ENTITY;
  }
  if (providerIdentifierPath.includes("domain.valueObject")) {
    return extractRefactorTypes.DOMAIN_VALUEOBJECT;
  }
  if (providerIdentifierPath.includes("application.useCase")) {
    return extractRefactorTypes.APPLICATION_USECASE;
  }
  if (providerIdentifierPath.includes("application.service")) {
    return extractRefactorTypes.APPLICATION_SERVICE;
  }
  if (providerIdentifierPath.includes("infrastructure.service")) {
    return extractRefactorTypes.INFRASTRUCTURE_SERVICE;
  }
  throw new Error("Bad providerIdentifierPath");
})();

extractFunction({
  cursorPos: 322,
  targetFilePath:
    "/Users/willdembinski/projects/seso-refactors/src/test/test-project/ddd/BetaDomain/application/service/testApplicationService.ts",
  writeFileConfigs: {
    alphaDomain: "ddd",
    betaDomain: "BetaDomain",
    gammaDomain: "GammaDomain",
    providerIdentifierPath,
    providerName: "providerName",
    pwd: "/Users/willdembinski/projects/seso-refactors/src/test/test-project",
    refactorType,
  },
});
