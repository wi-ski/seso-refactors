import { extractRefactorTypes } from "../constants";

import type { TSourceFileConfiguratorFn } from "../constants";

export const buildBarrelExportDomainRoot: TSourceFileConfiguratorFn = (p) => {
  let exportStatement = "";
  switch (p.argsContext.refactorType) {
    case extractRefactorTypes.APPLICATION_SERVICE:
    case extractRefactorTypes.APPLICATION_EVENTLISTENER:
    case extractRefactorTypes.APPLICATION_USECASE:
      exportStatement = `export * as application from "./application";`;
      break;
    case extractRefactorTypes.DOMAIN_ENTITY:
    case extractRefactorTypes.DOMAIN_SERVICE:
    case extractRefactorTypes.DOMAIN_VALUEOBJECT:
      exportStatement = `export * as domain from "./domain";`;
      break;
    case extractRefactorTypes.INFRASTRUCTURE_SERVICE:
      exportStatement = `export * as infrastructure from "./infrastructure";`;
      break;
    default:
      throw new Error("Bad refactor type.");
  }
  const statements = p.sourcefileConfig.sourceFile.getStatements();
  const containsExportAlready = statements.some(
    (s) => s.getText() === exportStatement
  );
  if (containsExportAlready) {
    return;
  }
  p.sourcefileConfig.sourceFile.addStatements(exportStatement);
};
