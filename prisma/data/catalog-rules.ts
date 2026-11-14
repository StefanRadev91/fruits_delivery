/** Catalog rules shared by the demo seed and the safe catalog loader. */
/** Products we know are imported (the supplier list does not say; everything else stays unknown). */
export const IMPORTED = new Set([
  "Авокадо Тропс", "Авокадо зелено", "Банани", "Ананас", "Грейпфрут фреш", "Лайм", "Лимони",
  "Портокал десертен", "Портокал фреш", "Бразилски орех",
]);
/** Whole items priced per kg: the real weight is entered at picking. */
export const VARIABLE_WEIGHT = new Set(["Зеле", "Зеле червено", "Карфиол", "Романеско", "Ананас", "Целина"]);
/** Bulk staples are ordered in bigger quantities. */
export const BULK_MIN: Record<string, number> = {
  "Картоф стар": 5, "Картоф френски": 5, "Холандски картоф за пържене": 5,
  "Лук кромид": 2, "Лук червен": 2, "Морков": 2, "Зеле": 2, "Зеле червено": 2, "Цвекло червено": 2,
};

/** Order rules by product: staples bulk, pricey items by half kilo, others from 1 kg in half-kilo steps. */
export function quantityRules(name: string, unit: string, netCents: number) {
  if (unit !== "KG") return { min: 1, step: 1 };
  if (BULK_MIN[name]) return { min: BULK_MIN[name], step: 1 };
  return netCents >= 800 ? { min: 0.5, step: 0.5 } : { min: 1, step: 0.5 };
}
