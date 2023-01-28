import type * as TSeso from "../../../../../lib";

type TDomainServiceParam = TSeso.TDDD.domain.TStrictValueObject<{
  name: string;
}>;
type TDomainServiceResponse = TSeso.TDDD.domain.TStrictValueObject<{
  foo: "TDomainServiceResponse";
  name: string;
}>;

export const testDomainService: TSeso.TDDD.domain.TDomainService<
  TDomainServiceParam,
  TDomainServiceResponse
> = (_$r, p) => {
  return { ...p, foo: "TDomainServiceResponse" } as TDomainServiceResponse;
};
