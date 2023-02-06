
import type * as TSeso from "@/lib/types";

export type TParams = {
a: "a",b: "b",d: import("/Users/willdembinski/projects/seso-refactors/src/test/test-project/ddd/BetaDomain/domain/entity/testEntity").TTestEntity,
};
export type TResponse = string[];

export const providerName: TSeso.TDDD.infrastructure.TDomainService<TParams, TResponse> = (
  $r,
  {
    a,b,d,
  }
) => {
  
  const foo = ["z"].map((z) => {
    const c = "c";
    [].map(() => 1);
    return a + b + c + d + z;
  });
  return foo;

};
