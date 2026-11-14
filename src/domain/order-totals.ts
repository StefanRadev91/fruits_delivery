import { lineAmount } from "./pricing";
import type { Audience } from "./types";
import { addVat, vatOf } from "./vat";
import { appConfig } from "@/config/app";

export type OrderLine = {
  unitNetCents: number;
  /** Quantity the customer ordered (estimate for variable-weight items). */
  quantity: number;
  /** Variable-weight item: the real weight is entered at picking. */
  variableWeight: boolean;
  /** Actual quantity entered by staff at picking. */
  actualQuantity?: number | null;
};

export type DeliveryRules = {
  minOrderCents: number;
  feeCents: number;
};

export type Totals = {
  goodsNetCents: number;
  deliveryFeeNetCents: number;
  netCents: number;
  vatCents: number;
  grossCents: number;
  /** True while any variable-weight line has no actual weight yet ("ориентировъчна сума"). */
  isEstimate: boolean;
  /** Goods value is below the zone minimum (compared net for B2B, gross for B2C). */
  belowMinimum: boolean;
};

/** The quantity that is billed: actual weight when known, otherwise the ordered quantity. */
export function billedQuantity(line: OrderLine): number {
  return line.variableWeight && line.actualQuantity != null
    ? line.actualQuantity
    : line.quantity;
}

export function isLineEstimate(line: OrderLine): boolean {
  return line.variableWeight && line.actualQuantity == null;
}

/**
 * Totals for an order. Prices are net; VAT is added on top.
 * B2B sees net amounts, B2C sees gross amounts (the numbers are the same, only the display differs).
 * The delivery fee is net and carries VAT too.
 */
export function computeTotals(
  lines: OrderLine[],
  delivery: DeliveryRules,
  audience: Audience,
  vatRate = appConfig.vatRate,
): Totals {
  const goodsNetCents = lines.reduce(
    (sum, l) => sum + lineAmount(l.unitNetCents, billedQuantity(l)),
    0,
  );
  const netCents = goodsNetCents + delivery.feeCents;
  const vatCents = vatOf(netCents, vatRate);
  const goodsForMinimum =
    audience === "B2C" ? addVat(goodsNetCents, vatRate) : goodsNetCents;
  return {
    goodsNetCents,
    deliveryFeeNetCents: delivery.feeCents,
    netCents,
    vatCents,
    grossCents: netCents + vatCents,
    isEstimate: lines.some(isLineEstimate),
    belowMinimum: goodsForMinimum < delivery.minOrderCents,
  };
}
