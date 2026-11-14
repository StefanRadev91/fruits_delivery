import { describe, expect, it } from "vitest";
import { computeTotals, type OrderLine } from "./order-totals";
import { displayUnitPrice, lineAmount, unitPriceFor } from "./pricing";
import { isValidQuantity } from "./quantity";

describe("price lists", () => {
  it("uses the base price without a price list", () => {
    expect(unitPriceFor("p1", 200)).toBe(200);
  });
  it("applies a percentage discount", () => {
    expect(unitPriceFor("p1", 250, { discountPercent: 10 })).toBe(225);
  });
  it("prefers a per-product override", () => {
    const list = { discountPercent: 10, overrides: { p1: 180 } };
    expect(unitPriceFor("p1", 250, list)).toBe(180);
    expect(unitPriceFor("p2", 250, list)).toBe(225);
  });
  it("computes line amounts with rounding", () => {
    expect(lineAmount(299, 1.5)).toBe(449); // 448.5
  });
});

describe("quantity rules", () => {
  const rules = { minQuantity: 1, stepQuantity: 0.5 };
  it("accepts min and multiples of step", () => {
    expect(isValidQuantity(1, rules)).toBe(true);
    expect(isValidQuantity(2.5, rules)).toBe(true);
  });
  it("rejects below min and off-step values", () => {
    expect(isValidQuantity(0.5, rules)).toBe(false);
    expect(isValidQuantity(1.25, rules)).toBe(false);
  });
  it("handles float noise (0.1 steps)", () => {
    expect(isValidQuantity(0.3, { minQuantity: 0.1, stepQuantity: 0.1 })).toBe(true);
  });
});

describe("order totals", () => {
  const delivery = { minOrderCents: 3000, feeCents: 500 };
  const fixed: OrderLine = { unitNetCents: 200, quantity: 10, variableWeight: false };

  it("adds delivery fee and VAT", () => {
    const t = computeTotals([fixed], delivery, "B2B");
    expect(t.goodsNetCents).toBe(2000);
    expect(t.netCents).toBe(2500);
    expect(t.vatCents).toBe(500);
    expect(t.grossCents).toBe(3000);
    expect(t.isEstimate).toBe(false);
  });

  it("marks variable-weight lines as estimate until weighed", () => {
    const line: OrderLine = { unitNetCents: 1000, quantity: 5, variableWeight: true };
    const t = computeTotals([line], delivery, "B2B");
    expect(t.isEstimate).toBe(true);
    expect(t.goodsNetCents).toBe(5000);
  });

  it("recalculates from the actual weight and becomes final", () => {
    const line: OrderLine = {
      unitNetCents: 1000,
      quantity: 5,
      variableWeight: true,
      actualQuantity: 4.62,
    };
    const t = computeTotals([line], delivery, "B2B");
    expect(t.goodsNetCents).toBe(4620);
    expect(t.isEstimate).toBe(false);
  });

  it("ignores actual weight for fixed items", () => {
    const t = computeTotals([{ ...fixed, actualQuantity: 99 }], delivery, "B2B");
    expect(t.goodsNetCents).toBe(2000);
  });

  it("checks the minimum order net for B2B and gross for B2C", () => {
    const line: OrderLine = { unitNetCents: 100, quantity: 26, variableWeight: false }; // net 26.00, gross 31.20
    expect(computeTotals([line], delivery, "B2B").belowMinimum).toBe(true);
    expect(computeTotals([line], delivery, "B2C").belowMinimum).toBe(false);
  });
});

describe("displayUnitPrice", () => {
  const product = { id: "p1", basePriceCents: 250, vatRate: 20 };
  it("shows B2C the gross price", () => {
    expect(displayUnitPrice(product, "B2C")).toEqual({ cents: 300, includesVat: true });
  });
  it("shows B2B the net price with their price list", () => {
    expect(displayUnitPrice(product, "B2B", { discountPercent: 10 })).toEqual({ cents: 225, includesVat: false });
    expect(displayUnitPrice(product, "B2B")).toEqual({ cents: 250, includesVat: false });
  });
});
