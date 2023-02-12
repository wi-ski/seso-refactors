import { generateableProviderTypes } from "../constants";

import type { TSourceFileConfiguratorFn } from "../constants";

export const buildBarrelExportApplicationLayer: TSourceFileConfiguratorFn = (
  p
) => {
  const {
    sourcefileContext: { fileContent, isFreshFile },
  } = p;
  let exportStatement = "";
  switch (p.argsContext.refactorType) {
    case generateableProviderTypes.APPLICATION_SERVICE:
      exportStatement = `export * as service from "./service";`;
      break;
    case generateableProviderTypes.APPLICATION_DTO:
      exportStatement = `export * as dto from "./dto";`;
      break;
    case generateableProviderTypes.APPLICATION_USECASE:
      exportStatement = `export * as useCase from "./useCase";`;
      break;
    case generateableProviderTypes.APPLICATION_EVENTLISTENER:
      exportStatement = `export * as eventListener from "./eventListener";`;
      break;
    default:
      throw new Error("Bad refactor type: buildBarrelExportApplicationLayer");
  }

  const statements = p.sourcefileContext.fileContent.split("\n");
  const containsExportAlready = statements.some((s) => s === exportStatement);
  const newFileContent = [...statements, exportStatement].join("\n");
  if (isFreshFile) return exportStatement;
  if (containsExportAlready) return fileContent;
  return newFileContent;
};
