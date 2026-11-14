/** Pure authorization rules (no I/O) so they are easy to unit test. */
export type Role = "ADMIN" | "STAFF" | "CUSTOMER";
export type CompanyRole = "OWNER" | "ORDERER";
export type CompanyStatus = "PENDING" | "APPROVED" | "REJECTED";

/** Admin panel: picking, deliveries and orders. */
export const canAccessBackoffice = (role: Role) => role === "ADMIN" || role === "STAFF";

/** Prices, customers, B2B approvals, price lists and users. */
export const canManageCatalogAndCustomers = (role: Role) => role === "ADMIN";

/** A member of an approved company may place orders for it. */
export function canOrderForCompany(status: CompanyStatus, role: CompanyRole | null) {
  return status === "APPROVED" && role !== null;
}

/** Only company owners manage users, addresses and standing orders. */
export const canManageCompany = (role: CompanyRole | null) => role === "OWNER";
