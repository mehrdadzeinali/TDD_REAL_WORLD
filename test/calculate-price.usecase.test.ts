import { describe, it, expect, vi } from "vitest";
import { CalculatePriceUseCase } from "@/calculate-price.usecase";
import { NotificationService } from "@/notification.service";
import { StubReductionGateway } from "@/stub-reduction.gateway";

describe("CalculatePriceUseCase", () => {
	// Test 1 : panier sans code promo
	// RED   → CalculatePriceUseCase n'existe pas
	// GREEN → execute() retourne la somme price * quantity
	it("should return total price without discounts", () => {
		const useCase = new CalculatePriceUseCase();
		const basket = {
			products: [{ name: "T-shirt", quantity: 2, type: "TSHIRT" as const, price: 20 }],
			discounts: [],
		};

		expect(useCase.execute(basket)).toBe(40);
	});

	// Test 2 : réduction en pourcentage
	// RED   → PERCENTAGE non géré
	// GREEN → applique total - total * (value / 100)
	it("should apply percentage discount", () => {
		const useCase = new CalculatePriceUseCase();
		const basket = {
			products: [{ name: "T-shirt", quantity: 1, type: "TSHIRT" as const, price: 100 }],
			discounts: [{ type: "PERCENTAGE", value: 10 }],
		};

		expect(useCase.execute(basket)).toBe(90);
	});

	// Test 3 : résolution d'un code promo via le StubReductionGateway
	// RED   → CalculatePriceUseCase ne prend pas de gateway en paramètre
	// GREEN → injecter StubReductionGateway et résoudre le code avant le calcul
	it("should resolve discount from reduction code via gateway", () => {
		const stubGateway = new StubReductionGateway();
		const useCase = new CalculatePriceUseCase(undefined, stubGateway);
		const basket = {
			products: [{ name: "T-shirt", quantity: 1, type: "TSHIRT" as const, price: 100 }],
			discounts: [],
		};

		const total = useCase.execute(basket, new Date(), "DISCOUNTPERCENT10");

		expect(total).toBe(90);
	});

	// Test 4 : notification envoyée après le calcul
	// RED   → CalculatePriceUseCase n'appelle pas le service de notification
	// GREEN → injecter un SpyNotificationService et vérifier que notify() est appelé avec le bon prix
	it("should notify with the final price after calculation", () => {
		const spyNotificationService: NotificationService = {
			notify: vi.fn(),
		};
		const useCase = new CalculatePriceUseCase(spyNotificationService);
		const basket = {
			products: [{ name: "T-shirt", quantity: 1, type: "TSHIRT" as const, price: 100 }],
			discounts: [{ type: "PERCENTAGE", value: 10 }],
		};

		useCase.execute(basket);

		expect(spyNotificationService.notify).toHaveBeenCalledWith(90);
	});
});
