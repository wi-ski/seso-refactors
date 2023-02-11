import { templateFillerBuilder } from "./utils";

import type { TSourceFileConfiguratorFn } from "../constants";

const filler = templateFillerBuilder`
import type * as TSeso from "@/lib/types";

export type ${"TEMPLATE_PARAMS_TYPE_NAME"} = ${"TEMPLATE_PARAMS_TYPE"};
export type ${"TEMPLATE_RESPONSE_TYPE_NAME"} = ${"TEMPLATE_RESPONSE_TYPE"};

export const ${"TEMPLATE_PROVIDER_NAME"}: TSeso.TDDD.infrastructure.TInfrastructureService<${"TEMPLATE_PARAMS_TYPE_NAME"}, ${"TEMPLATE_RESPONSE_TYPE_NAME"}> = (
  $r,
  ${"TEMPLATE_PARAMS_BLOB"}
) => {
  ${"TEMPLATE_FN_BODY"}
};
`;
export const buildProviderInfrastructureService: TSourceFileConfiguratorFn = (
  p
) => {};
