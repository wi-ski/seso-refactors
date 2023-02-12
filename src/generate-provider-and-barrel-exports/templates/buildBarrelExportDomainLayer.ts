import { generateableProviderTypes } from "../constants";

import type { TSourceFileConfiguratorFn } from "../constants";

export const buildBarrelExportDomainLayer: TSourceFileConfiguratorFn = (p) => {
  const {
    sourcefileContext: { fileContent, isFreshFile },
  } = p;
  let exportStatement = "";
  switch (p.argsContext.refactorType) {
    case generateableProviderTypes.DOMAIN_ENTITY:
      exportStatement = `export * as entity from "./entity";`;
      break;
    case generateableProviderTypes.DOMAIN_SERVICE:
      exportStatement = `export * as service from "./service";`;
      break;
    case generateableProviderTypes.DOMAIN_VALUEOBJECT:
      exportStatement = `export * as valueObject from "./valueObject";`;
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
