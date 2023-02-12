import type { TSourceFileConfiguratorFn } from "../constants";

export const buildBarrelExportProvider: TSourceFileConfiguratorFn = (p) => {
  const exportStatement = `export * from "./${p.argsContext.providerName}";`;
  const statements = p.sourcefileConfig.sourceFile.getStatements();
  const containsExportAlready = statements.some(
    (s) => s.getText() === exportStatement
  );
  if (containsExportAlready) {
    return console.log(
      `Skipping exiting import (${exportStatement}) for SourceFile: ${p.sourcefileConfig.sourceFile.getFilePath()}`
    );
  }
  p.sourcefileConfig.sourceFile.addStatements(exportStatement);
};
