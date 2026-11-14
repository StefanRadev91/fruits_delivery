import type { InfoPageContent } from "@/i18n/pages.bg";

export function InfoPage({ content, testId }: { content: InfoPageContent; testId: string }) {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 space-y-6 px-4 py-10" data-testid={testId}>
      <h1 className="text-3xl font-bold">{content.title}</h1>
      {content.sections.map((s) => (
        <section key={s.heading} className="space-y-2">
          <h2 className="text-xl font-semibold">{s.heading}</h2>
          {s.paragraphs.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </section>
      ))}
    </main>
  );
}
