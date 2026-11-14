import { bg, type Messages } from "./bg";

// English can be added later: create ./en.ts with the same shape and
// select it here based on the active locale.
const messages: Record<"bg", Messages> = { bg };

export function getMessages(locale: "bg" = "bg"): Messages {
  return messages[locale];
}
