import Link from "next/link";
import { requireAdmin } from "@/auth/guards";
import { Button } from "@/components/ui/button";
import { admin } from "@/i18n/admin.bg";
import { db } from "@/lib/db";

const t = admin.customers;
const statusLabel = { APPROVED: t.active, REJECTED: t.suspended, PENDING: t.pending } as const;

export default async function CustomersPage() {
  await requireAdmin();
  const companies = await db.company.findMany({
    orderBy: { createdAt: "desc" },
    include: { priceList: true, members: { where: { role: "OWNER" }, include: { user: true } } },
  });
  return (
    <main className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" data-testid="customers-title">{t.title}</h1>
        <Link href="/admin/customers/new"><Button data-testid="customer-add">{t.add}</Button></Link>
      </div>
      {companies.length === 0 ? (
        <p data-testid="customers-empty">{t.empty}</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm" data-testid="customers-table">
            <thead className="bg-muted text-left">
              <tr>
                <th className="p-3">{t.company}</th>
                <th className="p-3">{t.eik}</th>
                <th className="p-3">{t.contact}</th>
                <th className="p-3">{t.discount}</th>
                <th className="p-3">{t.status}</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((c) => (
                <tr key={c.id} className="border-t" data-testid="customer-row">
                  <td className="p-3 font-medium">
                    <Link href={`/admin/customers/${c.id}`} className="underline">{c.name}</Link>
                  </td>
                  <td className="p-3">{c.eik}</td>
                  <td className="p-3">{c.members[0]?.user.email ?? c.contactName}</td>
                  <td className="p-3">{c.priceList ? `${Number(c.priceList.discountPercent)}%` : "0%"}</td>
                  <td className="p-3">{statusLabel[c.status]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
