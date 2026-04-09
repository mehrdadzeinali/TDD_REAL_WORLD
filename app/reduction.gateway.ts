import { Discount } from "./calcul-price.usecase";

export interface ReductionGateway {
	getByCode(code: string): Discount | undefined;
}
