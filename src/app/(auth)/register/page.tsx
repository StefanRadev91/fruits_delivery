import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { appConfig } from "@/config/app";
import { getMessages } from "@/i18n";
import { RegisterForm } from "../forms";

const t = getMessages().auth;
export const metadata: Metadata = { title: t.register };

export default function RegisterPage() {
  if (!appConfig.b2cEnabled) notFound(); // households cannot sign up while B2C is off
  return (
    <main className="mx-auto w-full max-w-sm space-y-8 px-4 py-12">
      <h1 className="text-2xl font-bold">{t.register}</h1>
      <RegisterForm />
      <p className="text-sm">
        {t.haveAccount}{" "}
        <Link href="/login" className="underline">{t.login}</Link>
      </p>
    </main>
  );
}
