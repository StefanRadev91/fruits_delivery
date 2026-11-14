import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { bg } from "@/i18n/bg";

const t = bg.business;
export const metadata: Metadata = {
  title: t.title,
  description: t.intro,
  alternates: { canonical: "/business" },
};

export default function BusinessPage() {
  return (
    <main className="mx-auto w-full max-w-4xl flex-1 space-y-10 px-4 py-10" data-testid="business-page">
      <section className="space-y-3">
        <h1 className="text-3xl font-bold">{t.title}</h1>
        <p className="text-lg text-muted-foreground">{t.intro}</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">{t.benefitsTitle}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {t.benefits.map(([title, text]) => (
            <div key={title} className="rounded-lg border p-4">
              <h3 className="font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">{t.deliveryTitle}</h2>
        <p>{t.deliveryText}</p>
        <Link href="/zones" className="underline">{t.zonesCta}</Link>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">{t.stepsTitle}</h2>
        <ol className="list-decimal space-y-1 pl-5">
          {t.steps.map((s) => <li key={s}>{s}</li>)}
        </ol>
        <div className="flex flex-wrap gap-3 pt-2">
          <Button nativeButton={false} render={<Link href="/contact" />} data-testid="business-contact">{t.contactCta}</Button>
          <Button nativeButton={false} variant="outline" render={<Link href="/login" />}>{t.loginCta}</Button>
        </div>
      </section>
    </main>
  );
}
