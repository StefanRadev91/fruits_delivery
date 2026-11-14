import type { Audience } from "./types";

/** Rules of a delivery zone. Weekdays: 0 = Sunday ... 6 = Saturday. */
export type ZoneRules = {
  deliveryWeekdays: number[];
  /** Local (Europe/Sofia) cut-off time "HH:mm" on the day(s) before delivery. */
  cutoffTime: string;
  /** Days before delivery the cut-off falls on. 1 = order by 22:00 for next-day delivery. */
  leadDays: number;
  b2b: { minOrderCents: number; feeCents: number };
  b2c: { minOrderCents: number; feeCents: number };
};

export function rulesFor(zone: ZoneRules, audience: Audience) {
  return audience === "B2B" ? zone.b2b : zone.b2c;
}

const TZ = "Europe/Sofia";

/** Current local date "YYYY-MM-DD" and time "HH:mm" in Sofia. */
export function sofiaNow(now: Date): { date: string; time: string } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)!.value;
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    time: `${get("hour")}:${get("minute")}`,
  };
}

/** Adds days to a "YYYY-MM-DD" date (calendar arithmetic, no timezone issues). */
export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function weekdayOf(date: string): number {
  return new Date(`${date}T00:00:00Z`).getUTCDay();
}

/** Is it still possible to order for this delivery date at the given moment? */
export function isBeforeCutoff(now: Date, deliveryDate: string, zone: ZoneRules): boolean {
  const cutoffDate = addDays(deliveryDate, -zone.leadDays);
  const local = sofiaNow(now);
  // "YYYY-MM-DD" and "HH:mm" strings compare correctly as text.
  return `${local.date}T${local.time}` < `${cutoffDate}T${zone.cutoffTime}`;
}

export function isDeliveryDay(date: string, zone: ZoneRules): boolean {
  return zone.deliveryWeekdays.includes(weekdayOf(date));
}

/** Upcoming delivery dates that can still be ordered, soonest first. */
export function availableDeliveryDates(
  now: Date,
  zone: ZoneRules,
  opts: { maxDays?: number; limit?: number } = {},
): string[] {
  const { maxDays = 21, limit = 10 } = opts;
  const today = sofiaNow(now).date;
  const result: string[] = [];
  for (let i = 0; i <= maxDays && result.length < limit; i++) {
    const date = addDays(today, i);
    if (isDeliveryDay(date, zone) && isBeforeCutoff(now, date, zone)) {
      result.push(date);
    }
  }
  return result;
}
