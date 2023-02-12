import type { TSourceFileConfiguratorFn } from "../constants";

export const buildBarrelExportGammaDomainRoot: TSourceFileConfiguratorFn = (
  p
) => {
  if (p.argsContext.gammaDomain) {
    const exportStatement = `export * as ${p.argsContext.gammaDomain} from "./${p.argsContext.gammaDomain}";`;
    const statements = p.sourcefileConfig.sourceFile.getStatements();
    const containsExportAlready = statements.some(
      (s) => s.getText() === exportStatement
    );
    if (containsExportAlready) {
      return;
    }
    p.sourcefileConfig.sourceFile.addStatements(exportStatement);
  } else {
    throw new Error("Bad GammaDomain Root Export");
  }
};
