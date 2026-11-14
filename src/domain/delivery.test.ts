import { describe, expect, it } from "vitest";
import {
  addDays,
  availableDeliveryDates,
  isBeforeCutoff,
  sofiaNow,
  type ZoneRules,
} from "./delivery";
import { datesToGenerate, occursOn, type StandingOrder } from "./standing-orders";

// Mon-Sat delivery, order by 22:00 the day before.
const zone: ZoneRules = {
  deliveryWeekdays: [1, 2, 3, 4, 5, 6],
  cutoffTime: "22:00",
  leadDays: 1,
  b2b: { minOrderCents: 0, feeCents: 0 },
  b2c: { minOrderCents: 2000, feeCents: 300 },
};

// Winter: Sofia = UTC+2. 2026-01-12 is a Monday.
const at = (iso: string) => new Date(iso);

describe("sofiaNow", () => {
  it("converts to Sofia time (winter UTC+2, summer UTC+3)", () => {
    expect(sofiaNow(at("2026-01-12T20:30:00Z"))).toEqual({ date: "2026-01-12", time: "22:30" });
    expect(sofiaNow(at("2026-07-12T20:30:00Z"))).toEqual({ date: "2026-07-12", time: "23:30" });
  });
  it("rolls over to the next local day", () => {
    expect(sofiaNow(at("2026-01-12T22:30:00Z")).date).toBe("2026-01-13");
  });
});

describe("cut-off", () => {
  it("allows next-day delivery before 22:00 local", () => {
    // 21:59 Sofia = 19:59Z
    expect(isBeforeCutoff(at("2026-01-12T19:59:00Z"), "2026-01-13", zone)).toBe(true);
  });
  it("closes at 22:00 local", () => {
    expect(isBeforeCutoff(at("2026-01-12T20:00:00Z"), "2026-01-13", zone)).toBe(false);
  });
  it("respects summer time", () => {
    // 21:59 Sofia in summer = 18:59Z
    expect(isBeforeCutoff(at("2026-07-12T18:59:00Z"), "2026-07-13", zone)).toBe(true);
    expect(isBeforeCutoff(at("2026-07-12T19:00:00Z"), "2026-07-13", zone)).toBe(false);
  });
});

describe("available delivery dates", () => {
  it("starts tomorrow before cut-off", () => {
    const dates = availableDeliveryDates(at("2026-01-12T10:00:00Z"), zone, { limit: 2 });
    expect(dates).toEqual(["2026-01-13", "2026-01-14"]);
  });
  it("starts the day after tomorrow after cut-off", () => {
    const dates = availableDeliveryDates(at("2026-01-12T21:00:00Z"), zone, { limit: 2 });
    expect(dates).toEqual(["2026-01-14", "2026-01-15"]);
  });
  it("skips non-delivery days (no Sunday)", () => {
    // Saturday 2026-01-17 morning -> Sunday 18 is skipped, Monday 19 is next.
    const dates = availableDeliveryDates(at("2026-01-17T08:00:00Z"), zone, { limit: 1 });
    expect(dates).toEqual(["2026-01-19"]);
  });
});

describe("addDays", () => {
  it("handles month boundaries", () => {
    expect(addDays("2026-01-31", 1)).toBe("2026-02-01");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });
});

describe("standing orders", () => {
  const order: StandingOrder = {
    active: true,
    weekdays: [1, 3, 5], // Mon, Wed, Fri
    startDate: "2026-01-01",
    endDate: null,
    skippedDates: [],
  };

  it("matches schedule, start/end, skips and active flag", () => {
    expect(occursOn(order, "2026-01-14")).toBe(true); // Wed
    expect(occursOn(order, "2026-01-13")).toBe(false); // Tue
    expect(occursOn({ ...order, startDate: "2026-02-01" }, "2026-01-14")).toBe(false);
    expect(occursOn({ ...order, endDate: "2026-01-10" }, "2026-01-14")).toBe(false);
    expect(occursOn({ ...order, skippedDates: ["2026-01-14"] }, "2026-01-14")).toBe(false);
    expect(occursOn({ ...order, active: false }, "2026-01-14")).toBe(false);
  });

  it("generates for the open dates that match", () => {
    // Mon 12 Jan 10:00Z: open dates within 2 days = Tue 13, Wed 14.
    const dates = datesToGenerate(at("2026-01-12T10:00:00Z"), order, zone, []);
    expect(dates).toEqual(["2026-01-14"]);
  });

  it("does not generate again for an already generated date", () => {
    const dates = datesToGenerate(at("2026-01-12T10:00:00Z"), order, zone, ["2026-01-14"]);
    expect(dates).toEqual([]);
  });

  it("does not generate for dates after cut-off", () => {
    // Tue 13 Jan 21:00Z (23:00 Sofia): Wed 14 is closed, Thu 15 does not match, Fri 16 is outside horizon.
    const dates = datesToGenerate(at("2026-01-13T21:00:00Z"), order, zone, []);
    expect(dates).toEqual([]);
  });
});
