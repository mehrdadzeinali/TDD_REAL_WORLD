import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../api/controllers/routes";

describe("GET /baskets", () => {
	it("should return an empty list", async () => {
		const response = await request(app).get("/baskets");

		expect(response.status).toBe(200);
		expect(response.body).toEqual([]);
	});
});

describe("POST /baskets", () => {
	it("should return the total price of the basket", async () => {
		const response = await request(app).post("/baskets").send({
			products: [{ name: "T-shirt", quantity: 2, type: "TSHIRT", price: 20 }],
			discounts: [],
		});

		expect(response.status).toBe(200);
		expect(response.body).toEqual({ total: 40 });
	});

	it("should apply percentage discount", async () => {
		const response = await request(app).post("/baskets").send({
			products: [{ name: "T-shirt", quantity: 1, type: "TSHIRT", price: 100 }],
			discounts: [{ type: "PERCENTAGE", value: 10 }],
		});

		expect(response.status).toBe(200);
		expect(response.body).toEqual({ total: 90 });
	});
});
