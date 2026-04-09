import { Basket, calculPrice } from "./calcul-price.usecase";
import { NotificationService } from "./notification.service";
import { ReductionGateway } from "./reduction.gateway";

export class CalculatePriceUseCase {
	constructor(
		private readonly notificationService?: NotificationService,
		private readonly reductionGateway?: ReductionGateway,
	) {}

	execute(basket: Basket, date: Date = new Date(), reductionCode?: string): number {
		const discounts = [...basket.discounts];

		if (reductionCode && this.reductionGateway) {
			const discount = this.reductionGateway.getByCode(reductionCode);
			if (discount) discounts.push(discount);
		}

		const total = calculPrice({ ...basket, discounts }, date);
		this.notificationService?.notify(total);
		return total;
	}
}
