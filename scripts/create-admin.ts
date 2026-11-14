/**
 * Creates (or resets) an administrator account.
 *   pnpm create-admin <email-or-username> ["Name"] [password]
 * Without a password, prints a random one once. Run it against the database in DATABASE_URL / DIRECT_URL.
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { loginIdentifierSchema } from "../src/domain/schemas";
import { hashPassword } from "../src/lib/password";
import { generateTempPassword } from "../src/lib/temp-password";

const [emailArg, nameArg, passwordArg] = process.argv.slice(2);
const email = loginIdentifierSchema.safeParse(emailArg);
if (!email.success) {
  console.error('Usage: pnpm create-admin <email-or-username> ["Name"] [password]');
  process.exit(1);
}

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL }),
});

async function main() {
  const password = passwordArg ?? generateTempPassword(16);
  const passwordHash = await hashPassword(password);
  const existing = await db.user.findUnique({ where: { email: email.data! } });
  await db.user.upsert({
    where: { email: email.data! },
    update: { role: "ADMIN", passwordHash },
    create: { email: email.data!, name: nameArg ?? "Администратор", role: "ADMIN", passwordHash, emailVerified: new Date() },
  });
  console.log(existing ? "Existing user promoted to ADMIN, password reset." : "Admin created.");
  console.log(`Email:    ${email.data}`);
  console.log(passwordArg ? "Password: (the one you provided)" : `Password: ${password}`);
}

main().finally(() => db.$disconnect());
