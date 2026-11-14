import { addVat } from "./vat";

export type PriceList = {
  /** Percentage discount on base price, e.g. 10 = -10%. */
  discountPercent: number;
  /** Fixed net unit price per product id (cents), overrides the discount. */
  overrides?: Record<string, number>;
};

/** Net unit price (cents) for a company. Without a price list it is the base price. */
export function unitPriceFor(
  productId: string,
  baseNetCents: number,
  priceList?: PriceList | null,
): number {
  if (!priceList) return baseNetCents;
  const override = priceList.overrides?.[productId];
  if (override !== undefined) return override;
  return Math.round((baseNetCents * (100 - priceList.discountPercent)) / 100);
}

/** Line amount (cents) for a net unit price and quantity. */
export function lineAmount(unitNetCents: number, quantity: number): number {
  return Math.round(unitNetCents * quantity);
}

/**
 * Unit price to show in the catalog.
 * B2C sees the gross price (VAT included); B2B sees the net price after their price list.
 */
export function displayUnitPrice(
  product: { id: string; basePriceCents: number; vatRate: number },
  audience: "B2B" | "B2C",
  priceList?: PriceList | null,
): { cents: number; includesVat: boolean } {
  if (audience === "B2C") {
    return { cents: addVat(product.basePriceCents, product.vatRate), includesVat: true };
  }
  return { cents: unitPriceFor(product.id, product.basePriceCents, priceList), includesVat: false };
}
