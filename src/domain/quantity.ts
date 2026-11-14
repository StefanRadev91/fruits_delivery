/** Quantities are decimals (e.g. 0.5 kg). We compare in thousandths to avoid float errors. */
const toMilli = (q: number) => Math.round(q * 1000);

export type QuantityRules = { minQuantity: number; stepQuantity: number };

/**
 * Valid when quantity >= min and (quantity - min) is a multiple of step.
 * Example: min 1, step 0.5 -> 1, 1.5, 2 ... are valid; 1.25 is not.
 */
export function isValidQuantity(q: number, rules: QuantityRules): boolean {
  const qm = toMilli(q);
  const min = toMilli(rules.minQuantity);
  const step = toMilli(rules.stepQuantity);
  if (!Number.isFinite(q) || step <= 0 || qm < min) return false;
  return (qm - min) % step === 0;
}
