import { describe, expect, it } from "vitest";
import { ourNetCents, priceList, supplierNetCents, vatLooksOff, type Row } from "./price-list";

describe("price list", () => {
  it("uses the supplier's net price when given", () => {
    const row: Row = ["Банани", "KG", 1.83, 2.19];
    expect(supplierNetCents(row)).toBe(183);
  });
  it("derives net from the VAT price when only that is given", () => {
    const row: Row = ["Орех екстра", "KG", null, 10.99];
    expect(supplierNetCents(row)).toBe(916); // 10.99 / 1.2
  });
  it("lowers the supplier price by the given percent", () => {
    const row: Row = ["Банани", "KG", 1.83, 2.19];
    expect(ourNetCents(row, 10)).toBe(165); // 183 * 0.9 = 164.7
    expect(ourNetCents(row, 0)).toBe(183);
  });
  it("flags rows where the VAT columns don't match 20%", () => {
    expect(vatLooksOff(["Банани", "KG", 1.83, 2.19])).toBe(false);
    expect(vatLooksOff(["Ананас", "KG", 2.99, 2.99])).toBe(true);
    expect(vatLooksOff(["Орех екстра", "KG", null, 10.99])).toBe(false);
  });
  it("has a price for every product and no duplicate names", () => {
    const names = new Set<string>();
    for (const rows of Object.values(priceList)) {
      for (const row of rows) {
        expect(row[2] ?? row[3], row[0]).toBeGreaterThan(0);
        expect(names.has(row[0]), `duplicate: ${row[0]}`).toBe(false);
        names.add(row[0]);
      }
    }
  });
});
