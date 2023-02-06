import type { TSourceFileConfiguratorFn } from "../constants";

export const buildBarrelExportAlphaDomainRoot: TSourceFileConfiguratorFn = (
  p
) => {
  const exportStatement = `export * as ${p.writeFileConfigs.betaDomain} from "./${p.writeFileConfigs.betaDomain}";`;
  const statements = p.sourcefileConfig.sourceFile.getStatements();
  const containsExportAlready = statements.some(
    (s) => s.getText() === exportStatement
  );
  if (containsExportAlready) {
    return;
  }
  p.sourcefileConfig.sourceFile.addStatements(exportStatement);
};
