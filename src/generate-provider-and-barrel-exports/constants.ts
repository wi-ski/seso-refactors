import type * as fs from "fs";

type TFS = typeof fs;

export type TCommandNamesToHandlers = Record<
  TGenerateableProviderTypes,
  (p: any) => any
>;

export type TDomainShapeConfig = {
  application: {
    eventListener: TSourceFileConfiguratorObj;
    index: TSourceFileConfiguratorFn;
    service: TSourceFileConfiguratorObj;
    useCase: TSourceFileConfiguratorObj;
  };
  domain: {
    entity: TSourceFileConfiguratorObj;
    index: TSourceFileConfiguratorFn;
    service: TSourceFileConfiguratorObj;
    valueObject: TSourceFileConfiguratorObj;
  };
  index: TSourceFileConfiguratorFn;
  infrastructure: {
    index: TSourceFileConfiguratorFn;
    service: TSourceFileConfiguratorObj;
  };
};

export type TDomainShapeConfigAlpha = {
  [pathPart: string]: TDomainShapeConfigBeta;
};

export type TDomainShapeConfigBeta = {
  [pathPart: string]:
    | TDomainShapeConfig
    | TDomainShapeConfigGamma
    | TSourceFileConfiguratorFn;
};

export type TDomainShapeConfigGamma = {
  [pathPart: string]:
    | TDomainShapeConfig
    | TDomainShapeConfigGamma
    | TSourceFileConfiguratorFn;
};

export type TGenerateableProviderTypes = keyof typeof generateableProviderTypes;
export type TPathsToFileContentObj = {
  content: TSourceFileConfiguratorFn;
  path: string;
};

export type TSourceFileConfiguratorFn = (config: {
  argsContext: any;
  sourcefileContext: TSourceFileContext;
  templateParams: TTemplateParams;
}) => void;

export type TSourceFileConfiguratorObj = Record<
  string,
  TSourceFileConfiguratorFn
>;

export type TSourceFileContext = {
  fileContent: string;
  filePath: string;
  fs: TFS;
  isFreshFile: boolean;
};

export type TTemplateParams = {
  TEMPLATE_FN_BODY: string;
  TEMPLATE_PARAMS_BLOB: string;
  TEMPLATE_PARAMS_TYPE: string;
  TEMPLATE_PARAMS_TYPE_NAME: string;
  TEMPLATE_PROVIDER_NAME: string;
  TEMPLATE_RESPONSE_TYPE: string;
  TEMPLATE_RESPONSE_TYPE_NAME: string;
};

const generateableProviderTypes = {
  APPLICATION_DTO: "APPLICATION_DTO",
  APPLICATION_EVENTLISTENER: "APPLICATION_EVENTLISTENER",
  APPLICATION_SERVICE: "APPLICATION_SERVICE",
  APPLICATION_USECASE: "APPLICATION_USECASE",
  DOMAIN_ENTITY: "DOMAIN_ENTITY",
  DOMAIN_SERVICE: "DOMAIN_SERVICE",
  DOMAIN_VALUEOBJECT: "DOMAIN_VALUEOBJECT",
  INFRASTRUCTURE_SERVICE: "INFRASTRUCTURE_SERVICE",
} as const;

const generatableTypesToCommandNames = {
  [generateableProviderTypes.APPLICATION_EVENTLISTENER]:
    "applicationEventlistener",
  [generateableProviderTypes.APPLICATION_SERVICE]: "applicationService",
  [generateableProviderTypes.APPLICATION_USECASE]: "applicationUsecase",
  [generateableProviderTypes.APPLICATION_DTO]: "applicationDto",
  [generateableProviderTypes.DOMAIN_ENTITY]: "domainEntity",
  [generateableProviderTypes.DOMAIN_SERVICE]: "domainService",
  [generateableProviderTypes.DOMAIN_VALUEOBJECT]: "domainValueobject",
  [generateableProviderTypes.INFRASTRUCTURE_SERVICE]: "infrastructureService",
} as const;

export { generatableTypesToCommandNames, generateableProviderTypes };
