import type * as TSeso from "../../../../lib";
import type { TTestEntity } from "../../domain/entity";

export const d = "d" as unknown as TTestEntity;
export const testApplicationService: TSeso.TDDD.application.TApplicationService<
  TTestEntity,
  TTestEntity
> = (_$r, p) => {
  const a = "a";
  const b = "b";
  const foo = ["z"].map((z) => {
    const c = "c";
    [].map(() => 1);
    return a + b + c + d + z;
  });

  return _$r.BetaDomain.domain.entity.testEntity.create(p);
};
