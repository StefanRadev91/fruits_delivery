import {
  addDays,
  availableDeliveryDates,
  sofiaNow,
  weekdayOf,
  type ZoneRules,
} from "./delivery";

export type StandingOrder = {
  active: boolean;
  /** Weekdays it repeats on: 0 = Sunday ... 6 = Saturday. Daily = all seven. */
  weekdays: number[];
  /** First and last delivery date "YYYY-MM-DD" (end is optional). */
  startDate: string;
  endDate?: string | null;
  /** Delivery dates the customer skipped. */
  skippedDates: string[];
};

/** Does the standing order want a delivery on this date? */
export function occursOn(order: StandingOrder, date: string): boolean {
  if (!order.active) return false;
  if (date < order.startDate) return false;
  if (order.endDate && date > order.endDate) return false;
  if (order.skippedDates.includes(date)) return false;
  return order.weekdays.includes(weekdayOf(date));
}

/**
 * Delivery dates for which an order should be generated now:
 * open for ordering (before cut-off), within the horizon, matching the schedule
 * and not already generated. Meant to run periodically (cron) before cut-off.
 */
export function datesToGenerate(
  now: Date,
  order: StandingOrder,
  zone: ZoneRules,
  alreadyGenerated: string[],
  horizonDays = 2,
): string[] {
  const lastDate = addDays(sofiaNow(now).date, horizonDays);
  return availableDeliveryDates(now, zone, { maxDays: horizonDays })
    .filter((d) => d <= lastDate)
    .filter((d) => occursOn(order, d))
    .filter((d) => !alreadyGenerated.includes(d));
}
