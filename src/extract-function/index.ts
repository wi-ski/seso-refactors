import { SymbolFlags, SyntaxKind } from "ts-morph";

import { buildPathsToFileContent } from "./buildPathsToFileContent";
import { buildSymbolBundle } from "./buildSymbolBundle";
import { extractRefactorTypes } from "./constants";

import type { TArgsContext, TTemplateParams } from "./constants";
import type { Project } from "ts-morph";

type TScriptArgs = {
  alphaDomain: string;
  cursorPosition: number;
  filePath: string;
  project: Project;
  providerIdentifierPath: string;
  pwd: string;
};
export const extractFunction = async (p: TScriptArgs) => {
  const argsContext = buildArgsContext(p);
  console.log("Receiving args context");
  console.log(argsContext);
  const sourceFile = p.project.getSourceFileOrThrow(argsContext.targetFilePath);
  const descAtPos = sourceFile.getDescendantAtPos(argsContext.cursorPos);

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
    SymbolFlags.Property,
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
  const filteredSymbolBundles = allSymbolBundles.filter((b) => {
    const keepSymbol =
      symbolFlagsWeKeep.includes(b.symbolFlags) &&
      b.identifierNodeText !== "$r"; // Hack.
    if (keepSymbol) {
      console.log(`Keeping symbol: ${b.identifierNodeText}`);
      console.log(b);
      console.log(`Is type: ${b.symbolFlagsText}`);
      console.log(`Full Line: ${b.identiferNodeLineText}`);
      return true;
    }
    console.warn(`Skipping symbol: ${b.identifierNodeText}`);
    console.warn(`Is type: ${b.symbolFlagsText}`);
    console.warn(`Full Line: ${b.identiferNodeLineText}`);

    return false;
  });
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
}, "")}
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
    TEMPLATE_PROVIDER_NAME: argsContext.providerName,
    TEMPLATE_RESPONSE_TYPE: targetDescendantIdentifierType,
    TEMPLATE_RESPONSE_TYPE_NAME: "TResponse",
  };

  const pathsToFileContent = buildPathsToFileContent(argsContext).map((o) => {
    const _sf = p.project.getSourceFile(o.path);
    const sf = _sf || p.project.createSourceFile(o.path);
    const sourcefileConfig = {
      isFreshFile: !_sf,
      sourceFile: sf,
    };
    return {
      ...o,
      _content: o.content,
      content: o.content({
        argsContext,
        sourcefileConfig,
        templateParams,
      }),
    };
  });
  console.dir({ pathsToFileContent }, { depth: 10 });
  return p.project.save();
};

function buildArgsContext({
  alphaDomain,
  cursorPosition,
  filePath,
  project,
  providerIdentifierPath,
  pwd,
}: TScriptArgs): TArgsContext {
  // const providerIdentifierPath = "FOOO.BAR.infrastructure.service.providerName";
  const split = providerIdentifierPath.split(".");
  const providerName = String(providerIdentifierPath.split(".").pop());
  const betaDomain = split[0];
  const gammaDomain = split.length > 4 ? split[1] : null;
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
    if (providerIdentifierPath.includes("application.eventListener")) {
      return extractRefactorTypes.APPLICATION_EVENTLISTENER;
    }
    if (providerIdentifierPath.includes("application.service")) {
      return extractRefactorTypes.APPLICATION_SERVICE;
    }
    if (providerIdentifierPath.includes("infrastructure.service")) {
      return extractRefactorTypes.INFRASTRUCTURE_SERVICE;
    }
    throw new Error("Bad providerIdentifierPath");
  })();

  return {
    alphaDomain,
    betaDomain,
    cursorPos: cursorPosition,
    gammaDomain: gammaDomain || null,
    project,
    providerIdentifierPath,
    providerName,
    pwd,
    refactorType,
    targetFilePath: filePath,
  };
}
// Testy
// Testy
// Testy
// const providerIdentifierPath =
//   "BetaDomain.GammaDomain.domain.service.providerName";
// const providerIdentifierPath =
//   "BetaDomain.GammaDomain.domain.valueObject.providerName";
// const providerIdentifierPath =
//   "BetaDomain.GammaDomain.domain.entity.providerName";
// const providerIdentifierPath =
//   "BetaDomain.GammaDomain.application.service.providerName";
// const providerIdentifierPath =
//   "BetaDomain.GammaDomain.application.useCase.providerName";
// const providerIdentifierPath =
//   "BetaDomain.GammaDomain.application.eventListener.providerName";

// const project = new Project({
//   tsConfigFilePath:
//     "/Users/willdembinski/projects/seso-refactors/tsconfig.json",
// });
// extractFunction({
//   cursorPos: 322,
//   project,
//   targetFilePath:
//     "/Users/willdembinski/projects/seso-refactors/src/test/test-project/ddd/BetaDomain/application/service/testApplicationService.ts",
//   writeFileConfigs: {
//     alphaDomain: "ddd",
//     betaDomain,
//     gammaDomain,
//     providerIdentifierPath,
//     providerName: "providerName",
//     pwd: "/Users/willdembinski/projects/seso-refactors/src/test/test-project",
//     refactorType,
//   },
// });
