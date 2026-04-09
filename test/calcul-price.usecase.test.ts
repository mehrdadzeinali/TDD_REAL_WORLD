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

	it("should apply fixed discount", () => {
		const basket = {
			products: [{ name: "T-shirt", quantity: 1, type: "TSHIRT" as const, price: 100 }],
			discounts: [{ type: "FIXED", value: 30 }],
		};

		expect(calculPrice(basket)).toBe(70);
	});

	it("should not go below 1€ with fixed discount", () => {
		const basket = {
			products: [{ name: "T-shirt", quantity: 1, type: "TSHIRT" as const, price: 10 }],
			discounts: [{ type: "FIXED", value: 50 }],
		};

		expect(calculPrice(basket)).toBe(1);
	});

	it("should apply buy one get one free on tshirts", () => {
		const basket = {
			products: [{ name: "T-shirt", quantity: 2, type: "TSHIRT" as const, price: 20 }],
			discounts: [{ type: "BUY_ONE_GET_ONE", productType: "TSHIRT" }],
		};

		expect(calculPrice(basket)).toBe(20);
	});
});
