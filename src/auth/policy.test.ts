import { describe, expect, it } from "vitest";
import {
  canAccessBackoffice,
  canManageCatalogAndCustomers,
  canManageCompany,
  canOrderForCompany,
} from "./policy";

describe("authorization policy", () => {
  it("lets admin and staff into the backoffice, not customers", () => {
    expect(canAccessBackoffice("ADMIN")).toBe(true);
    expect(canAccessBackoffice("STAFF")).toBe(true);
    expect(canAccessBackoffice("CUSTOMER")).toBe(false);
  });
  it("lets only admin manage catalog and customers", () => {
    expect(canManageCatalogAndCustomers("ADMIN")).toBe(true);
    expect(canManageCatalogAndCustomers("STAFF")).toBe(false);
  });
  it("lets members order only for approved companies", () => {
    expect(canOrderForCompany("APPROVED", "ORDERER")).toBe(true);
    expect(canOrderForCompany("PENDING", "OWNER")).toBe(false);
    expect(canOrderForCompany("REJECTED", "OWNER")).toBe(false);
    expect(canOrderForCompany("APPROVED", null)).toBe(false);
  });
  it("lets only owners manage the company", () => {
    expect(canManageCompany("OWNER")).toBe(true);
    expect(canManageCompany("ORDERER")).toBe(false);
    expect(canManageCompany(null)).toBe(false);
  });
});
