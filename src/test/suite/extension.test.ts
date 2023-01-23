// import * as assert from "assert";

// import * as vscode from "vscode";

// import { buildArgsFromDomainTypePath } from "../../helpers";

// const pwd = "/Users/willdembinski/projects/seso-app";
suite("buildArgsFromDomainTypePath Test Suite", () => {
  // vscode.window.showInformationMessage("Start all tests.");
  // test("Single Nested", () => {
  //   const proposedTypeReferenceChain =
  //     "TSeso.TD.Gamma.Application.DTO.TCreateDocumentDTO";
  //   const result = buildArgsFromDomainTypePath({
  //     proposedTypeReferenceChain,
  //     pwd,
  //   });
  //   assert(
  //     result._proposedTypeReferenceChain ===
  //       "TSeso.TD.Gamma.Application.DTO.TCreateDocumentDTO"
  //   );
  //   assert(result.domainNameAlpha === "ddd");
  //   assert(
  //     result.domainNameAlphaBarrelExportRelativeImportPath === "./Gamma/types"
  //   );
  //   assert(
  //     result.domainNameAlphaBarrelExportRootDirPath ===
  //       "/Users/willdembinski/projects/seso-app/ddd"
  //   );
  //   assert(
  //     result.domainNameAlphaBarrelExportRootFileFullExportStatement ===
  //       'export * as Gamma from "./Gamma/types";'
  //   );
  //   assert(
  //     result.domainNameAlphaBarrelExportRootFilePath ===
  //       "/Users/willdembinski/projects/seso-app/ddd/types.ts"
  //   );
  //   assert(result.domainNameBeta === "Gamma");
  //   assert(
  //     result.domainNameBetaBarrelExportRelativeImportPath ===
  //       "./application/types"
  //   );
  //   assert(
  //     result.domainNameBetaBarrelExportRootDirPath ===
  //       "/Users/willdembinski/projects/seso-app/ddd/Gamma"
  //   );
  //   assert(
  //     result.domainNameBetaBarrelExportRootFileFullExportStatement ===
  //       'export * as Application from "./application/types";'
  //   );
  //   assert(
  //     result.domainNameBetaBarrelExportRootFilePath ===
  //       "/Users/willdembinski/projects/seso-app/ddd/Gamma/types.ts"
  //   );
  //   assert(result.domainNameGamma === null);
  //   assert(result.domainNameGammaBarrelExportRootDirPath === null);
  //   assert(result.domainNameGammaBarrelExportRootFilePath === null);
  //   assert(result.domainNameGammaBarrelFullExportStatement === null);
  //   assert(result.domainNameZeta === "Gamma");
  //   assert(result.domainNameZetaBarrelExportRelativeImportPath === "./DTO");
  //   assert(
  //     result.domainNameZetaBarrelExportRootDirPath ===
  //       "/Users/willdembinski/projects/seso-app/ddd/Gamma"
  //   );
  //   assert(
  //     result.domainNameZetaBarrelExportSuperRootFileFullExportStatement ===
  //       'export * as DTO from "./DTO";'
  //   );
  //   assert(
  //     result.domainNameZetaBarrelExportRootFilePath ===
  //       "/Users/willdembinski/projects/seso-app/ddd/Gamma/types.ts"
  //   );
  //   assert(
  //     result.domainNameZetaExportSuperRootDirPath ===
  //       "/Users/willdembinski/projects/seso-app/ddd/Gamma"
  //   );
  //   assert(
  //     result.domainNameZetaSuperRootBarrelExportRootFilePath ===
  //       "/Users/willdembinski/projects/seso-app/ddd/Gamma/application/types/index.ts"
  //   );
  //   assert(
  //     result.domainNameZetaSuperRootDirPath ===
  //       "/Users/willdembinski/projects/seso-app/ddd/Gamma/application/types"
  //   );
  //   assert(
  //     result.domainNameZetaSuperRootTypeDefinitionFilePath ===
  //       "/Users/willdembinski/projects/seso-app/ddd/Gamma/application/types/DTO.ts"
  //   );
  // });
  // test("Double Nested", () => {
  //   const proposedTypeReferenceChain =
  //     "TSeso.TD.Gamma.Beta.Application.DTO.TCreateDocumentDTO";
  //   const result = buildArgsFromDomainTypePath({
  //     proposedTypeReferenceChain,
  //     pwd,
  //   });
  //   assert(
  //     (result._proposedTypeReferenceChain =
  //       "TSeso.TD.Gamma.Beta.Application.DTO.TCreateDocumentDTO")
  //   );
  //   assert((result.domainNameAlpha = "ddd"));
  //   assert(
  //     (result.domainNameAlphaBarrelExportRelativeImportPath = "./Gamma/types")
  //   );
  //   assert(
  //     (result.domainNameAlphaBarrelExportRootDirPath =
  //       "/Users/willdembinski/projects/seso-app/ddd")
  //   );
  //   assert(
  //     (result.domainNameAlphaBarrelExportRootFileFullExportStatement =
  //       'export * as Gamma from "./Gamma/types";')
  //   );
  //   assert(
  //     (result.domainNameAlphaBarrelExportRootFilePath =
  //       "/Users/willdembinski/projects/seso-app/ddd/types.ts")
  //   );
  //   assert((result.domainNameBeta = "Gamma"));
  //   assert(
  //     (result.domainNameBetaBarrelExportRelativeImportPath = "./Beta/types;")
  //   );
  //   assert(
  //     (result.domainNameBetaBarrelExportRootDirPath =
  //       "/Users/willdembinski/projects/seso-app/ddd/Gamma")
  //   );
  //   assert(
  //     (result.domainNameBetaBarrelExportRootFileFullExportStatement =
  //       'export * as Beta from "./Beta/types";')
  //   );
  //   assert(
  //     (result.domainNameBetaBarrelExportRootFilePath =
  //       "/Users/willdembinski/projects/seso-app/ddd/Gamma/types.ts")
  //   );
  //   assert((result.domainNameGamma = "Beta"));
  //   assert(
  //     (result.domainNameGammaBarrelExportRootDirPath =
  //       "/Users/willdembinski/projects/seso-app/ddd/Gamma/Beta")
  //   );
  //   assert(
  //     (result.domainNameGammaBarrelExportRootFilePath =
  //       "/Users/willdembinski/projects/seso-app/ddd/Gamma/Beta/types.ts")
  //   );
  //   assert(
  //     (result.domainNameGammaBarrelFullExportStatement =
  //       'export * as Application from "./Application/types";')
  //   );
  //   assert((result.domainNameZeta = "Beta"));
  //   assert((result.domainNameZetaBarrelExportRelativeImportPath = "./DTO"));
  //   assert(
  //     (result.domainNameZetaBarrelExportRootDirPath =
  //       "/Users/willdembinski/projects/seso-app/ddd/Gamma/Beta")
  //   );
  //   assert(
  //     (result.domainNameZetaBarrelExportSuperRootFileFullExportStatement =
  //       'export * as DTO from "./DTO";')
  //   );
  //   assert(
  //     (result.domainNameZetaBarrelExportRootFilePath =
  //       "/Users/willdembinski/projects/seso-app/ddd/Gamma/Beta/types.ts")
  //   );
  //   assert(
  //     (result.domainNameZetaExportSuperRootDirPath =
  //       "/Users/willdembinski/projects/seso-app/ddd/Gamma/Beta")
  //   );
  //   assert(
  //     (result.domainNameZetaSuperRootBarrelExportRootFilePath =
  //       "/Users/willdembinski/projects/seso-app/ddd/Gamma/Beta/application/types/index.ts")
  //   );
  //   assert(
  //     (result.domainNameZetaSuperRootDirPath =
  //       "/Users/willdembinski/projects/seso-app/ddd/Gamma/Beta/application/types")
  //   );
  //   assert(
  //     (result.domainNameZetaSuperRootTypeDefinitionFilePath =
  //       "/Users/willdembinski/projects/seso-app/ddd/Gamma/Beta/application/types/DTO.ts")
  //   );
  // });
});
