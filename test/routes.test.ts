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

describe("DELETE /baskets/:id", () => {
	it("should return 204 when deleting a basket", async () => {
		const response = await request(app).delete("/baskets/123");

		expect(response.status).toBe(204);
	});
});

describe("POST /totalPrice", () => {
	it("should return the total price without saving", async () => {
		const response = await request(app).post("/totalPrice").send({
			products: [{ name: "T-shirt", quantity: 1, type: "TSHIRT", price: 100 }],
			reductionCode: "DISCOUNTPERCENT10",
		});

		expect(response.status).toBe(200);
		expect(response.body).toEqual({ total: 90 });
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

	it("should apply percentage discount with reduction code", async () => {
		const response = await request(app).post("/baskets").send({
			products: [{ name: "T-shirt", quantity: 1, type: "TSHIRT", price: 100 }],
			reductionCode: "DISCOUNTPERCENT10",
		});

		expect(response.status).toBe(200);
		expect(response.body).toEqual({ total: 90 });
	});
});
