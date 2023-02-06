import type { SourceFile } from "ts-morph";

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
export type TExtractFunctionParams = {
  cursorPos: number;
  targetFilePath: string;
  writeFileConfigs: TWriteFileConfigs;
};
export type TExtractRefactorTypes = keyof typeof extractRefactorTypes;
export type TPathsToFileContentObj = {
  content: TSourceFileConfiguratorFn;
  path: string;
};

export type TSourceFileConfig = {
  isFreshFile: boolean;
  sourceFile: SourceFile;
};
export type TSourceFileConfiguratorFn = (config: {
  sourcefileConfig: TSourceFileConfig;
  templateParams: TTemplateParams;
  writeFileConfigs: TWriteFileConfigs;
}) => void;

export type TSourceFileConfiguratorObj = Record<
  string,
  TSourceFileConfiguratorFn
>;
export type TTemplateParams = {
  TEMPLATE_FN_BODY: string;
  TEMPLATE_PARAMS_BLOB: string;
  TEMPLATE_PARAMS_TYPE: string;
  TEMPLATE_PARAMS_TYPE_NAME: string;
  TEMPLATE_PROVIDER_NAME: string;
  TEMPLATE_RESPONSE_TYPE: string;
  TEMPLATE_RESPONSE_TYPE_NAME: string;
};

export type TWriteFileConfigs = {
  alphaDomain: string;
  betaDomain: string;
  gammaDomain: string | null;
  providerIdentifierPath: string;
  providerName: string;
  pwd: string;
  refactorType: TExtractRefactorTypes;
};

export const extractRefactorTypes = {
  APPLICATION_EVENTLISTENER: "APPLICATION_EVENTLISTENER",
  APPLICATION_SERVICE: "APPLICATION_SERVICE",
  APPLICATION_USECASE: "APPLICATION_USECASE",
  DOMAIN_ENTITY: "DOMAIN_ENTITY",
  DOMAIN_SERVICE: "DOMAIN_SERVICE",
  DOMAIN_VALUEOBJECT: "DOMAIN_VALUEOBJECT",
  INFRASTRUCTURE_SERVICE: "INFRASTRUCTURE_SERVICE",
} as const;
