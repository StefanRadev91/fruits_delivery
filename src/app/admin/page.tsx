import { logoutAction } from "@/app/(auth)/actions";
import { requireBackoffice } from "@/auth/guards";
import { Button } from "@/components/ui/button";
import { getMessages } from "@/i18n";

const t = getMessages().auth;

export default async function AdminPage() {
  const user = await requireBackoffice();
  return (
    <main className="mx-auto max-w-4xl space-y-4 px-4 py-12">
      <h1 className="text-2xl font-bold" data-testid="admin-title">{t.adminPanel}</h1>
      <p>{user.email} ({user.role})</p>
      <form action={logoutAction}>
        <Button variant="outline" type="submit" data-testid="logout">{t.logout}</Button>
      </form>
    </main>
  );
}
