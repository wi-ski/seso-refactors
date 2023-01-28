import type { TRuntimeContext } from "../../../../ddd/types";
import type { TValidServiceParamsTypes } from "../domain";

type TSingleParamFn = (p1?: any) => any;
export type TApplicationDTO<
  TActualValueType extends TStrictDTO<any>,
  TSeedValue = any,
  TAdditional extends Record<string, TSingleParamFn> = Record<
    string,
    TSingleParamFn
  >
> = TAdditional & {
  create: (createValue: TSeedValue) => TActualValueType;
  equals?: (p: { a: TActualValueType; b: TActualValueType }) => boolean;
};

export type TApplicationJobHandler<
  TParamType extends TValidServiceParamsTypes = void,
  TReturnType extends TValidServiceParamsTypes = void
> = (
  runtimeContext: "TNotInTransactionRuntimeContext",
  params: TParamType,
  ec: "TExecutionContext"
) => TReturnType;

export type TApplicationService<
  TParamType extends TValidServiceParamsTypes = void,
  TReturnType extends TValidServiceParamsTypes = void
> = (
  runtimeContext: TRuntimeContext,
  params: TParamType,
  ec: "TExecutionContext"
) => TReturnType;

export type TApplicationUseCase<
  PP extends { params: TStrictDTO<any>; response: TStrictDTO<any> }
> = (
  runtimeContext: TRuntimeContext,
  params: TStrictDTO<PP["params"]>,
  ec: "TExecutionContext",
  req?: "TSesoNextApiRequest",
  res?: "TSesoNextApiResponse"
) => Promise<TStrictDTO<PP["response"]>>;

export type TStrictDTO<K> = Required<K & { __isDTO: undefined }>;
