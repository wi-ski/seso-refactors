import type { TSourceFileConfiguratorFn } from "../constants";

export const buildBarrelExportBetaDomainRoot: TSourceFileConfiguratorFn = (
  p
) => {
  const {
    sourcefileContext: { fileContent, isFreshFile },
  } = p;
  if (p.argsContext.gammaDomain) {
    const exportStatement = `export * as ${p.argsContext.gammaDomain} from "./${p.argsContext.gammaDomain}";`;
    const statements = p.sourcefileContext.fileContent.split("\n");
    const newFileContent = [...statements, exportStatement].join("\n");
    const containsExportAlready = statements.some((s) => {
      return s === exportStatement;
    });
    if (isFreshFile) return exportStatement;
    if (containsExportAlready) return fileContent;
    return newFileContent;
  }
  throw new Error(
    "Shouldnt get here - control flow is handled by shapes of contentObjs"
  );
};
