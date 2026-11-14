import type { Metadata } from "next";
import { company } from "@/config/company";
import { bg } from "@/i18n/bg";

const t = bg.contact;
export const metadata: Metadata = {
  title: t.title,
  description: `Свържете се с ${company.name}: телефон, имейл и адрес.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 space-y-6 px-4 py-10" data-testid="contact-page">
      <h1 className="text-3xl font-bold">{t.title}</h1>
      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
        <dt className="text-muted-foreground">{t.phone}</dt>
        <dd><a href={`tel:${company.phone.replace(/\s/g, "")}`} className="underline">{company.phone}</a></dd>
        <dt className="text-muted-foreground">{t.email}</dt>
        <dd><a href={`mailto:${company.email}`} className="underline">{company.email}</a></dd>
        <dt className="text-muted-foreground">{t.address}</dt>
        <dd>{company.address}</dd>
        <dt className="text-muted-foreground">{t.hours}</dt>
        <dd>{company.workingHours}</dd>
      </dl>
    </main>
  );
}
