import type * as TSeso from "../../../../../lib";

export type TDTOSeed = { name: string };
export type TParamDTOValue = TSeso.TDDD.application.TStrictDTO<{
  foo: "TParamDTOValue";
  name: string;
}>;

export const testParamDTO: TSeso.TDDD.application.TApplicationDTO<
  TParamDTOValue,
  TDTOSeed
> = {
  create: (p) => {
    return { ...p, foo: "TParamDTOValue" } as TParamDTOValue;
  },
};
