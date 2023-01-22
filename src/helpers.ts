import * as path from "path";

import type { SourceFile } from "ts-morph";

type TSourceFileConfiguratorFn = (f: SourceFile) => void;
export type TDomainShapeConfig = {
  application?: {
    types: {
      "DTO.ts": TSourceFileConfiguratorFn;
      "index.ts": TSourceFileConfiguratorFn;
    };
  };
  domain?: {
    types: {
      "Entity.ts"?: TSourceFileConfiguratorFn;
      "ValueObject.ts"?: TSourceFileConfiguratorFn;
      "index.ts": TSourceFileConfiguratorFn;
    };
  };
  infrastructure?: {
    types: {
      "Schema.ts": TSourceFileConfiguratorFn;
      "index.ts": TSourceFileConfiguratorFn;
    };
  };
};
type TPathsToFileContentObj = {
  content: TSourceFileConfiguratorFn;
  path: string;
};
type TPathsToFileContent = TPathsToFileContentObj[];
export type TExtensionParamsBlob = {
  _proposedTypeReferenceChain: string;
  domainNameAlpha: string;
  domainNameAlphaBarrelExportRootDirPath: string;
  domainNameAlphaBarrelExportRootFilePath: string;
  domainNameAlphaBarrelFullExportStatement: string;
  domainNameBeta: string;
  domainNameBetaBarrelExportRelativeImportPath: string;
  domainNameBetaBarrelExportRootDirPath: string;
  domainNameBetaBarrelExportRootFilePath: string;
  domainNameBetaBarrelFullExportStatement: string;
  domainNameGamma: string | null;
  // Look at me. Im nullable.
  domainNameGammaBarrelExportRootDirPath: string | null;
  // Look at me. Im nullable.
  domainNameGammaBarrelExportRootFilePath: string | null;
  domainNameGammaBarrelFullExportStatement: string;
  // Look at me. Im nullable.
  domainNameZeta: string;
  domainNameZetaBarrelExportRelativeImportPath: string;
  domainNameZetaBarrelFullExportStatement: string;
  domainNameZetaRootDirPath: string;
  domainNameZeta_SUPER_ROOT_BarrelExportDirPath: string;
  domainNameZeta_SUPER_ROOT_BarrelExportRootFilePath: string;
  domainNameZeta_SUPER_ROOT_TypeDefinitionFilePath: string;
  domainShapeConfig: TDomainShapeConfig;
  pathsToFileContent: TPathsToFileContent;
  proposedTypeChainReferenceShort: string;
  topLevelNamespace: string;
};
const TSesoString = "TSeso";
const topLevelNamespace = "TSeso.TD";
const applicationDTO = ".Application.DTO.";
const domainValueObject = ".Domain.ValueObject.";
const domainEntity = ".Domain.Entity.";
const infraSchema = ".Infra.Schema.";
const typeRefactorTypes = {
  APPLICATION_DTO: "APPLICATION_DTO",
  DOMAIN_ENTITY: "DOMAIN_VALUE_ENTITY",
  DOMAIN_VALUE_OBJECT: "DOMAIN_VALUE_OBJECT",
  INFRASTRCTURE_SCHEMA: "INFRASTRCTURE_SCHEMA",
} as const;
type TRefactorType = typeof typeRefactorTypes;
type TRefactorTypes = TRefactorType[keyof TRefactorType];
type TBuildArgsParams = {
  proposedTypeReferenceChain: string;
  pwd: string;
};
const domainNameAlpha = "ddd";

export const buildArgsFromDomainTypePath = ({
  proposedTypeReferenceChain: _proposedTypeReferenceChain,
  pwd,
}: TBuildArgsParams): TExtensionParamsBlob => {
  const activeRefactorType: TRefactorTypes = (() => {
    if (_proposedTypeReferenceChain.includes(applicationDTO)) {
      return typeRefactorTypes.APPLICATION_DTO;
    }
    if (_proposedTypeReferenceChain.includes(domainValueObject)) {
      return typeRefactorTypes.DOMAIN_VALUE_OBJECT;
    }
    if (_proposedTypeReferenceChain.includes(domainEntity)) {
      return typeRefactorTypes.DOMAIN_ENTITY;
    }
    if (_proposedTypeReferenceChain.includes(infraSchema)) {
      return typeRefactorTypes.INFRASTRCTURE_SCHEMA;
    }
    throw new Error(
      `Bad _proposedTypeReferenceChain: ${_proposedTypeReferenceChain}`
    );
  })();
  const proposedTypeChainReferenceShort = String(
    _proposedTypeReferenceChain
      .split(topLevelNamespace)
      .join(".")
      .split(".")
      .filter(Boolean)
      .join(".")
  );
  const domainNameAlphaBarrelExportRootDirPath = path.join(
    pwd,
    domainNameAlpha
  );
  const domainNameBeta = (() => {
    let parts = null;
    switch (activeRefactorType) {
      case typeRefactorTypes.APPLICATION_DTO: {
        parts = String(proposedTypeChainReferenceShort.split("Application")[0]);
        break;
      }
      case typeRefactorTypes.DOMAIN_ENTITY:
      case typeRefactorTypes.DOMAIN_VALUE_OBJECT: {
        parts = String(proposedTypeChainReferenceShort.split("Domain")[0]);
        break;
      }
      case typeRefactorTypes.INFRASTRCTURE_SCHEMA: {
        parts = String(
          proposedTypeChainReferenceShort.split("Infrastructure")[0]
        );
        break;
      }
      default:
        throw new Error("Bad Refactor Type");
    }
    return String(parts.split(".").filter(Boolean).shift());
  })();
  const domainNameGamma = (() => {
    let parts = null;
    switch (activeRefactorType) {
      case typeRefactorTypes.APPLICATION_DTO: {
        parts = String(proposedTypeChainReferenceShort.split("Application")[0]);
        break;
      }
      case typeRefactorTypes.DOMAIN_ENTITY:
      case typeRefactorTypes.DOMAIN_VALUE_OBJECT: {
        parts = String(proposedTypeChainReferenceShort.split("Domain")[0]);
        break;
      }
      case typeRefactorTypes.INFRASTRCTURE_SCHEMA: {
        parts = String(
          proposedTypeChainReferenceShort.split("Infrastructure")[0]
        );
        break;
      }
      default:
        throw new Error("Bad Refactor Type");
    }
    const p = parts.split(".").filter(Boolean);
    return p.length > 1 ? String(parts.split(".").filter(Boolean).pop()) : null;
  })();

  const domainNameAlphaBarrelExportRootFilePath = `${domainNameAlphaBarrelExportRootDirPath}/types.ts`;

  const domainNameAlphaBarrelFullExportStatement = `export * as ${domainNameBeta} from "./${domainNameBeta}/types";`;
  const domainNameBetaBarrelExportRootDirPath = `${domainNameAlphaBarrelExportRootDirPath}/${domainNameBeta}`;
  const domainNameBetaBarrelExportRootFilePath = `${domainNameAlphaBarrelExportRootDirPath}/${domainNameBeta}/types.ts`;
  const domainNameBetaBarrelExportRelativeImportPath = (() => {
    if (domainNameGamma) {
      return `./${domainNameGamma}/types;`;
    }
    switch (activeRefactorType) {
      case typeRefactorTypes.APPLICATION_DTO: {
        return `./application/types`;
      }
      case typeRefactorTypes.DOMAIN_ENTITY:
      case typeRefactorTypes.DOMAIN_VALUE_OBJECT: {
        return `./domain/types`;
      }
      case typeRefactorTypes.INFRASTRCTURE_SCHEMA: {
        return `./infrastructure/types`;
      }
      default:
        throw new Error("Bad Refactor Type");
    }
  })();

  const domainNameBetaBarrelFullExportStatement = (() => {
    if (domainNameGamma) {
      return `export * as ${domainNameGamma} from "./${domainNameGamma}/types";`;
    }
    switch (activeRefactorType) {
      case typeRefactorTypes.APPLICATION_DTO: {
        return `export * as Application from "${domainNameBetaBarrelExportRelativeImportPath}";`;
      }
      case typeRefactorTypes.DOMAIN_ENTITY:
      case typeRefactorTypes.DOMAIN_VALUE_OBJECT: {
        return `export * as Domain from "${domainNameBetaBarrelExportRelativeImportPath}";`;
      }
      case typeRefactorTypes.INFRASTRCTURE_SCHEMA: {
        return `export * as Infrastructure from "${domainNameBetaBarrelExportRelativeImportPath}";`;
      }
      default:
        throw new Error("Bad Refactor Type");
    }
  })();

  const domainNameGammaBarrelExportRootDirPath = domainNameGamma
    ? `${domainNameBetaBarrelExportRootDirPath}/${domainNameGamma}`
    : null;
  const domainNameGammaBarrelExportRootFilePath = domainNameGamma
    ? `${domainNameGammaBarrelExportRootDirPath}/types.ts`
    : null;

  const domainNameGammaBarrelFullExportStatement = (() => {
    if (!domainNameGamma) return null;
    switch (activeRefactorType) {
      case typeRefactorTypes.APPLICATION_DTO: {
        return `export * as Application from "./Application/types";`;
      }
      case typeRefactorTypes.DOMAIN_ENTITY:
      case typeRefactorTypes.DOMAIN_VALUE_OBJECT: {
        return `export * as Domain from "./Domain/types";`;
      }
      case typeRefactorTypes.INFRASTRCTURE_SCHEMA: {
        return `export * as Infrastructure from "./Infrastructure/types";`;
      }
      default:
        throw new Error("Bad Refactor Type");
    }
  })();
  // One or the other
  const domainNameZeta = domainNameGamma || domainNameBeta;
  // One or the other
  const domainNameZetaRootDirPath =
    domainNameGammaBarrelExportRootDirPath ||
    domainNameBetaBarrelExportRootDirPath;

  const domainNameZetaBarrelExportRelativeImportPath = (() => {
    switch (activeRefactorType) {
      case typeRefactorTypes.APPLICATION_DTO: {
        return `./DTO`;
      }
      case typeRefactorTypes.DOMAIN_ENTITY: {
        return `./Entity`;
      }
      case typeRefactorTypes.DOMAIN_VALUE_OBJECT: {
        return `./ValueObject`;
      }
      case typeRefactorTypes.INFRASTRCTURE_SCHEMA: {
        return `./Schema`;
      }
      default:
        throw new Error("Bad Refactor Type");
    }
  })();

  const domainNameZeta_SUPER_ROOT_BarrelExportDirPath = (() => {
    switch (activeRefactorType) {
      case typeRefactorTypes.APPLICATION_DTO: {
        return `${domainNameZetaRootDirPath}/application/types`;
      }
      case typeRefactorTypes.DOMAIN_ENTITY:
      case typeRefactorTypes.DOMAIN_VALUE_OBJECT: {
        return `${domainNameZetaRootDirPath}/domain/types`;
      }
      case typeRefactorTypes.INFRASTRCTURE_SCHEMA: {
        return `${domainNameZetaRootDirPath}/infrastructure/types`;
      }
      default:
        throw new Error("Bad Refactor Type");
    }
  })();
  const domainNameZeta_SUPER_ROOT_BarrelExportRootFilePath = `${domainNameZeta_SUPER_ROOT_BarrelExportDirPath}/index.ts`;
  const domainNameZetaBarrelFullExportStatement = (() => {
    switch (activeRefactorType) {
      case typeRefactorTypes.APPLICATION_DTO: {
        return `export * as DTO from "${domainNameZetaBarrelExportRelativeImportPath}";`;
      }
      case typeRefactorTypes.DOMAIN_ENTITY:
        return `export * as Entity from "${domainNameZetaBarrelExportRelativeImportPath}";`;
      case typeRefactorTypes.DOMAIN_VALUE_OBJECT: {
        return `export * as ValueObject from "${domainNameZetaBarrelExportRelativeImportPath}";`;
      }
      case typeRefactorTypes.INFRASTRCTURE_SCHEMA: {
        return `export * as Schema from "${domainNameZetaBarrelExportRelativeImportPath}";`;
      }
      default:
        throw new Error("Bad Refactor Type");
    }
  })();

  const domainNameZeta_SUPER_ROOT_TypeDefinitionFilePath = (() => {
    switch (activeRefactorType) {
      case typeRefactorTypes.APPLICATION_DTO: {
        return `${domainNameZetaRootDirPath}/application/types/DTO.ts`;
      }
      case typeRefactorTypes.DOMAIN_ENTITY: {
        return `${domainNameZetaRootDirPath}/domain/types/Entity.ts`;
      }
      case typeRefactorTypes.DOMAIN_VALUE_OBJECT: {
        return `${domainNameZetaRootDirPath}/domain/types/ValueObject.ts`;
      }
      case typeRefactorTypes.INFRASTRCTURE_SCHEMA: {
        return `${domainNameZetaRootDirPath}/infrastructure/types/Schema.ts`;
      }
      default:
        throw new Error("Bad Refactor Type");
    }
  })();

  const maybeAddDomainBetaExportToAlphaBarrelExport = (f: SourceFile) => {};

  const maybeAddSchemaBarrelExport = (f: SourceFile) => {
    // const emptyContents = [`export * as Schema from "./Schema";`];
    const existingDeclarations = f.getExportedDeclarations();
    f.getStatements().forEach((s) => {
      console.log({
        file: f.getFilePath(),
        fn: "maybeAddSchemaBarrelExport",
        statement: s.getText(),
      });
    });
    if (!existingDeclarations.get("Schema")) {
      f.addExportDeclaration({
        isTypeOnly: false,
        moduleSpecifier: "./Schema",
        namespaceExport: "Schema",
      });
    }
  };
  const maybeAddDTOBarrelExport = (f: SourceFile) => {
    // const emptyContents = [`export * as DTO from "./DTO";`];
    const existingDeclarations = f.getExportedDeclarations();
    f.getStatements().forEach((s) => {
      console.log({ file: f.getFilePath(), statement: s.getText() });
    });
    if (!existingDeclarations.get("DTO")) {
      f.addExportDeclaration({
        isTypeOnly: false,
        moduleSpecifier: "./DTO",
        namespaceExport: "DTO",
      });
    }
  };
  const maybeAddEntityOrValueObjectBarrelExport = (f: SourceFile) => {
    // const emptyContents = [
    //   `export * as Entity from "./Entity";`,
    //   `export * as ValueObject from "./ValueObject";`,
    // ];
    const existingDeclarations = f.getExportedDeclarations();
    f.getStatements().forEach((s) => {
      console.log({
        file: f.getFilePath(),
        fn: "maybeAddEntityOrValueObjectBarrelExport",
        statement: s.getText(),
      });
    });
    if (!existingDeclarations.get("DTO")) {
      f.addExportDeclaration({
        isTypeOnly: false,
        moduleSpecifier: "./DTO",
        namespaceExport: "DTO",
      });
    }
  };
  const maybeAddTSesoTypeImport = (f: SourceFile) => {
    // const emptyContents = [
    //   `import type * as TSeso from "@/lib/types";`,
    //   `export {};`,
    // ];
    const hasTsesoImport = f.getImportDeclarations().some((d) => {
      const namespace = d.getNamespaceImport();
      if (namespace) {
        const namespaceImportText = namespace.getText();
        console.log(`NAMEXAPECE IMPORT TEXT`);
        console.log(namespaceImportText);
        return namespaceImportText === TSesoString;
      }
      return false;
    });

    if (!hasTsesoImport) {
      f.addImportDeclaration({
        isTypeOnly: true,
        moduleSpecifier: "@/lib/types",
        namespaceImport: TSesoString,
      });
    }
  };

  const domainShapeConfig: TDomainShapeConfig = {
    application: {
      types: {
        "DTO.ts": maybeAddTSesoTypeImport,
        "index.ts": maybeAddDTOBarrelExport,
      },
    },
    domain: {
      types: {
        "Entity.ts": maybeAddTSesoTypeImport,
        "ValueObject.ts": maybeAddTSesoTypeImport,
        "index.ts": maybeAddEntityOrValueObjectBarrelExport,
      },
    },
    infrastructure: {
      types: {
        "Schema.ts": maybeAddTSesoTypeImport,
        "index.ts": maybeAddSchemaBarrelExport,
      },
    },
  };

  if (activeRefactorType === typeRefactorTypes.APPLICATION_DTO) {
    delete domainShapeConfig.domain;
    delete domainShapeConfig.infrastructure;
  }
  if (activeRefactorType === typeRefactorTypes.DOMAIN_ENTITY) {
    delete domainShapeConfig.domain?.types["ValueObject.ts"];
    delete domainShapeConfig.infrastructure;
  }
  if (activeRefactorType === typeRefactorTypes.DOMAIN_VALUE_OBJECT) {
    delete domainShapeConfig.domain?.types["Entity.ts"];
    delete domainShapeConfig.application;
    delete domainShapeConfig.infrastructure;
  }
  if (activeRefactorType === typeRefactorTypes.INFRASTRCTURE_SCHEMA) {
    delete domainShapeConfig.domain;
    delete domainShapeConfig.application;
    delete domainShapeConfig.infrastructure;
  }

  const pathsToFileContent: TPathsToFileContentObj[] = [];
  // Always add export to alpha domain (ddd)
  pathsToFileContent.push({
    content: maybeAddDomainBetaExportToAlphaBarrelExport,
    path: domainNameAlphaBarrelExportRootFilePath,
  });
  if (domainNameGammaBarrelExportRootFilePath) {
    pathsToFileContent.push({
      content: maybeAddDomainBetaExportToAlphaBarrelExport,
      path: domainNameGammaBarrelExportRootFilePath,
    });
  }

  function buildPathsToFileContent(oo: TDomainShapeConfig): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function runner(o: Record<string, any>, pp: string[]): void {
      const keys = Object.keys(o);
      if (keys.length) {
        return keys.forEach((k) => {
          const attr = o[k];
          if (typeof attr === "function") {
            pathsToFileContent.push({
              content: attr,
              path: path.join(domainNameZeta_SUPER_ROOT_BarrelExportDirPath, k),
            });
          }
          return runner(attr, pp.concat(k));
        });
      }
    }
    runner(oo, []);
  }

  buildPathsToFileContent(domainShapeConfig);
  // Hack to put missing imports in existing files

  const defaultArgs: TExtensionParamsBlob = {
    _proposedTypeReferenceChain,
    domainNameAlpha,
    domainNameAlphaBarrelExportRootDirPath,
    domainNameAlphaBarrelExportRootFilePath,
    domainNameAlphaBarrelFullExportStatement,
    domainNameBeta,
    domainNameBetaBarrelExportRelativeImportPath,
    domainNameBetaBarrelExportRootDirPath,
    domainNameBetaBarrelExportRootFilePath,
    domainNameBetaBarrelFullExportStatement,
    domainNameGamma,
    domainNameGammaBarrelExportRootDirPath,
    domainNameGammaBarrelExportRootFilePath,
    domainNameGammaBarrelFullExportStatement,
    domainNameZeta,
    domainNameZetaBarrelExportRelativeImportPath,
    domainNameZetaBarrelFullExportStatement,
    domainNameZetaRootDirPath,
    domainNameZeta_SUPER_ROOT_BarrelExportDirPath,
    domainNameZeta_SUPER_ROOT_BarrelExportRootFilePath,
    domainNameZeta_SUPER_ROOT_TypeDefinitionFilePath,
    domainShapeConfig,
    pathsToFileContent,
    proposedTypeChainReferenceShort,
    topLevelNamespace,
  };
  return defaultArgs;
};

export function buildDestinationDomainPathSuggested(p: {
  cwf: string;
  nodeText: string;
}) {
  const p1 = String(p.cwf.split(domainNameAlpha).pop());
  if (p1.includes("/application/")) {
    const p2 = p1.split("/application/").shift(); // looks like: Shared/Media
    const p3 = p2
      ?.split("/")
      .filter((s) => s !== "/")
      .filter((s) => s !== "")
      .join(".");
    return `${topLevelNamespace}.${p3}.Application.DTO.${p.nodeText}`;
  }
  if (p1.includes("/domain/")) {
    const p2 = p1.split("/domain/").shift(); // looks like: Shared/Media
    const p3 = p2
      ?.split("/")
      .filter((s) => s !== "/")
      .filter((s) => s !== "")
      .join(".");
    return `${topLevelNamespace}.${p3}.Domain.ValueObject.${p.nodeText}`;
  }
  if (p1.includes("/infrastructure/")) {
    const p2 = p1.split("/infrastructure/").shift(); // looks like: Shared/Media
    const p3 = p2
      ?.split("/")
      .filter((s) => s !== "/")
      .filter((s) => s !== "")
      .join(".");
    return `${topLevelNamespace}.${p3}.Schema.${p.nodeText}`;
  }
  throw new Error(`Bad cwd: ${p.cwf}`);
}
// Testy
// $ tsc src/buildArgsFromDomainTypePath.ts  && node src/buildArgsFromDomainTypePath.js && rm src/buildArgsFromDomainTypePath.js
console.dir(
  buildArgsFromDomainTypePath({
    proposedTypeReferenceChain:
      // "TSeso.TD.Alpha.Domain.ValueObject.TCreateDocumentDTO",
      "TSeso.TD.Alpha.Gamma.Domain.ValueObject.TCreateDocumentDTO",
    pwd: "/Users/willdembinski/projects/seso-app",
  }),
  { depth: 100 }
);
