import type { Metadata } from "next";
import { Montserrat, Open_Sans } from "next/font/google";
import { CookieBanner } from "@/components/site/cookie-banner";
import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { siteUrl } from "@/config/app";
import { getMessages } from "@/i18n";
import "./globals.css";

const t = getMessages();

// Cyrillic subset is required for Bulgarian text.
const openSans = Open_Sans({ variable: "--font-open-sans", subsets: ["latin", "cyrillic"] });
const montserrat = Montserrat({ variable: "--font-montserrat", subsets: ["latin", "cyrillic"], weight: ["600", "700", "800"] });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: t.site.name, template: `%s | ${t.site.name}` },
  description: t.site.description,
  openGraph: { siteName: t.site.name, locale: "bg_BG", type: "website" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="bg" className={`${openSans.variable} ${montserrat.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <SiteHeader />
        <div className="flex flex-1 flex-col">{children}</div>
        <SiteFooter />
        <CookieBanner />
      </body>
    </html>
  );
}
