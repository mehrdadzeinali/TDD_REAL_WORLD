import { Discount } from "./calcul-price.usecase";
import { ReductionGateway } from "./reduction.gateway";

// Stub : retourne des données prédéfinies pour isoler les tests du vrai service de réduction
export class StubReductionGateway implements ReductionGateway {
	private discounts: Record<string, Discount> = {
		DISCOUNTPERCENT10: { type: "PERCENTAGE", value: 10 } as any,
		DISCOUNTEURO30: { type: "FIXED", value: 30 } as any,
		ONEFREEPULL: { type: "BUY_ONE_GET_ONE", productType: "PULL" } as any,
		BLACKFRIDAY: { type: "BLACK_FRIDAY" },
	};

	getByCode(code: string): Discount | undefined {
		return this.discounts[code];
	}
}
