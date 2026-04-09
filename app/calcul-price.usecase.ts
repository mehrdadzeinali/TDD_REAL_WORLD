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

export const discountCodeMap: Record<string, Discount> = {
  BLACKFRIDAY: { type: "BLACK_FRIDAY" },
  ONEFREEPULL: { type: "BUY_ONE_GET_ONE", productType: "PULL" } as any,
  DISCOUNTEURO30: { type: "FIXED", value: 30 } as any,
  DISCOUNTEURO10: { type: "FIXED", value: 10 } as any,
  DISCOUNTPERCENT10: { type: "PERCENTAGE", value: 10 } as any,
};

function isBlackFridayWeekend(date: Date): boolean {
  const blackFridayStart = new Date("2025-11-28T00:00:00");
  const blackFridayEnd = new Date("2025-11-30T23:59:59");
  return date >= blackFridayStart && date <= blackFridayEnd;
}

const DISCOUNT_ORDER = ["BUY_ONE_GET_ONE", "PERCENTAGE", "FIXED", "BLACK_FRIDAY"];

export function calculPrice(basket: Basket, date: Date = new Date()): number {
  let total = basket.products.reduce((sum, product) => sum + product.price * product.quantity, 0);

  const sortedDiscounts = [...basket.discounts].sort(
    (a, b) => DISCOUNT_ORDER.indexOf(a.type) - DISCOUNT_ORDER.indexOf(b.type)
  );

  for (const discount of sortedDiscounts) {
    if (discount.type === "BUY_ONE_GET_ONE") {
      const productType = (discount as any).productType;
      const product = basket.products.find((p) => p.type === productType);
      if (product) {
        const freeItems = Math.floor(product.quantity / 2);
        total = total - freeItems * product.price;
      }
    }
    if (discount.type === "PERCENTAGE") {
      const { value, productType, minAmount } = discount as any;
      if (minAmount && total < minAmount) continue;
      if (productType) {
        const subtotal = basket.products
          .filter((p) => p.type === productType)
          .reduce((sum, p) => sum + p.price * p.quantity, 0);
        total = total - subtotal * (value / 100);
      } else {
        total = total - total * (value / 100);
      }
    }
    if (discount.type === "FIXED") {
      total = total - (discount as any).value;
    }
    if (discount.type === "BLACK_FRIDAY" && isBlackFridayWeekend(date)) {
      total = total * 0.5;
    }
  }

  return Math.max(1, total);
}
