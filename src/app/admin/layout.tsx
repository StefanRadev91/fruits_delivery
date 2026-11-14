import Link from "next/link";
import { requireBackoffice } from "@/auth/guards";
import { admin } from "@/i18n/admin.bg";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  await requireBackoffice();
  const link = "rounded-md px-3 py-1.5 text-sm font-medium hover:bg-muted";
  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <nav className="mb-6 flex gap-2 border-b pb-3" aria-label={admin.title}>
        <Link href="/admin" className={link} data-testid="admin-nav-home">{admin.nav.home}</Link>
        <Link href="/admin/customers" className={link} data-testid="admin-nav-customers">{admin.nav.customers}</Link>
      </nav>
      {children}
    </div>
  );
}
