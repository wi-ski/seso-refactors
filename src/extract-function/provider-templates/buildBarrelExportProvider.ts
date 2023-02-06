import type { TSourceFileConfiguratorFn } from "../constants";

export const buildBarrelExportProvider: TSourceFileConfiguratorFn = (p) => {
  const exportStatement = `export * from "./${p.writeFileConfigs.providerName}";`;
  const statements = p.sourcefileConfig.sourceFile.getStatements();
  const containsExportAlready = statements.some(
    (s) => s.getText() === exportStatement
  );
  if (containsExportAlready) {
    throw new Error("File has export statement already.");
  }
  p.sourcefileConfig.sourceFile.addStatements(exportStatement);
};
