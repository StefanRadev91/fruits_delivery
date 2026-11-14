"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/auth/guards";
import { emailSchema, eikSchema, phoneSchema, vatNumberSchema } from "@/domain/schemas";
import { admin } from "@/i18n/admin.bg";
import { bg } from "@/i18n/bg";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { generateTempPassword } from "@/lib/temp-password";

const f = admin.form;
const required = z.string().trim().min(1, bg.validation.required).max(200);

export type CustomerState = {
  error?: string;
  saved?: boolean;
  fieldErrors?: Record<string, string>;
  created?: { companyId: string; email: string; password: string };
  newPassword?: string;
};

const discountSchema = z
  .string()
  .trim()
  .transform((s) => s.replace(",", "."))
  .pipe(z.string().regex(/^\d{1,3}(\.\d{1,2})?$/, f.discountInvalid))
  .transform(Number)
  .refine((n) => n >= 0 && n <= 100, f.discountInvalid);

const termsSchema = z
  .string()
  .optional()
  .transform((s) => (s ? Number(s) : null))
  .refine((n) => n === null || [7, 14, 30].includes(n));

const optionalVat = z.union([z.literal("").transform(() => undefined), vatNumberSchema]);

const createSchema = z.object({
  companyName: required,
  eik: eikSchema,
  vatNumber: optionalVat,
  mol: required,
  contactName: required,
  contactPhone: phoneSchema,
  email: emailSchema,
  discount: discountSchema,
  terms: termsSchema,
});

const updateSchema = z.object({ discount: discountSchema, terms: termsSchema });

function fieldErrors(error: z.ZodError): CustomerState {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) fields[String(issue.path[0])] ??= issue.message;
  return { fieldErrors: fields };
}

/** Creates a company account: own price list (the discount), company, owner user with a temporary password. */
export async function createCustomerAction(_: CustomerState, formData: FormData): Promise<CustomerState> {
  await requireAdmin();
  const parsed = createSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fieldErrors(parsed.error);
  const d = parsed.data;

  if (await db.user.findUnique({ where: { email: d.email } })) return { fieldErrors: { email: f.emailTaken } };
  if (await db.company.findUnique({ where: { eik: d.eik } })) return { fieldErrors: { eik: f.eikTaken } };

  const password = generateTempPassword();
  const passwordHash = await hashPassword(password);
  const company = await db.$transaction(async (tx) => {
    const priceList = await tx.priceList.create({
      data: { name: `${d.companyName} (${d.discount}%)`, discountPercent: d.discount },
    });
    const user = await tx.user.create({
      data: { email: d.email, name: d.contactName, phone: d.contactPhone, passwordHash, emailVerified: new Date() },
    });
    return tx.company.create({
      data: {
        name: d.companyName, eik: d.eik, vatNumber: d.vatNumber ?? null, mol: d.mol,
        contactName: d.contactName, contactPhone: d.contactPhone,
        status: "APPROVED", paymentTermsDays: d.terms, priceListId: priceList.id,
        members: { create: { userId: user.id, role: "OWNER" } },
      },
    });
  });
  revalidatePath("/admin/customers");
  return { created: { companyId: company.id, email: d.email, password } };
}

export async function updateCustomerAction(companyId: string, _: CustomerState, formData: FormData): Promise<CustomerState> {
  await requireAdmin();
  const parsed = updateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fieldErrors(parsed.error);
  const company = await db.company.findUnique({ where: { id: companyId }, select: { priceListId: true } });
  if (!company) return { error: "Не е намерена фирма" };

  await db.$transaction(async (tx) => {
    await tx.company.update({ where: { id: companyId }, data: { paymentTermsDays: parsed.data.terms } });
    if (company.priceListId) {
      await tx.priceList.update({ where: { id: company.priceListId }, data: { discountPercent: parsed.data.discount } });
    } else {
      const pl = await tx.priceList.create({ data: { name: "Отстъпка", discountPercent: parsed.data.discount } });
      await tx.company.update({ where: { id: companyId }, data: { priceListId: pl.id } });
    }
  });
  revalidatePath("/admin/customers");
  revalidatePath(`/admin/customers/${companyId}`);
  return { saved: true };
}

export async function setCustomerAccessAction(companyId: string, active: boolean) {
  await requireAdmin();
  await db.company.update({ where: { id: companyId }, data: { status: active ? "APPROVED" : "REJECTED" } });
  revalidatePath("/admin/customers");
  revalidatePath(`/admin/customers/${companyId}`);
}

/** New temporary password for the company's owner. */
export async function resetPasswordAction(companyId: string): Promise<CustomerState> {
  await requireAdmin();
  const owner = await db.companyMember.findFirst({ where: { companyId, role: "OWNER" }, select: { userId: true } });
  if (!owner) return { error: "Фирмата няма основен потребител" };
  const password = generateTempPassword();
  await db.user.update({ where: { id: owner.userId }, data: { passwordHash: await hashPassword(password) } });
  return { newPassword: password };
}
