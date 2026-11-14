import type { Metadata } from "next";
import { InfoPage } from "@/components/site/info-page";
import { about } from "@/i18n/pages.bg";

export const metadata: Metadata = { title: about.title, description: about.description, alternates: { canonical: "/about" } };
export default function AboutPage() {
  return <InfoPage content={about} testId="about-page" />;
}
