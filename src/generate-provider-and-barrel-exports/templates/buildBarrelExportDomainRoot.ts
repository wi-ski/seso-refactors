import { generateableProviderTypes } from "../constants";

import type { TSourceFileConfiguratorFn } from "../constants";

export const buildBarrelExportDomainRoot: TSourceFileConfiguratorFn = (p) => {
  const {
    sourcefileContext: { fileContent, isFreshFile },
  } = p;
  let exportStatement = "";
  switch (p.argsContext.refactorType) {
    case generateableProviderTypes.APPLICATION_SERVICE:
    case generateableProviderTypes.APPLICATION_EVENTLISTENER:
    case generateableProviderTypes.APPLICATION_USECASE:
    case generateableProviderTypes.APPLICATION_DTO:
      exportStatement = `export * as application from "./application";`;
      break;
    case generateableProviderTypes.DOMAIN_ENTITY:
    case generateableProviderTypes.DOMAIN_SERVICE:
    case generateableProviderTypes.DOMAIN_VALUEOBJECT:
      exportStatement = `export * as domain from "./domain";`;
      break;
    case generateableProviderTypes.INFRASTRUCTURE_SERVICE:
      exportStatement = `export * as infrastructure from "./infrastructure";`;
      break;
    default:
      throw new Error("Bad refactor type.");
  }
  const statements = p.sourcefileContext.fileContent.split("\n");
  const containsExportAlready = statements.some((s) => s === exportStatement);
  const newFileContent = [...statements, exportStatement].join("\n");
  if (isFreshFile) return exportStatement;
  if (containsExportAlready) return fileContent;
  return newFileContent;
};
