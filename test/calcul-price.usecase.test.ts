import { describe, it, expect } from "vitest";
import { calculPrice } from "@/calcul-price.usecase";

describe("calculPrice", () => {
	// Test 1 : panier sans code promo
	// RED   → calculPrice n'existe pas
	// GREEN → retourne la somme price * quantity pour chaque produit
	it("should return total price without discounts", () => {
		const basket = {
			products: [{ name: "T-shirt", quantity: 2, type: "TSHIRT" as const, price: 20 }],
			discounts: [],
		};

		expect(calculPrice(basket)).toBe(40);
	});

	// Test 2 : réduction en pourcentage
	// RED   → PERCENTAGE non géré, retourne 100 au lieu de 90
	// GREEN → applique total - total * (value / 100)
	it("should apply percentage discount", () => {
		const basket = {
			products: [{ name: "T-shirt", quantity: 1, type: "TSHIRT" as const, price: 100 }],
			discounts: [{ type: "PERCENTAGE", value: 10 }],
		};

		expect(calculPrice(basket)).toBe(90);
	});

	// Test 3 : réduction fixe
	// RED   → FIXED non géré, retourne 100 au lieu de 70
	// GREEN → applique total - value
	it("should apply fixed discount", () => {
		const basket = {
			products: [{ name: "T-shirt", quantity: 1, type: "TSHIRT" as const, price: 100 }],
			discounts: [{ type: "FIXED", value: 30 }],
		};

		expect(calculPrice(basket)).toBe(70);
	});

	// Test 4 : réduction fixe ne descend jamais sous 1€
	// RED   → retourne 0 ou négatif sans protection
	// GREEN → Math.max(1, total)
	it("should not go below 1€ with fixed discount", () => {
		const basket = {
			products: [{ name: "T-shirt", quantity: 1, type: "TSHIRT" as const, price: 10 }],
			discounts: [{ type: "FIXED", value: 50 }],
		};

		expect(calculPrice(basket)).toBe(1);
	});

	// Test 5 : 1 acheté = 1 offert
	// RED   → BUY_ONE_GET_ONE non géré, retourne 40 au lieu de 20
	// GREEN → floor(quantity / 2) produits offerts déduits du total
	it("should apply buy one get one free on tshirts", () => {
		const basket = {
			products: [{ name: "T-shirt", quantity: 2, type: "TSHIRT" as const, price: 20 }],
			discounts: [{ type: "BUY_ONE_GET_ONE", productType: "TSHIRT" }],
		};

		expect(calculPrice(basket)).toBe(20);
	});

	// Test 6 : seuil minimum non atteint
	// RED   → discount appliqué même si total < minAmount
	// GREEN → si total < minAmount, on skip le discount
	it("should apply percentage discount only if minimum amount is reached", () => {
		const basket = {
			products: [{ name: "T-shirt", quantity: 1, type: "TSHIRT" as const, price: 20 }],
			discounts: [{ type: "PERCENTAGE", value: 10, minAmount: 30 }],
		};

		expect(calculPrice(basket)).toBe(20);
	});

	// Test 7 : seuil minimum atteint
	// RED   → (couvert par Test 6 déjà vert)
	// GREEN → discount appliqué quand total >= minAmount
	it("should apply percentage discount when minimum amount is reached", () => {
		const basket = {
			products: [{ name: "T-shirt", quantity: 1, type: "TSHIRT" as const, price: 50 }],
			discounts: [{ type: "PERCENTAGE", value: 10, minAmount: 30 }],
		};

		expect(calculPrice(basket)).toBe(45);
	});

	// Test 8 : cumul de discounts dans le bon ordre
	// RED   → résultat incorrect si ordre pas respecté
	// GREEN → tri par DISCOUNT_ORDER avant la boucle
	it("should apply multiple discounts in order: product then percentage then black friday", () => {
		const blackFridayDate = new Date("2025-11-28T12:00:00");
		const basket = {
			products: [{ name: "T-shirt", quantity: 2, type: "TSHIRT" as const, price: 50 }],
			discounts: [
				{ type: "BUY_ONE_GET_ONE", productType: "TSHIRT" }, // 100€ -> 50€
				{ type: "PERCENTAGE", value: 10 },                  // 50€ -> 45€
				{ type: "BLACK_FRIDAY" },                           // 45€ -> 22.5€
			],
		};

		expect(calculPrice(basket, blackFridayDate)).toBe(22.5);
	});

	// Test 9 : ordre forcé peu importe l'ordre d'entrée
	// RED   → résultat différent si discounts dans le mauvais ordre
	// GREEN → tri garantit toujours BUY_ONE_GET_ONE → PERCENTAGE/FIXED → BLACK_FRIDAY
	it("should enforce discount order regardless of input order", () => {
		const blackFridayDate = new Date("2025-11-28T12:00:00");
		const basket = {
			products: [{ name: "T-shirt", quantity: 2, type: "TSHIRT" as const, price: 50 }],
			discounts: [
				{ type: "BLACK_FRIDAY" },
				{ type: "PERCENTAGE", value: 10 },
				{ type: "BUY_ONE_GET_ONE", productType: "TSHIRT" },
			],
		};

		expect(calculPrice(basket, blackFridayDate)).toBe(22.5);
	});

	// Test 10 : discount sur type de produit spécifique
	// RED   → PERCENTAGE appliqué sur tout le panier au lieu du type ciblé
	// GREEN → calcul du sous-total filtré par productType
	it("should apply percentage discount only on specific product type", () => {
		const basket = {
			products: [
				{ name: "T-shirt", quantity: 1, type: "TSHIRT" as const, price: 50 },
				{ name: "Pull", quantity: 1, type: "PULL" as const, price: 50 },
			],
			discounts: [{ type: "PERCENTAGE", value: 10, productType: "TSHIRT" }],
		};

		expect(calculPrice(basket)).toBe(95);
	});

	// Test 11 : Black Friday pendant le bon weekend
	// RED   → BLACK_FRIDAY non géré, retourne 100 au lieu de 50
	// GREEN → total * 0.5 si date dans la plage 28/11-30/11/2025
	it("should apply black friday discount during black friday weekend", () => {
		const blackFridayDate = new Date("2025-11-28T12:00:00");
		const basket = {
			products: [{ name: "T-shirt", quantity: 1, type: "TSHIRT" as const, price: 100 }],
			discounts: [{ type: "BLACK_FRIDAY" }],
		};

		expect(calculPrice(basket, blackFridayDate)).toBe(50);
	});

	// Test 12 : Black Friday hors weekend
	// RED   → discount appliqué même hors période
	// GREEN → vérification isBlackFridayWeekend(date) avant d'appliquer
	it("should not apply black friday discount outside black friday weekend", () => {
		const normalDate = new Date("2025-11-20T12:00:00");
		const basket = {
			products: [{ name: "T-shirt", quantity: 1, type: "TSHIRT" as const, price: 100 }],
			discounts: [{ type: "BLACK_FRIDAY" }],
		};

		expect(calculPrice(basket, normalDate)).toBe(100);
	});

	// Test 13 : Black Friday ne descend pas sous 1€
	// RED   → retourne 0.5 au lieu de 1
	// GREEN → Math.max(1, total) s'applique aussi au Black Friday
	it("should not go below 1€ with black friday discount", () => {
		const blackFridayDate = new Date("2025-11-28T12:00:00");
		const basket = {
			products: [{ name: "T-shirt", quantity: 1, type: "TSHIRT" as const, price: 1 }],
			discounts: [{ type: "BLACK_FRIDAY" }],
		};

		expect(calculPrice(basket, blackFridayDate)).toBe(1);
	});
});
