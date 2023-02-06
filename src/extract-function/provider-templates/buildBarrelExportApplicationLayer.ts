import { extractRefactorTypes } from "../constants";

import type { TSourceFileConfiguratorFn } from "../constants";

export const buildBarrelExportApplicationLayer: TSourceFileConfiguratorFn = (
  p
) => {
  let exportStatement = "";
  switch (p.writeFileConfigs.refactorType) {
    case extractRefactorTypes.APPLICATION_SERVICE:
      exportStatement = `export * as service from "./service";`;
      break;
    case extractRefactorTypes.APPLICATION_USECASE:
      exportStatement = `export * as useCase from "./useCase";`;
      break;
    case extractRefactorTypes.APPLICATION_EVENTLISTENER:
      exportStatement = `export * as eventListener from "./eventListener";`;
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
