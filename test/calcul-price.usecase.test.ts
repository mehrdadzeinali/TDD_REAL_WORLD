import { describe, it, expect } from "vitest";
import { calculPrice } from "@/calcul-price.usecase";

describe("calculPrice", () => {
	it("should return total price without discounts", () => {
		const basket = {
			products: [{ name: "T-shirt", quantity: 2, type: "TSHIRT" as const, price: 20 }],
			discounts: [],
		};

		expect(calculPrice(basket)).toBe(40);
	});

	it("should apply percentage discount", () => {
		const basket = {
			products: [{ name: "T-shirt", quantity: 1, type: "TSHIRT" as const, price: 100 }],
			discounts: [{ type: "PERCENTAGE", value: 10 }],
		};

		expect(calculPrice(basket)).toBe(90);
	});
});
