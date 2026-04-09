import cors from "cors";
import express, { Request, Response } from "express";
import { calculPrice } from "../../app/calcul-price.usecase";

const app = express();
app.use(express.json());
app.use(cors());

app.get("/baskets", (request: Request, response: Response) => {
	response.json([]);
});

app.post("/baskets", (request: Request, response: Response) => {
	const { products, discounts } = request.body;
	const total = calculPrice({ products, discounts });
	response.json({ total });
});

export default app;
