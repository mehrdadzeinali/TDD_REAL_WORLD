export type ProductsType = "TSHIRT" | "PULL";

export type Product = {
  name: string;
  quantity: number;
  type: ProductsType;
  price: number;
};

export type Discount = {
  type: string;
};

export type Basket = {
  products: Product[];
  discounts: Discount[];
};

export function calculPrice(basket: Basket): number {
  let total = basket.products.reduce((sum, product) => sum + product.price * product.quantity, 0);

  for (const discount of basket.discounts) {
    if (discount.type === "BUY_ONE_GET_ONE") {
      const productType = (discount as any).productType;
      const product = basket.products.find((p) => p.type === productType);
      if (product) {
        const freeItems = Math.floor(product.quantity / 2);
        total = total - freeItems * product.price;
      }
    }
    if (discount.type === "PERCENTAGE") {
      total = total - total * ((discount as any).value / 100);
    }
    if (discount.type === "FIXED") {
      total = total - (discount as any).value;
    }
  }

  return Math.max(1, total);
}
