import cors from "cors";
import express, { Request, Response } from "express";
import { calculPrice, discountCodeMap } from "../../app/calcul-price.usecase";

const app = express();
app.use(express.json());
app.use(cors());

app.get("/baskets", (request: Request, response: Response) => {
	response.json([]);
});

app.post("/totalPrice", (request: Request, response: Response) => {
	const { products, reductionCode } = request.body;
	const discounts = reductionCode && discountCodeMap[reductionCode] ? [discountCodeMap[reductionCode]] : [];
	const total = calculPrice({ products, discounts });
	response.json({ total });
});

app.post("/baskets", (request: Request, response: Response) => {
	const { products, reductionCode } = request.body;
	const discounts = reductionCode && discountCodeMap[reductionCode] ? [discountCodeMap[reductionCode]] : [];
	const total = calculPrice({ products, discounts });
	response.json({ total });
});

app.delete("/baskets/:id", (request: Request, response: Response) => {
	response.status(204).send();
});

export default app;
