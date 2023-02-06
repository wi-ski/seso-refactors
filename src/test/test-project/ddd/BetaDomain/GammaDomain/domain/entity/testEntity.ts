import type * as TSeso from "../../../../../lib";

export type TTestEntity = TSeso.TDDD.domain.TStrictEntity<{
  foo: "TTestEntity";
  name: string;
}>;
export type TTestEntitySeed = { name?: string };

export const testEntity: TSeso.TDDD.domain.TEntity<
  TTestEntity,
  TTestEntitySeed
> = {
  create: (p) => {
    return { ...p, foo: "TTestEntity" } as TTestEntity;
  },
};
