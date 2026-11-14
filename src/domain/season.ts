/**
 * Is the product in season in the given month (1-12)?
 * No season set = available all year. A season may wrap the year end (11 -> 2).
 */
export function isInSeason(month: number, start?: number | null, end?: number | null): boolean {
  if (start == null || end == null) return true;
  return start <= end ? month >= start && month <= end : month >= start || month <= end;
}
