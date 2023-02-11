import { generateableProviderTypes } from "../constants";

import type { TSourceFileConfiguratorFn } from "../constants";

export const buildBarrelExportDomainLayer: TSourceFileConfiguratorFn = (p) => {
  // let exportStatement = "";
  // switch (p.argsContext.refactorType) {
  //   case extractRefactorTypes.DOMAIN_ENTITY:
  //     exportStatement = `export * as entity from "./entity";`;
  //     break;
  //   case extractRefactorTypes.DOMAIN_SERVICE:
  //     exportStatement = `export * as service from "./service";`;
  //     break;
  //   case extractRefactorTypes.DOMAIN_VALUEOBJECT:
  //     exportStatement = `export * as valueObject from "./valueObject";`;
  //     break;
  //   default:
  //     throw new Error("Bad refactor type.");
  // }
  // const statements = p.sourcefileContext.sourceFile.getStatements();
  // const containsExportAlready = statements.some(
  //   (s) => s.getText() === exportStatement
  // );
  // if (containsExportAlready) {
  //   return;
  // }
  // p.sourcefileContext.sourceFile.addStatements(exportStatement);
};
