import { getMessages } from "@/i18n";

const t = getMessages().auth;

export default function ForbiddenPage() {
  return (
    <main className="mx-auto max-w-md space-y-2 px-4 py-12" data-testid="forbidden">
      <h1 className="text-2xl font-bold">{t.forbiddenTitle}</h1>
      <p>{t.forbiddenText}</p>
    </main>
  );
}
