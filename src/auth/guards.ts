import "server-only";
import { redirect } from "next/navigation";
import { auth } from "./index";
import { db } from "@/lib/db";
import {
  canAccessBackoffice,
  canManageCatalogAndCustomers,
  canOrderForCompany,
  type CompanyRole,
} from "./policy";

/** Current user from the session, or null. */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

/**
 * Guards for pages and server actions. They redirect when access is denied,
 * so code after the call can rely on the check having passed.
 */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireBackoffice() {
  const user = await requireUser();
  if (!canAccessBackoffice(user.role)) redirect("/forbidden");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (!canManageCatalogAndCustomers(user.role)) redirect("/forbidden");
  return user;
}

/**
 * The user must belong to an approved company (optionally with specific roles).
 * Always checked against the database: approvals and roles can change at any time.
 */
export async function requireCompanyMember(companyId: string, roles?: CompanyRole[]) {
  const user = await requireUser();
  const membership = await db.companyMember.findUnique({
    where: { userId_companyId: { userId: user.id, companyId } },
    include: { company: true },
  });
  const allowed =
    membership &&
    canOrderForCompany(membership.company.status, membership.role) &&
    (!roles || roles.includes(membership.role));
  if (!membership || !allowed) redirect("/forbidden");
  return { user, company: membership.company, companyRole: membership.role };
}
