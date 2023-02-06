import * as path from "path";

import * as R from "ramda";

import { extractRefactorTypes } from "./constants";
import * as providerTemplate from "./provider-templates";

import type {
  TDomainShapeConfig,
  TDomainShapeConfigAlpha,
  TDomainShapeConfigBeta,
  TDomainShapeConfigGamma,
  TExtractRefactorTypes,
  TPathsToFileContentObj,
} from "./constants";

const yankPathsFromObj = <T extends Record<string, any>>(
  ps: string[][],
  o: T
): T => {
  let res = {};
  ps.forEach((p) => {
    const valAtPath = R.path(p, o);
    res = R.assocPath(p, valAtPath, res);
  });

  return res as T;
};
export function buildPathsToFileContent(p: {
  alphaDomain: string;
  betaDomain: string;
  gammaDomain: string;
  providerName: string;
  pwd: string;
  refactorType: TExtractRefactorTypes;
}): TPathsToFileContentObj[] {
  const extractRefactorTypesToYankPaths: Record<
    TExtractRefactorTypes,
    string[][]
  > = {
    [extractRefactorTypes.APPLICATION_SERVICE]: [
      ["index"],
      ["application", "index"],
      ["application", "service"],
    ],
    [extractRefactorTypes.APPLICATION_USECASE]: [
      ["index"],
      ["application", "index"],
      ["application", "usecase"],
    ],
    [extractRefactorTypes.APPLICATION_EVENTLISTENER]: [
      ["index"],
      ["application", "index"],
      ["application", "eventListener"],
    ],
    [extractRefactorTypes.DOMAIN_ENTITY]: [
      ["index"],
      ["domain", "index"],
      ["domain", "entity"],
    ],
    [extractRefactorTypes.DOMAIN_SERVICE]: [
      ["index"],
      ["domain", "index"],
      ["domain", "service"],
    ],
    [extractRefactorTypes.DOMAIN_VALUEOBJECT]: [
      ["index"],
      ["domain", "index"],
      ["domain", "valueobject"],
    ],
    [extractRefactorTypes.INFRASTRUCTURE_SERVICE]: [
      ["index"],
      ["infrastructure", "index"],
      ["infrastructure", "service"],
    ],
  };
  const _almostDomainShapeConfig: TDomainShapeConfig = {
    application: {
      eventListener: {
        index: providerTemplate.buildBarrelExportProvider,
        [p.providerName]:
          providerTemplate.buildProviderApplicationEventListener,
      },
      index: providerTemplate.buildBarrelExportApplicationLayer,
      service: {
        index: providerTemplate.buildBarrelExportProvider,
        [p.providerName]: providerTemplate.buildProviderApplicationService,
      },
      useCase: {
        index: providerTemplate.buildBarrelExportProvider,
        [p.providerName]: providerTemplate.buildProviderApplicationUseCase,
      },
    },
    domain: {
      entity: {
        index: providerTemplate.buildBarrelExportProvider,
        [p.providerName]: providerTemplate.buildProviderDomainEntity,
      },
      index: providerTemplate.buildBarrelExportDomainLayer,
      service: {
        index: providerTemplate.buildBarrelExportProvider,
        [p.providerName]: providerTemplate.buildProviderDomainService,
      },
      valueObject: {
        index: providerTemplate.buildBarrelExportProvider,
        [p.providerName]: providerTemplate.buildProviderDomainValueObject,
      },
    },
    index: providerTemplate.buildBarrelExportDomainRoot,
    infrastructure: {
      index: providerTemplate.buildBarrelExportInfrastructureLayer,
      service: {
        index: providerTemplate.buildBarrelExportProvider,
        [p.providerName]: providerTemplate.buildProviderInfrastructureService,
      },
    },
  };
  const pathsToYank = extractRefactorTypesToYankPaths[p.refactorType];
  const almostDomainShapeConfig = yankPathsFromObj(
    pathsToYank,
    _almostDomainShapeConfig
  );
  // @ts-expect-error - SS
  const domainShapeGamma: TDomainShapeConfigGamma = {
    // Nest the gamma
    index: providerTemplate.buildBarrelExportBetaDomainRoot,
    [p.gammaDomain]: almostDomainShapeConfig,
  };
  const betaDomainConfig: TDomainShapeConfigBeta = {
    index: providerTemplate.buildBarrelExportAlphaDomainRoot,
    [p.betaDomain]: p.gammaDomain ? domainShapeGamma : almostDomainShapeConfig,
  };

  const domainShapeConfig: TDomainShapeConfigAlpha = {
    [p.alphaDomain]: betaDomainConfig,
  };

  console.dir({ domainShapeConfig }, { depth: 10 });
  throw new Error("");
  const pathsToFileContent: TPathsToFileContentObj[] = [];
  function runner(
    o: TDomainShapeConfig | TDomainShapeConfigAlpha | TDomainShapeConfigBeta,
    pp: string[]
  ): void {
    const keys = Object.keys(o);
    if (keys.length) {
      return keys.forEach((k) => {
        const attr = o[k];
        if (typeof attr === "function") {
          pathsToFileContent.push({
            content: attr,
            path: path.join(p.pwd, ...pp, `${k}.ts`),
          });
        } else {
          return runner(attr, pp.concat(k));
        }
      });
    }
  }
  // runner(domainShapeConfig, []);
  // return pathsToFileContent;
}
