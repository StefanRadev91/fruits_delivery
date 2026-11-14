import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Nodemailer from "next-auth/providers/nodemailer";
import { loginIdentifierSchema } from "@/domain/schemas";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { verifyPassword } from "@/lib/password";
import { getMessages } from "@/i18n";
import { authConfig } from "./config";
import { z } from "zod";

const t = getMessages().auth;
const credentialsSchema = z.object({ email: loginIdentifierSchema, password: z.string().min(1) });

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  providers: [
    Credentials({
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const user = await db.user.findUnique({ where: { email: parsed.data.email } });
        if (!user?.passwordHash) return null;
        if (!(await verifyPassword(parsed.data.password, user.passwordHash))) return null;
        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
    // Magic link. Transport is configured in lib/email.ts; we only override the message.
    Nodemailer({
      server: "smtp://localhost:1025", // unused: sendVerificationRequest below sends the mail
      from: process.env.EMAIL_FROM,
      async sendVerificationRequest({ identifier, url }) {
        await sendEmail(
          identifier,
          t.mailSubject,
          `${t.mailBody}\n\n${url}`,
          `<p>${t.mailBody}</p><p><a href="${url}">${t.login}</a></p>`,
        );
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    // Magic-link users come from the adapter, so load the role from the database.
    async jwt({ token, user }) {
      if (user) {
        const dbUser = await db.user.findUnique({
          where: { id: user.id! },
          select: { role: true },
        });
        token.id = user.id;
        token.role = dbUser?.role ?? "CUSTOMER";
      }
      return token;
    },
  },
});
