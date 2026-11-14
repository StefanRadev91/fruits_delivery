import type { Metadata } from "next";
import { InfoPage } from "@/components/site/info-page";
import { terms } from "@/i18n/pages.bg";

export const metadata: Metadata = { title: terms.title, description: terms.description, alternates: { canonical: "/terms" } };
export default function TermsPage() {
  return <InfoPage content={terms} testId="terms-page" />;
}
