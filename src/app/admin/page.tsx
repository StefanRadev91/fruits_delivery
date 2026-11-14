import Link from "next/link";
import { requireBackoffice } from "@/auth/guards";
import { canManageCatalogAndCustomers } from "@/auth/policy";
import { admin } from "@/i18n/admin.bg";
import { getMessages } from "@/i18n";
import { db } from "@/lib/db";

const t = getMessages().auth;

export default async function AdminPage() {
  const user = await requireBackoffice();
  const [customers, products] = await Promise.all([
    db.company.count({ where: { status: "APPROVED" } }),
    db.product.count({ where: { active: true } }),
  ]);
  const card = "rounded-xl border bg-card p-5";
  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" data-testid="admin-title">{t.adminPanel}</h1>
        <p className="text-sm text-muted-foreground">{user.email} ({user.role})</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className={card}>
          <p className="text-3xl font-bold" data-testid="stat-customers">{customers}</p>
          <p className="text-sm text-muted-foreground">Активни клиенти</p>
          {canManageCatalogAndCustomers(user.role) && (
            <Link href="/admin/customers" className="mt-3 inline-block text-sm font-medium text-forest underline">
              {admin.customers.title}
            </Link>
          )}
        </div>
        <div className={card}>
          <p className="text-3xl font-bold" data-testid="stat-products">{products}</p>
          <p className="text-sm text-muted-foreground">Артикула в каталога</p>
          <Link href="/catalog" className="mt-3 inline-block text-sm font-medium text-forest underline">Каталог</Link>
        </div>
      </div>
    </main>
  );
}
