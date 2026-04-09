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

	it("should apply black friday discount during black friday weekend", () => {
		const blackFridayDate = new Date("2025-11-28T12:00:00");
		const basket = {
			products: [{ name: "T-shirt", quantity: 1, type: "TSHIRT" as const, price: 100 }],
			discounts: [{ type: "BLACK_FRIDAY" }],
		};

		expect(calculPrice(basket, blackFridayDate)).toBe(50);
	});

	it("should not apply black friday discount outside black friday weekend", () => {
		const normalDate = new Date("2025-11-20T12:00:00");
		const basket = {
			products: [{ name: "T-shirt", quantity: 1, type: "TSHIRT" as const, price: 100 }],
			discounts: [{ type: "BLACK_FRIDAY" }],
		};

		expect(calculPrice(basket, normalDate)).toBe(100);
	});

	it("should apply percentage discount only if minimum amount is reached", () => {
		const basket = {
			products: [{ name: "T-shirt", quantity: 1, type: "TSHIRT" as const, price: 20 }],
			discounts: [{ type: "PERCENTAGE", value: 10, minAmount: 30 }],
		};

		expect(calculPrice(basket)).toBe(20);
	});

	it("should apply percentage discount when minimum amount is reached", () => {
		const basket = {
			products: [{ name: "T-shirt", quantity: 1, type: "TSHIRT" as const, price: 50 }],
			discounts: [{ type: "PERCENTAGE", value: 10, minAmount: 30 }],
		};

		expect(calculPrice(basket)).toBe(45);
	});

	it("should apply multiple discounts in order: product then percentage then black friday", () => {
		const blackFridayDate = new Date("2025-11-28T12:00:00");
		const basket = {
			products: [{ name: "T-shirt", quantity: 2, type: "TSHIRT" as const, price: 50 }],
			discounts: [
				{ type: "BUY_ONE_GET_ONE", productType: "TSHIRT" },
				{ type: "PERCENTAGE", value: 10 },
				{ type: "BLACK_FRIDAY" },
			],
		};

		expect(calculPrice(basket, blackFridayDate)).toBe(22.5);
	});

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

	it("should not go below 1€ with black friday discount", () => {
		const blackFridayDate = new Date("2025-11-28T12:00:00");
		const basket = {
			products: [{ name: "T-shirt", quantity: 1, type: "TSHIRT" as const, price: 1 }],
			discounts: [{ type: "BLACK_FRIDAY" }],
		};

		expect(calculPrice(basket, blackFridayDate)).toBe(1);
	});
});
