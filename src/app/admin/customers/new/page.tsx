import Link from "next/link";
import { requireAdmin } from "@/auth/guards";
import { admin } from "@/i18n/admin.bg";
import { NewCustomerForm } from "../forms";

export default async function NewCustomerPage() {
  await requireAdmin();
  return (
    <main className="space-y-6">
      <Link href="/admin/customers" className="text-sm underline">{admin.detail.back}</Link>
      <h1 className="text-2xl font-bold">{admin.form.newTitle}</h1>
      <p className="max-w-2xl text-sm text-muted-foreground">{admin.form.intro}</p>
      <NewCustomerForm />
    </main>
  );
}
