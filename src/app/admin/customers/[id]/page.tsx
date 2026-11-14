import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/auth/guards";
import { Button } from "@/components/ui/button";
import { admin } from "@/i18n/admin.bg";
import { db } from "@/lib/db";
import { setCustomerAccessAction } from "../actions";
import { EditCustomerForm, ResetPasswordForm } from "../forms";

const t = admin.detail;

export default async function CustomerPage({ params }: PageProps<"/admin/customers/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const company = await db.company.findUnique({
    where: { id },
    include: { priceList: true, members: { where: { role: "OWNER" }, include: { user: true } } },
  });
  if (!company) notFound();
  const active = company.status === "APPROVED";
  const owner = company.members[0]?.user;
  const discount = String(Number(company.priceList?.discountPercent ?? 0));

  return (
    <main className="space-y-8">
      <Link href="/admin/customers" className="text-sm underline">{t.back}</Link>
      <div>
        <h1 className="text-2xl font-bold" data-testid="customer-title">{company.name}</h1>
        <p className="text-sm text-muted-foreground">
          ЕИК {company.eik} · {company.contactName} · {company.contactPhone}
        </p>
        {owner && <p className="text-sm">{t.owner}: <span className="font-mono">{owner.email}</span></p>}
      </div>

      {!active && <p className="rounded-lg bg-amber-100 px-4 py-3 text-sm text-amber-900">{t.suspendedNote}</p>}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{t.settings}</h2>
        <EditCustomerForm
          companyId={company.id}
          discount={discount}
          terms={company.paymentTermsDays ? String(company.paymentTermsDays) : ""}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{t.resetTitle}</h2>
        <p className="text-sm text-muted-foreground">{t.resetText}</p>
        <ResetPasswordForm companyId={company.id} />
      </section>

      <section>
        <form action={setCustomerAccessAction.bind(null, company.id, !active)}>
          <Button type="submit" variant={active ? "destructive" : "default"} data-testid="customer-access">
            {active ? t.suspend : t.restore}
          </Button>
        </form>
      </section>
    </main>
  );
}
