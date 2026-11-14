import { Phone } from "lucide-react";
import Link from "next/link";
import { logoutAction } from "@/app/(auth)/actions";
import { getCurrentUser } from "@/auth/guards";
import { canAccessBackoffice } from "@/auth/policy";
import { Logo } from "@/components/site/logo";
import { appConfig } from "@/config/app";
import { company } from "@/config/company";
import { bg } from "@/i18n/bg";

const t = bg;

export async function SiteHeader() {
  const user = await getCurrentUser();
  const link = "text-sm font-medium text-ink hover:text-forest";
  const tel = company.phone.replace(/\s/g, "");
  return (
    <header className="sticky top-0 z-40 bg-background shadow-sm" data-testid="site-header">
      {/* Top bar: contact details (desktop) */}
      <div className="hidden bg-forest text-xs text-white md:block">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-1.5">
          <span>{company.workingHours}</span>
          <span className="flex gap-4">
            <a href={`mailto:${company.email}`} className="hover:underline">{company.email}</a>
            <a href={`tel:${tel}`} className="hover:underline">{company.phone}</a>
          </span>
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <Link href="/" data-testid="nav-logo"><Logo /></Link>
        <nav className="order-last flex w-full flex-wrap gap-x-5 gap-y-1 md:order-none md:w-auto">
          <Link href="/catalog" className={link} data-testid="nav-catalog">{t.nav.catalog}</Link>
          <Link href="/business" className={link} data-testid="nav-business">{t.nav.business}</Link>
          <Link href="/zones" className={link} data-testid="nav-zones">{t.nav.zones}</Link>
          <Link href="/about" className={link} data-testid="nav-about">{t.nav.about}</Link>
          <Link href="/contact" className={link} data-testid="nav-contact">{t.nav.contact}</Link>
        </nav>
        <div className="ml-auto flex items-center gap-4">
          {user ? (
            <>
              {canAccessBackoffice(user.role) && (
                <Link href="/admin" className={link} data-testid="nav-admin">{t.auth.adminPanel}</Link>
              )}
              <Link href="/account" className={link} data-testid="nav-account">{t.auth.account}</Link>
              <form action={logoutAction}>
                <button type="submit" className={link} data-testid="nav-logout">{t.auth.logout}</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className={link} data-testid="nav-login">{t.nav.clientLogin}</Link>
              {appConfig.b2cEnabled && (
                <Link href="/register" className={link} data-testid="nav-register">{t.auth.register}</Link>
              )}
            </>
          )}
          <a
            href={`tel:${tel}`}
            className="hidden items-center gap-2 rounded-full bg-orange px-4 py-2 text-sm font-semibold text-white hover:bg-orange-dark sm:inline-flex"
            data-testid="nav-call"
          >
            <Phone className="size-4" aria-hidden />
            {t.nav.callUs}
          </a>
        </div>
      </div>
    </header>
  );
}
