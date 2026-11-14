import type { Unit } from "@/domain/types";

export const unitLabel: Record<Unit, string> = {
  KG: "кг",
  PIECE: "бр.",
  BUNCH: "връзка",
  CRATE: "каса",
  BOX: "кашон",
};

export const originLabel = { BULGARIA: "България", IMPORT: "Внос" } as const;

export const stockLabel = {
  IN_STOCK: "В наличност",
  LOW: "Ограничено количество",
  OUT_OF_STOCK: "Изчерпан",
} as const;

/** Index = JS weekday (0 = Sunday). */
export const weekdayNames = ["неделя", "понеделник", "вторник", "сряда", "четвъртък", "петък", "събота"];

/** "понеделник, сряда и петък" */
export function formatWeekdays(days: number[]): string {
  const order = [1, 2, 3, 4, 5, 6, 0];
  const names = order.filter((d) => days.includes(d)).map((d) => weekdayNames[d]);
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} и ${names[names.length - 1]}`;
}
