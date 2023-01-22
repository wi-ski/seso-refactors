import * as path from "path";

type TDomainShapeConfig = {
  application: {
    types: {
      "DTO.ts": string;
      "index.ts": string;
    };
  };
  domain: {
    types: {
      "Entity.ts": string;
      "ValueObject.ts": string;
      "index.ts": string;
    };
  };
  infrastructure: {
    types: {
      "Schema.ts": string;
      "index.ts": string;
    };
  };
  "types.ts": string;
};
type TPathsToFileContent = {
  content: string;
  path: string;
}[];
type TRefactorTypesToDestinationFilesPath = Record<TRefactorTypes, string>;
type TExtensionParamsBlob = {
  destinationDomainChain: string;
  destinationFilePath: string;
  domainFolderPart: string;
  domainFolderPath: string;
  domainShapeConfig: TDomainShapeConfig;
  pathsToFileContent: TPathsToFileContent;
  pwf: string;
  refactorTypesToDestinationFilesPath: TRefactorTypesToDestinationFilesPath;
  topLevelNamespace: string;
};
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
export const buildArgsFromDomainTypePath = (
  destinationDomainChain: string
): TExtensionParamsBlob => {
  const pwd = "/Users/willdembinski/projects/seso-app/";
  const pwf = `${pwd}ddd/Shared/Media/application/service/createFile.ts`;
  const tsesoPrefix = "TSeso.TD.";
  // const destinationDomainChain = `${tsesoPrefix}Shared.Foo.Application.DTO.TCreateDocumentDTO`;
  const domainFolderPart = "ddd";
  const defaultDomainBarrelExportFileContent = () =>
    `export * as Application from "./application/types";
export * as Domain from "./domain/types";
export * as Infrastructure from "./infrastructure/types";
`;
  const defaultInfrastructureTypeFileContent = () =>
    `export * as Schema from "./Schema";`;
  const defaultApplicationTypeFileContent = () =>
    `export * as DTO from "./DTO";`;
  const defaultDomainTypeFileContent = () =>
    `export * as Entity from "./Entity";
export * as ValueObject from "./ValueObject";
`;
  const emptyTypeFileContent = () =>
    `import type * as TSeso from "@/lib/types";
export {};
`;

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
    throw new Error("Bad destinationDomainChain");
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
  const domainFolderPath = path.join(pwd, domainFolderPart, domainFilePathPart);
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

  const domainShapeConfig = {
    application: {
      types: {
        "DTO.ts": emptyTypeFileContent(),
        "index.ts": defaultApplicationTypeFileContent(),
      },
    },
    domain: {
      types: {
        "Entity.ts": emptyTypeFileContent(),
        "ValueObject.ts": emptyTypeFileContent(),
        "index.ts": defaultDomainTypeFileContent(),
      },
    },
    infrastructure: {
      types: {
        "Schema.ts": emptyTypeFileContent(),
        "index.ts": defaultInfrastructureTypeFileContent(),
      },
    },
    "types.ts": defaultDomainBarrelExportFileContent(),
  } as const;
  const pathsToFileContent = (function buildPathsToFileContent(): {
    content: string;
    path: string;
  }[] {
    const result: any[] = [];
    function runner(o: Record<string, any>, p: string[]): void {
      const keys = Object.keys(o);
      if (keys.length) {
        return keys.forEach((k) => {
          const attr = o[k];
          if (typeof attr === "string") {
            return result.push({
              content: attr,
              path: `${pwd}/${domainFolderPart}/${domainFilePathPart}/${p.join("/")}/${k}`,
            });
          }
          return runner(attr, p.concat(k));
        });
      }
    }
    runner(domainShapeConfig, []);
    return result;
  })();

  const defaultArgs: TExtensionParamsBlob = {
    destinationDomainChain,
    destinationFilePath:
      refactorTypesToDestinationFilesPath[activeRefactorType],
    domainFolderPath,
    domainShapeConfig,
    pathsToFileContent,
    pwf,
    refactorTypesToDestinationFilesPath,
    topLevelNamespace,
  };
  return defaultArgs;
};

console.dir(
  buildArgsFromDomainTypePath("Shared.Foo.Application.DTO.TCreateDocumentDTO"),
  { depth: 100 }
);
