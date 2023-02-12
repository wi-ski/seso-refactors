import type { TSourceFileConfiguratorFn } from "../constants";

export const buildBarrelExportProvider: TSourceFileConfiguratorFn = (p) => {
  const {
    sourcefileContext: { fileContent, isFreshFile },
  } = p;
  const exportStatement = `export * from "./${p.argsContext.providerName}";`;
  const statements = p.sourcefileContext.fileContent.split("\n");
  const containsExportAlready = statements.some((s) => s === exportStatement);
  const newFileContent = [...statements, exportStatement].join("\n");
  if (containsExportAlready) return fileContent;
  if (isFreshFile) return exportStatement;
  return newFileContent;
};
