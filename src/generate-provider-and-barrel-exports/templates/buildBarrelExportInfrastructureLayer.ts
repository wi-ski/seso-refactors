import type { TSourceFileConfiguratorFn } from "../constants";

export const buildBarrelExportInfrastructureLayer: TSourceFileConfiguratorFn = (
  p
) => {
  const {
    sourcefileContext: { fileContent, isFreshFile },
  } = p;
  const exportStatement = `export * as service from "./service";`;
  const statements = p.sourcefileContext.fileContent.split("\n");
  const containsExportAlready = statements.some((s) => s === exportStatement);
  const newFileContent = [...statements, exportStatement].join("\n");
  if (containsExportAlready) return fileContent;
  if (isFreshFile) return exportStatement;
  return newFileContent;
};
