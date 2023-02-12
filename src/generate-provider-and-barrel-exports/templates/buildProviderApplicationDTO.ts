import { templateFillerBuilder } from "./utils";

import type { TSourceFileConfiguratorFn } from "../constants";

const filler = templateFillerBuilder`
import * as Framework from "@/lib/framework";

import type * as TSeso from "@/lib/types";

export const ${"TEMPLATE_PROVIDER_NAME"} = Framework.DTO.create({
  schema: (s) => {
    return s.object({
      /* Your validation schema */
    });
  },
});
`;
export const buildProviderApplicationDTO: TSourceFileConfiguratorFn = (p) => {
  return filler(p.templateParams);
};
