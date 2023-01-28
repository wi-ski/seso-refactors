import type * as TSeso from "../../../../../lib";

export type TResponseDTO = TSeso.TDDD.application.TStrictDTO<{
  foo: "TResponseDTO";
  name: string;
}>;
export type TResponseDTOSeed = { name: string };

export const testResponseDTO: TSeso.TDDD.application.TApplicationDTO<
  TResponseDTO,
  TResponseDTOSeed
> = {
  create: (p) => {
    return { ...p, foo: "TResponseDTO" } as TResponseDTO;
  },
};
