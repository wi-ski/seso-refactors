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
  const wouldBeBetaDomainConfig: TDomainShapeConfigBeta = {
    [p.betaDomain]: almostDomainShapeConfig,
    index: providerTemplate.buildBarrelExportBetaDomainRoot,
  };
  const wouldBeGammDomainConfig: TDomainShapeConfigGamma = {
    [p.betaDomain]: {
      [p.gammaDomain]: almostDomainShapeConfig,
      index: providerTemplate.buildBarrelExportGammDomainRoot,
    },
    index: providerTemplate.buildBarrelExportBetaDomainRoot,
  };

  const domainShapeConfig: TDomainShapeConfigAlpha = {
    index: providerTemplate.buildBarrelExportAlphaDomainRoot,
    [p.alphaDomain]: p.gammaDomain
      ? wouldBeGammDomainConfig
      : wouldBeBetaDomainConfig,
  };
  const pathsToFileContent: TPathsToFileContentObj[] = [];
  function runner(
    o:
      | TDomainShapeConfig
      | TDomainShapeConfigAlpha
      | TDomainShapeConfigBeta
      | TDomainShapeConfigGamma,
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
  runner(domainShapeConfig, []);
  return pathsToFileContent;
}
