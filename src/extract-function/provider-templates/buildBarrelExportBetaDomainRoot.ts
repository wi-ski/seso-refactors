import { buildBarrelExportDomainRoot } from "./buildBarrelExportDomainRoot";

import type { TSourceFileConfiguratorFn } from "../constants";

export const buildBarrelExportBetaDomainRoot: TSourceFileConfiguratorFn = (
  p
) => {
  if (p.writeFileConfigs.gammaDomain) {
    const exportStatement = `export * as ${p.writeFileConfigs.gammaDomain} from "./${p.writeFileConfigs.gammaDomain}";`;
    const statements = p.sourcefileConfig.sourceFile.getStatements();

    const containsExportAlready = statements.some((s) => {
      return s.getText() === exportStatement;
    });
    if (containsExportAlready) {
      return;
    }
    p.sourcefileConfig.sourceFile.addStatements(exportStatement);
  } else {
    throw new Error(
      "Shouldnt get here - control flow is handled by shapes of contentObjs"
    );
  }
};
