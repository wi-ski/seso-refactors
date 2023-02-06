import { Project, SymbolFlags, SyntaxKind } from "ts-morph";

import { buildPathsToFileContent } from "./buildPathsToFileContent";
import { buildSymbolBundle } from "./buildSymbolBundle";
import { extractRefactorTypes } from "./constants";

import type { TExtractFunctionParams, TTemplateParams } from "./constants";

const project = new Project({
  tsConfigFilePath:
    "/Users/willdembinski/projects/seso-refactors/tsconfig.json",
});

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
    TEMPLATE_PROVIDER_NAME: writeFileConfigs.providerName,
    TEMPLATE_RESPONSE_TYPE: targetDescendantIdentifierType,
    TEMPLATE_RESPONSE_TYPE_NAME: "TResponse",
  };

  const pathsToFileContent = buildPathsToFileContent(writeFileConfigs).map(
    (o) => {
      const _sf = project.getSourceFile(o.path);
      const sf = _sf || project.createSourceFile(o.path);
      const sourcefileConfig = {
        isFreshFile: !_sf,
        sourceFile: sf,
      };
      return {
        ...o,
        content: o.content({
          sourcefileConfig,
          templateParams,
          writeFileConfigs,
        }),
      };
    }
  );
  console.dir({ pathsToFileContent }, { depth: 10 });
  return project.save();
};
// Testy
// Testy
// Testy
const providerIdentifierPath =
  "BetaDomain.GammaDomain.domain.service.providerName";
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
// const providerIdentifierPath =
//   "BetaDomain.GammaDomain.infrastructure.service.providerName";
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
