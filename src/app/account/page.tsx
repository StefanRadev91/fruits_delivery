import { logoutAction } from "@/app/(auth)/actions";
import { requireUser } from "@/auth/guards";
import { Button } from "@/components/ui/button";
import { getMessages } from "@/i18n";
import { PasswordForm } from "./password-form";

const t = getMessages().auth;

export default async function AccountPage() {
  const user = await requireUser();
  return (
    <main className="mx-auto max-w-2xl space-y-6 px-4 py-12">
      <h1 className="text-2xl font-bold">{t.account}</h1>
      <p data-testid="account-email">{user.email}</p>
      <PasswordForm />
      <form action={logoutAction}>
        <Button variant="outline" type="submit" data-testid="logout">{t.logout}</Button>
      </form>
    </main>
  );
}
