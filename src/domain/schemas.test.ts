import { describe, expect, it } from "vitest";
import { isValidEik } from "./eik";
import { businessApplicationSchema, registerSchema, standingOrderInputSchema } from "./schemas";

describe("ЕИК", () => {
  it("accepts valid 9 and 13 digit numbers", () => {
    expect(isValidEik("123456786")).toBe(true);
    expect(isValidEik("1234567860001")).toBe(true);
  });
  it("rejects bad checksum or format", () => {
    expect(isValidEik("123456789")).toBe(false);
    expect(isValidEik("1234567860002")).toBe(false);
    expect(isValidEik("12345")).toBe(false);
    expect(isValidEik("abcdefghi")).toBe(false);
  });
});

describe("schemas", () => {
  const valid = {
    companyName: "Ресторант Роза ЕООД",
    eik: "123456786",
    vatNumber: "bg123456786",
    mol: "Иван Петров",
    contactName: "Мария Иванова",
    contactPhone: "+359 888 123 456",
    email: "Info@Roza.bg",
    password: "supersecret",
    addresses: [
      { label: "Ресторант", city: "София", postcode: "1000", street: "ул. Витоша 1" },
    ],
  };

  it("parses a valid business application and normalizes email/VAT", () => {
    const r = businessApplicationSchema.parse(valid);
    expect(r.email).toBe("info@roza.bg");
    expect(r.vatNumber).toBe("BG123456786");
  });
  it("rejects invalid ЕИК, postcode and missing addresses", () => {
    expect(businessApplicationSchema.safeParse({ ...valid, eik: "123456789" }).success).toBe(false);
    const badAddr = { ...valid, addresses: [{ ...valid.addresses[0], postcode: "10" }] };
    expect(businessApplicationSchema.safeParse(badAddr).success).toBe(false);
    expect(businessApplicationSchema.safeParse({ ...valid, addresses: [] }).success).toBe(false);
  });
  it("requires at least one weekday and item for standing orders", () => {
    const base = {
      weekdays: [1],
      startDate: "2026-01-12",
      items: [{ productId: "p1", quantity: 2 }],
    };
    expect(standingOrderInputSchema.safeParse(base).success).toBe(true);
    expect(standingOrderInputSchema.safeParse({ ...base, weekdays: [] }).success).toBe(false);
    expect(standingOrderInputSchema.safeParse({ ...base, items: [] }).success).toBe(false);
  });
});

describe("registerSchema", () => {
  it("accepts a household registration and treats empty phone as missing", () => {
    const r = registerSchema.parse({ name: "Ана", email: "ANA@Example.bg", phone: "", password: "12345678" });
    expect(r.email).toBe("ana@example.bg");
    expect(r.phone).toBeUndefined();
  });
  it("rejects short passwords and bad emails", () => {
    expect(registerSchema.safeParse({ name: "Ана", email: "ana@example.bg", password: "123" }).success).toBe(false);
    expect(registerSchema.safeParse({ name: "Ана", email: "nope", password: "12345678" }).success).toBe(false);
  });
});
