import { describe, expect, it } from "vitest";
import { isInSeason } from "./season";

describe("isInSeason", () => {
  it("is always in season without a season", () => {
    expect(isInSeason(1, null, null)).toBe(true);
  });
  it("handles a normal range", () => {
    expect(isInSeason(7, 6, 9)).toBe(true);
    expect(isInSeason(5, 6, 9)).toBe(false);
  });
  it("handles a range wrapping the year end", () => {
    expect(isInSeason(12, 11, 2)).toBe(true);
    expect(isInSeason(1, 11, 2)).toBe(true);
    expect(isInSeason(6, 11, 2)).toBe(false);
  });
});
