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
  "types.ts": TSourceFileConfiguratorFn;
};
type TPathsToFileContentObj = {
  content: TSourceFileConfiguratorFn;
  path: string;
};
type TPathsToFileContent = TPathsToFileContentObj[];
type TRefactorTypesToDestinationFilesPath = Record<TRefactorTypes, string>;
export type TExtensionParamsBlob = {
  destinationDomainChain: string;
  destinationFilePath: string;
  domainFilePathPart: string;
  domainFolderPart: string;
  domainFolderPath: string;
  domainLevelFirst: string;
  domainLevelFirstTypeFilePath: string;
  domainLevelSecond: string;
  domainLevelSecondTypeFilePath: string | null;
  domainShapeConfig: TDomainShapeConfig;
  pathsToFileContent: TPathsToFileContent;
  refactorTypesToDestinationFilesPath: TRefactorTypesToDestinationFilesPath;
  rootDomainFilePathPath: string;
  rootLevelTypeFilePath: string;
  topLevelNamespace: string;
  tsesoPrefix: string;
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
  destinationDomainChain: string;
  pwd: string;
};
const tsesoPrefix = "TSeso.TD.";
const domainFolderPart = "ddd";

export const buildArgsFromDomainTypePath = ({
  destinationDomainChain,
  pwd,
}: TBuildArgsParams): TExtensionParamsBlob => {
  const defaultDomainBarrelExportFileContent = (f: SourceFile) => {
    // const emptyContents = [
    //   `export * as Application from "./application/types";`,
    //   `export * as Domain from "./domain/types";`,
    //   `export * as Infrastructure from "./infrastructure/types";`,
    // ];
    const existingDeclarations = f.getExportedDeclarations();
    f.getStatements().forEach((s) => {
      console.log({ file: f.getFilePath(), statement: s.getText() });
    });
    switch (activeRefactorType) {
      case typeRefactorTypes.APPLICATION_DTO:
        if (!existingDeclarations.get("Application")) {
          f.addExportDeclaration({
            isTypeOnly: false,
            moduleSpecifier: "./application/types",
            namespaceExport: "Application",
          });
        }
        break;
      case typeRefactorTypes.DOMAIN_ENTITY:
      case typeRefactorTypes.DOMAIN_VALUE_OBJECT:
        if (!existingDeclarations.get("Domain")) {
          f.addExportDeclaration({
            isTypeOnly: false,
            moduleSpecifier: "./domain/types",
            namespaceExport: "Domain",
          });
        }
        break;
      case typeRefactorTypes.INFRASTRCTURE_SCHEMA:
        if (!existingDeclarations.get("Infrastructure")) {
          f.addExportDeclaration({
            isTypeOnly: false,
            moduleSpecifier: "./infrastructure/types",
            namespaceExport: "Infrastructure",
          });
        }
        break;
      default:
        throw new Error("Bad refactor type");
    }
  };
  const defaultInfrastructureTypeFileContent = (f: SourceFile) => {
    // const emptyContents = [`export * as Schema from "./Schema";`];
    const existingDeclarations = f.getExportedDeclarations();
    f.getStatements().forEach((s) => {
      console.log({
        file: f.getFilePath(),
        fn: "defaultInfrastructureTypeFileContent",
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
  const defaultApplicationTypeFileContent = (f: SourceFile) => {
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
  const defaultDomainTypeFileContent = (f: SourceFile) => {
    // const emptyContents = [
    //   `export * as Entity from "./Entity";`,
    //   `export * as ValueObject from "./ValueObject";`,
    // ];
    const existingDeclarations = f.getExportedDeclarations();
    f.getStatements().forEach((s) => {
      console.log({
        file: f.getFilePath(),
        fn: "defaultDomainTypeFileContent",
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
  const maybeAddEmptyTypeContext = (f: SourceFile) => {
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

  const activeRefactorType: TRefactorTypes = (() => {
    if (destinationDomainChain.includes(applicationDTO)) {
      return typeRefactorTypes.APPLICATION_DTO;
    }
    if (destinationDomainChain.includes(domainValueObject)) {
      return typeRefactorTypes.DOMAIN_VALUE_OBJECT;
    }
    if (destinationDomainChain.includes(domainEntity)) {
      return typeRefactorTypes.DOMAIN_ENTITY;
    }
    if (destinationDomainChain.includes(infraSchema)) {
      return typeRefactorTypes.INFRASTRCTURE_SCHEMA;
    }
    throw new Error(`Bad destinationDomainChain: ${destinationDomainChain}`);
  })();
  const nestedDomainToPath = (s: string): string =>
    String(s.split(applicationDTO).shift());

  const domainFilePathPart = (() => {
    switch (activeRefactorType) {
      case typeRefactorTypes.APPLICATION_DTO: {
        const shortDomainChain = String(
          destinationDomainChain.split(tsesoPrefix).pop()
        );
        const p2 = nestedDomainToPath(shortDomainChain);
        return p2?.split(".").join("/");
      }
      case typeRefactorTypes.DOMAIN_ENTITY: {
        const shortDomainChain = String(
          destinationDomainChain.split(tsesoPrefix).pop()
        );
        const p2 = nestedDomainToPath(shortDomainChain);
        return p2?.split(".").join("/");
      }
      case typeRefactorTypes.DOMAIN_VALUE_OBJECT: {
        const shortDomainChain = String(
          destinationDomainChain.split(tsesoPrefix).pop()
        );
        const p2 = nestedDomainToPath(shortDomainChain);
        return p2?.split(".").join("/");
      }
      case typeRefactorTypes.INFRASTRCTURE_SCHEMA: {
        const shortDomainChain = String(
          destinationDomainChain.split(tsesoPrefix).pop()
        );
        const p2 = nestedDomainToPath(shortDomainChain);
        return p2?.split(".").join("/");
      }
      default:
        throw new Error("Bad Refactor Type");
    }
  })();
  const [domainLevelFirst, domainLevelSecond] = domainFilePathPart.split("/");
  const rootDomainFilePathPath = path.join(pwd, domainFolderPart);
  const domainFolderPath = path.join(
    rootDomainFilePathPath,
    domainFilePathPart
  );
  const refactorTypesToDestinationFilesPath = {
    [typeRefactorTypes.APPLICATION_DTO]: `${path.join(
      domainFolderPath,
      "application",
      "types",
      "DTO.ts"
    )}`,
    [typeRefactorTypes.DOMAIN_ENTITY]: `${path.join(
      domainFolderPath,
      "domain",
      "types",
      "Entity.ts"
    )}`,
    [typeRefactorTypes.DOMAIN_VALUE_OBJECT]: `${path.join(
      domainFolderPath,
      "domain",
      "types",
      "ValueObject.ts"
    )}`,
    [typeRefactorTypes.INFRASTRCTURE_SCHEMA]: `${path.join(
      domainFolderPath,
      "infrastructure",
      "types",
      "Schema.ts"
    )}`,
  } as const;

  const domainShapeConfig: TDomainShapeConfig = {
    application: {
      types: {
        "DTO.ts": maybeAddEmptyTypeContext,
        "index.ts": defaultApplicationTypeFileContent,
      },
    },
    domain: {
      types: {
        "Entity.ts": maybeAddEmptyTypeContext,
        "ValueObject.ts": maybeAddEmptyTypeContext,
        "index.ts": defaultDomainTypeFileContent,
      },
    },
    infrastructure: {
      types: {
        "Schema.ts": maybeAddEmptyTypeContext,
        "index.ts": defaultInfrastructureTypeFileContent,
      },
    },
    "types.ts": defaultDomainBarrelExportFileContent,
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
    delete domainShapeConfig.infrastructure;
  }
  if (activeRefactorType === typeRefactorTypes.INFRASTRCTURE_SCHEMA) {
    delete domainShapeConfig.domain;
    delete domainShapeConfig.infrastructure;
  }
  const rootLevelTypeFilePath = `${rootDomainFilePathPath}/types.ts`;
  const domainLevelFirstTypeFilePath = `${domainFolderPath}/types.ts`;
  const domainLevelSecondTypeFilePath = domainLevelSecond
    ? `${domainFolderPath}/${domainLevelSecond}/types.ts`
    : null;

  const pathsToFileContent: TPathsToFileContentObj[] = [
    // {
    //   content: addDomainLevelFirstBarrelExport(),
    //   path: path.join(domainFolderPath, pp.join("/"), k),
    // },
  ];

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
              path: path.join(domainFolderPath, pp.join("/"), k),
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

  // const maybeNestedDomainFilePathChunks = String(
  //   domainFolderPath.split(domainFolderPart)
  // ).split("/");

  // const creatingOrUpdatingNestedBarrelExport =
  //   maybeNestedDomainFilePathChunks.length > 1;
  // if (creatingOrUpdatingNestedBarrelExport) {
  //   // remove last el.
  //   const pathToAddExport = domainFolderPath
  //     .split("/")
  //     .slice(0, -1)
  //     .join("/");
  //   const moduleSpecifier = `./${domainFolderPath.split("/").pop()}/types`;
  //   result.push({
  //     content: (f: SourceFile) => {
  //       f.addExportDeclaration({
  //         isTypeOnly: false,
  //         moduleSpecifier,
  //         namespaceExport: maybeNestedDomainFilePathChunks.pop(),
  //       });
  //     },
  //     path: path.join(pathToAddExport, "types.ts"),
  //   });
  // }
  // return result;

  const defaultArgs: TExtensionParamsBlob = {
    destinationDomainChain,
    destinationFilePath:
      refactorTypesToDestinationFilesPath[activeRefactorType],
    domainFilePathPart,
    domainFolderPart,
    domainFolderPath,
    domainLevelFirst,
    domainLevelFirstTypeFilePath,
    domainLevelSecond,
    domainLevelSecondTypeFilePath,
    domainShapeConfig,
    pathsToFileContent,
    refactorTypesToDestinationFilesPath,
    rootDomainFilePathPath,
    rootLevelTypeFilePath,
    topLevelNamespace,
    tsesoPrefix,
  };
  return defaultArgs;
};

export function buildDestinationDomainPathSuggested(p: {
  cwf: string;
  nodeText: string;
}) {
  const p1 = String(p.cwf.split(domainFolderPart).pop());
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
    destinationDomainChain:
      "TSeso.TD.Shared.Foo.Application.DTO.TCreateDocumentDTO",
    pwd: "/Users/willdembinski/projects/seso-app",
  }),
  { depth: 100 }
);
