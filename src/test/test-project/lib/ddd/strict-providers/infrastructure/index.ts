import type { TRuntimeContext } from "../../../../ddd/types";

export type TAdapter<TParamType, TReturnType> = (
  runtimeContext: TRuntimeContext,
  params: TParamType
) => TReturnType;

export type TInfrastructureService<TParamType = void, TReturnType = void> = (
  runtimeContext: TRuntimeContext,
  params: TParamType,
  ec: "TExecutionContext"
) => TReturnType;
