import { describe, expect, it } from "vitest";
import { formatMoney, toBgnCents } from "./money";
import { addVat, removeVat, vatOf } from "./vat";

describe("money", () => {
  it("converts EUR cents to BGN cents at the fixed rate", () => {
    expect(toBgnCents(100)).toBe(196); // 1.00 € = 1.95583 лв.
    expect(toBgnCents(1000)).toBe(1956);
  });
  it("formats EUR and optionally BGN", () => {
    expect(formatMoney(1250, { showBgn: false })).toBe("12,50 €");
    expect(formatMoney(1250, { showBgn: true })).toBe("12,50 € (24,45 лв.)");
    expect(formatMoney(5, { showBgn: false })).toBe("0,05 €");
  });
});

describe("vat", () => {
  it("adds 20% VAT with rounding", () => {
    expect(vatOf(1000)).toBe(200);
    expect(addVat(1000)).toBe(1200);
    expect(vatOf(333)).toBe(67); // 66.6
  });
  it("removes VAT", () => {
    expect(removeVat(1200)).toBe(1000);
  });
});
