import type { TSourceFileConfiguratorFn } from "../constants";

export const buildBarrelExportGammaDomainRoot: TSourceFileConfiguratorFn = (
  p
) => {
  const {
    sourcefileContext: { fileContent, isFreshFile },
  } = p;
  if (p.argsContext.gammaDomain) {
    const exportStatement = `export * as ${p.argsContext.gammaDomain} from "./${p.argsContext.gammaDomain}";`;
    const statements = p.sourcefileContext.fileContent.split("\n");
    const containsExportAlready = statements.some((s) => s === exportStatement);
    const newFileContent = [...statements, exportStatement].join("\n");
    if (containsExportAlready) return fileContent;
    if (isFreshFile) return exportStatement;
    return newFileContent;
  }
  throw new Error("Bad GammaDomain Root Export");
};
