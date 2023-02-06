import type { TSourceFileConfiguratorFn } from "../constants";

export const buildBarrelExportAlphaDomainRoot: TSourceFileConfiguratorFn = (
  p
) => {
  const exportStatement = `export * as ${p.argsContext.betaDomain} from "./${p.argsContext.betaDomain}";`;
  const statements = p.sourcefileConfig.sourceFile.getStatements();
  const containsExportAlready = statements.some(
    (s) => s.getText() === exportStatement
  );
  if (containsExportAlready) {
    return;
  }
  p.sourcefileConfig.sourceFile.addStatements(exportStatement);
};
