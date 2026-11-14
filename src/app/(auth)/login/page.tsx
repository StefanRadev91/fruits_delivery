import type { Metadata } from "next";
import Link from "next/link";
import { appConfig } from "@/config/app";
import { getMessages } from "@/i18n";
import { LoginForm, MagicLinkForm } from "../forms";

const t = getMessages().auth;
export const metadata: Metadata = { title: t.login };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { callbackUrl } = await searchParams;
  return (
    <main className="mx-auto w-full max-w-sm space-y-8 px-4 py-12">
      <h1 className="text-2xl font-bold">{t.login}</h1>
      <LoginForm callbackUrl={typeof callbackUrl === "string" ? callbackUrl : undefined} />
      <section className="space-y-3 border-t pt-6">
        <h2 className="font-semibold">{t.magicLinkTitle}</h2>
        <MagicLinkForm />
      </section>
      {appConfig.b2cEnabled ? (
        <p className="text-sm">
          {t.noAccount}{" "}
          <Link href="/register" className="underline" data-testid="to-register">{t.register}</Link>
        </p>
      ) : (
        <p className="text-sm">
          {t.becomeClient}{" "}
          <Link href="/contact" className="underline" data-testid="to-contact">{t.contactUs}</Link>
        </p>
      )}
    </main>
  );
}
