import type * as TSeso from "../../../../lib";

export type TTestValueObjectSeed = { name?: string };
export type TTestValueObjectValue = TSeso.TDDD.domain.TStrictValueObject<{
  foo: "TTestValueObjectValue";
  name: string;
}>;

export const testValueObject: TSeso.TDDD.domain.TValueObject<
  TTestValueObjectValue,
  TTestValueObjectSeed
> = {
  create: (p) => {
    return p as TTestValueObjectValue;
  },
};
