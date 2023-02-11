import type { TSourceFileConfiguratorFn } from "../constants";

export const buildBarrelExportBetaDomainRoot: TSourceFileConfiguratorFn = (
  p
) => {
  // if (p.argsContext.gammaDomain) {
  //   const exportStatement = `export * as ${p.argsContext.gammaDomain} from "./${p.argsContext.gammaDomain}";`;
  //   const statements = p.sourcefileContext.sourceFile.getStatements();
  //   const containsExportAlready = statements.some((s) => {
  //     return s.getText() === exportStatement;
  //   });
  //   if (containsExportAlready) {
  //     return;
  //   }
  //   p.sourcefileContext.sourceFile.addStatements(exportStatement);
  // } else {
  //   throw new Error(
  //     "Shouldnt get here - control flow is handled by shapes of contentObjs"
  //   );
  // }
};
