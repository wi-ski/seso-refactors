import { extractRefactorTypes } from "../constants";

import type { TSourceFileConfiguratorFn } from "../constants";

export const buildBarrelExportApplicationLayer: TSourceFileConfiguratorFn = (
  p
) => {
  let exportStatement = "";
  switch (p.writeFileConfigs.refactorType) {
    case extractRefactorTypes.APPLICATION_SERVICE:
    case extractRefactorTypes.APPLICATION_USECASE:
      exportStatement = `export * as application from "./application"`;
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
