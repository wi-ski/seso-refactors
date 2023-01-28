import type { TRuntimeContext } from "../../../../ddd/types";

type TSingleParamFn = (p1?: any) => any;

export type TDomainService<
  TParamType extends TValidServiceParamsTypes,
  TReturnType extends TValidServiceParamsTypes
> = ($r: TRuntimeContext, params: TParamType) => TReturnType;
export type TEntity<
  TActualValueType extends TStrictEntity<any>,
  TSeedValue = void,
  TAdditional extends Record<string, TSingleParamFn> = Record<
    string,
    TSingleParamFn
  >
> = TAdditional & {
  create: (createValue: TSeedValue) => TStrictEntity<TActualValueType>;
  equals?: (p: {
    a: TStrictEntity<TActualValueType>;
    b: TStrictEntity<TActualValueType>;
  }) => boolean;
  get?: (value?: unknown) => TStrictEntity<TActualValueType>;
};

export type TStrictEntity<K> = K & { __isEntity: undefined };
export type TStrictValueObject<K> = K & { __isValueObject: undefined };

export type TValidServiceParamsTypes =
  | TStrictEntity<any>
  | TStrictValueObject<any>
  | void;

export type TValueObject<
  TActualValueType extends TStrictValueObject<any>,
  TSeedValue = void,
  TAdditional extends Record<string, TSingleParamFn> = Record<
    string,
    TSingleParamFn
  >
> = TAdditional & {
  create: (createValue: TSeedValue) => TStrictValueObject<TActualValueType>;
  equals?: (p: {
    a: TStrictValueObject<TActualValueType>;
    b: TStrictValueObject<TActualValueType>;
  }) => boolean;
  get?: (value?: unknown) => TStrictValueObject<TActualValueType>;
};
