"use server";

import { AuthError } from "next-auth";
import { z } from "zod";
import { signIn, signOut } from "@/auth";
import { appConfig } from "@/config/app";
import { emailSchema, registerSchema } from "@/domain/schemas";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { getMessages } from "@/i18n";

const t = getMessages().auth;

export type FormState = { error?: string; sent?: boolean; fieldErrors?: Record<string, string> };

/** Only allow redirects to paths inside this site. */
function safeRedirect(value: FormDataEntryValue | null): string {
  const url = typeof value === "string" ? value : "";
  return url.startsWith("/") && !url.startsWith("//") ? url : "/account";
}

function fieldErrors(error: z.ZodError): FormState {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) fields[String(issue.path[0])] ??= issue.message;
  return { fieldErrors: fields };
}

export async function loginAction(_: FormState, formData: FormData): Promise<FormState> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: safeRedirect(formData.get("callbackUrl")),
    });
  } catch (error) {
    if (error instanceof AuthError) return { error: t.invalidCredentials };
    throw error; // the redirect after a successful login is thrown too
  }
  return {};
}

export async function magicLinkAction(_: FormState, formData: FormData): Promise<FormState> {
  const email = emailSchema.safeParse(formData.get("email"));
  if (!email.success) return fieldErrors(email.error);
  await signIn("nodemailer", { email: email.data, redirect: false });
  return { sent: true };
}

export async function registerAction(_: FormState, formData: FormData): Promise<FormState> {
  if (!appConfig.b2cEnabled) return { error: t.registrationClosed };
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fieldErrors(parsed.error);
  const { email, name, phone, password } = parsed.data;

  if (await db.user.findUnique({ where: { email } })) return { error: t.emailTaken };
  await db.user.create({
    data: { email, name, phone, passwordHash: await hashPassword(password) },
  });
  await signIn("credentials", { email, password, redirectTo: "/account" });
  return {};
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}

