import type * as TSeso from "../../../../../lib";
import type { TTestEntity } from "../../domain/entity";

export const testApplicationService: TSeso.TDDD.application.TApplicationService<
  TTestEntity,
  TTestEntity
> = (_$r, p) => {
  return _$r.BetaDomain.domain.entity.testEntity.create(p);
};
