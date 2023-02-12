import type { TSourceFileConfiguratorFn } from "../constants";

export const buildBarrelExportAlphaDomainRoot: TSourceFileConfiguratorFn = (
  p
) => {
  const {
    argsContext: { betaDomain },
    sourcefileContext: { fileContent, isFreshFile },
  } = p;
  const exportStatement = `export * as ${betaDomain} from "./${betaDomain}";`;
  const statements = p.sourcefileContext.fileContent.split("\n");
  const containsExportAlready = statements.some((s) => s === exportStatement);
  const newFileContent = [...statements, exportStatement].join("\n");
  if (isFreshFile) return exportStatement;
  if (containsExportAlready) return fileContent;
  return newFileContent;
};
