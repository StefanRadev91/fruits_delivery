"use server";

import { z } from "zod";
import { requireUser } from "@/auth/guards";
import { passwordSchema } from "@/domain/schemas";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";

export type PasswordState = { error?: string; done?: boolean };

const schema = z.object({ current: z.string().min(1), next: passwordSchema });

export async function changePasswordAction(_: PasswordState, formData: FormData): Promise<PasswordState> {
  const user = await requireUser();
  const parsed = schema.safeParse({ current: formData.get("current"), next: formData.get("next") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Невалидни данни" };

  const row = await db.user.findUnique({ where: { id: user.id }, select: { passwordHash: true } });
  if (!row?.passwordHash || !(await verifyPassword(parsed.data.current, row.passwordHash))) {
    return { error: "Текущата парола не е вярна" };
  }
  await db.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(parsed.data.next) } });
  return { done: true };
}
