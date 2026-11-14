import { z } from "zod";
import { bg } from "@/i18n/bg";
import { isValidEik } from "./eik";

const v = bg.validation;

export const emailSchema = z.string().trim().toLowerCase().pipe(z.email(v.email));
/** Staff can sign in with a plain username (e.g. "admin"); it is stored as username@USERNAME_DOMAIN. */
export const USERNAME_DOMAIN = "lsfreshfruits.local";
export const loginIdentifierSchema = z
  .string()
  .trim()
  .toLowerCase()
  .transform((s) => (s.includes("@") ? s : `${s}@${USERNAME_DOMAIN}`))
  .pipe(z.email(v.email));
export const passwordSchema = z.string().min(8, v.password);
export const eikSchema = z.string().trim().refine(isValidEik, v.eik);
export const postcodeSchema = z.string().trim().regex(/^\d{4}$/, v.postcode);
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[0-9 ()-]{7,20}$/, v.phone);
const requiredText = z.string().trim().min(1, v.required).max(200);

/** "BG" + the ЕИК (9 or 13 digits). Optional: not every company is VAT registered. */
export const vatNumberSchema = z
  .string()
  .trim()
  .toUpperCase()
  .refine((s) => /^BG(\d{9}|\d{10}|\d{13})$/.test(s), v.vatNumber);

export const addressSchema = z.object({
  label: requiredText,
  city: requiredText,
  postcode: postcodeSchema,
  street: requiredText,
  notes: z.string().trim().max(500).optional(),
});

/** B2B registration application. */
export const businessApplicationSchema = z.object({
  companyName: requiredText,
  eik: eikSchema,
  vatNumber: vatNumberSchema.optional(),
  mol: requiredText,
  contactName: requiredText,
  contactPhone: phoneSchema,
  email: emailSchema,
  password: passwordSchema,
  addresses: z.array(addressSchema).min(1, v.required),
});

export const cartItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().positive(v.quantity),
});

export const standingOrderInputSchema = z.object({
  weekdays: z.array(z.number().int().min(0).max(6)).min(1, v.weekdays),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .optional(),
  items: z.array(cartItemSchema).min(1),
});

export type BusinessApplicationInput = z.infer<typeof businessApplicationSchema>;
export type StandingOrderInput = z.infer<typeof standingOrderInputSchema>;

/** Household (B2C) registration. */
export const registerSchema = z.object({
  name: requiredText,
  email: emailSchema,
  phone: phoneSchema.optional().or(z.literal("").transform(() => undefined)),
  password: passwordSchema,
});

export type RegisterInput = z.infer<typeof registerSchema>;
