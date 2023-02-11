import type { TSourceFileConfiguratorFn } from "../constants";

export const buildBarrelExportProvider: TSourceFileConfiguratorFn = (p) => {
  // const exportStatement = `export * from "./${p.argsContext.providerName}";`;
  // const statements = p.sourcefileContext.sourceFile.getStatements();
  // const containsExportAlready = statements.some(
  //   (s) => s.getText() === exportStatement
  // );
  // if (containsExportAlready) {
  //   return console.log(
  //     `Skipping exiting import (${exportStatement}) for SourceFile: ${p.sourcefileContext.sourceFile.getFilePath()}`
  //   );
  // }
  // p.sourcefileContext.sourceFile.addStatements(exportStatement);
};
