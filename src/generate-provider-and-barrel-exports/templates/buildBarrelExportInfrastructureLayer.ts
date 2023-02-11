import type { TSourceFileConfiguratorFn } from "../constants";

export const buildBarrelExportInfrastructureLayer: TSourceFileConfiguratorFn = (
  p
) => {
  // const exportStatement = `export * as service from "./service";`;
  // const statements = p.sourcefileContext.sourceFile.getStatements();
  // const containsExportAlready = statements.some(
  //   (s) => s.getText() === exportStatement
  // );
  // if (containsExportAlready) {
  //   return;
  // }
  // p.sourcefileContext.sourceFile.addStatements(exportStatement);
};
