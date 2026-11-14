import Link from "next/link";
import { Logo } from "@/components/site/logo";
import { company } from "@/config/company";
import { bg } from "@/i18n/bg";

export function SiteFooter() {
  const link = "hover:underline";
  return (
    <footer className="bg-forest-dark text-sm text-white/80" data-testid="site-footer">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div className="space-y-3">
          <Logo onDark />
          <p>{bg.site.description}</p>
        </div>
        <nav className="flex flex-col gap-2" aria-label="Информация">
          <h2 className="font-heading font-semibold text-white">Информация</h2>
          <Link href="/about" className={link}>{bg.nav.about}</Link>
          <Link href="/catalog" className={link}>{bg.nav.catalog}</Link>
          <Link href="/zones" className={link}>{bg.nav.zones}</Link>
          <Link href="/terms" className={link}>{bg.nav.terms}</Link>
          <Link href="/privacy" className={link}>{bg.nav.privacy}</Link>
        </nav>
        <address className="flex flex-col gap-2 not-italic">
          <h2 className="font-heading font-semibold text-white">{bg.nav.contact}</h2>
          <span>{company.address}</span>
          <a href={`tel:${company.phone.replace(/\s/g, "")}`} className={link}>{company.phone}</a>
          <a href={`mailto:${company.email}`} className={link}>{company.email}</a>
          <span>{company.workingHours}</span>
        </address>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs">
        © {new Date().getFullYear()} {company.name}. {bg.footer.rights}
      </div>
    </footer>
  );
}
