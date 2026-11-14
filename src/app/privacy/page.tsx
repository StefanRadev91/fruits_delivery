import type { Metadata } from "next";
import { InfoPage } from "@/components/site/info-page";
import { privacy } from "@/i18n/pages.bg";

export const metadata: Metadata = { title: privacy.title, description: privacy.description, alternates: { canonical: "/privacy" } };
export default function PrivacyPage() {
  return <InfoPage content={privacy} testId="privacy-page" />;
}
