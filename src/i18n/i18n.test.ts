import { describe, expect, it } from "vitest";
import { getMessages } from "./index";

describe("i18n", () => {
  it("returns Bulgarian messages by default", () => {
    expect(getMessages().nav.business).toBe("За бизнеса");
  });
});
