import { buildBarrelExportDomainRoot } from "./buildBarrelExportDomainRoot";

import type { TSourceFileConfiguratorFn } from "../constants";

export const buildBarrelExportBetaDomainRoot: TSourceFileConfiguratorFn = (
  p
) => {
  if (p.writeFileConfigs.gammaDomain) {
    const exportStatement = `export * as ${p.writeFileConfigs.gammaDomain} from "./${p.writeFileConfigs.gammaDomain}";`;
    const statements = p.sourcefileConfig.sourceFile.getStatements();
    console.log({ exportStatement });
    console.log({ exportStatement });
    console.log({ exportStatement });
    console.log({ exportStatement });
    const containsExportAlready = statements.some((s) => {
      console.log({ SSSSSS: s });
      return s.getText() === exportStatement;
    });
    if (containsExportAlready) {
      return;
    }
    p.sourcefileConfig.sourceFile.addStatements(exportStatement);
  } else {
    return buildBarrelExportDomainRoot(p);
  }
};
