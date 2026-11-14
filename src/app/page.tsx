import { Apple, Carrot, Citrus, Leaf, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { ProductCard } from "@/components/site/product-card";
import { Button } from "@/components/ui/button";
import { getMessages } from "@/i18n";
import { getPriceContext, listCategories, listProducts } from "@/lib/catalog";

const categoryIcons: Record<string, LucideIcon> = {
  plodove: Apple,
  "tsitrusi-i-ekzotichni": Citrus,
  zelenchutsi: Carrot,
  "zeleni-i-bilki": Leaf,
};

export default async function HomePage() {
  const t = getMessages().home;
  const [products, categories, ctx] = await Promise.all([listProducts(), listCategories(), getPriceContext()]);
  const featured = products.filter((p) => p.inSeason && p.stockStatus !== "OUT_OF_STOCK").slice(0, 8);

  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="bg-forest text-white">
        <div className="mx-auto max-w-6xl space-y-6 px-4 py-16 sm:py-24">
          <p className="inline-block rounded-full bg-lime px-3 py-1 text-xs font-bold uppercase tracking-wide text-forest-dark">
            {t.kicker}
          </p>
          <h1 className="max-w-3xl text-3xl font-extrabold leading-tight sm:text-5xl" data-testid="home-title">
            {t.title}
          </h1>
          <p className="max-w-2xl text-lg text-white/85">{t.subtitle}</p>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" variant="cta" nativeButton={false} render={<Link href="/catalog" />} data-testid="cta-catalog">
              {t.ctaCatalog}
            </Button>
            <Button size="lg" variant="onDark" nativeButton={false} render={<Link href="/login" />} data-testid="cta-login">
              {t.ctaClient}
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="border-b bg-mist">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-8 sm:grid-cols-2 lg:grid-cols-4">
          {t.benefits.map(([title, text]) => (
            <div key={title} className="space-y-1">
              <h2 className="text-base font-bold text-forest">{title}</h2>
              <p className="text-sm text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-6xl space-y-6 px-4 py-14">
        <h2 className="text-2xl font-extrabold sm:text-3xl">{t.categoriesTitle}</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {categories.map((c) => {
            const Icon = categoryIcons[c.slug] ?? Apple;
            return (
              <Link
                key={c.id}
                href={`/catalog?category=${c.slug}`}
                className="group flex flex-col items-center gap-3 rounded-xl bg-accent p-6 text-center transition hover:bg-lime/40"
                data-testid="home-category"
              >
                <Icon className="size-10 text-forest transition group-hover:scale-110" aria-hidden />
                <span className="font-heading font-bold text-forest-dark">{c.name}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* How we work */}
      <section className="bg-mist">
        <div className="mx-auto max-w-6xl space-y-8 px-4 py-14">
          <h2 className="text-2xl font-extrabold sm:text-3xl">{t.howTitle}</h2>
          <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {t.steps.map(([title, text], i) => (
              <li key={title} className="space-y-2">
                <span className="flex size-10 items-center justify-center rounded-full bg-orange font-heading text-lg font-extrabold text-white">
                  {i + 1}
                </span>
                <h3 className="font-bold">{title}</h3>
                <p className="text-sm text-muted-foreground">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Who we serve */}
      <section className="mx-auto max-w-6xl space-y-6 px-4 py-14">
        <h2 className="text-2xl font-extrabold sm:text-3xl">{t.segmentsTitle}</h2>
        <ul className="flex flex-wrap gap-3">
          {t.segments.map((s) => (
            <li key={s} className="rounded-full border-2 border-lime px-5 py-2 font-heading text-sm font-bold text-forest">
              {s}
            </li>
          ))}
        </ul>
      </section>

      {/* Featured products */}
      <section className="mx-auto max-w-6xl space-y-6 px-4 pb-14">
        <div className="flex items-baseline justify-between">
          <h2 className="text-2xl font-extrabold sm:text-3xl">{t.popular}</h2>
          <Link href="/catalog" className="text-sm font-semibold text-forest underline underline-offset-4">{t.allProducts}</Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} {...ctx} />
          ))}
        </div>
      </section>

      {/* Closing call to action */}
      <section className="bg-forest text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-4 px-4 py-12 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold">{t.ctaBandTitle}</h2>
            <p className="text-white/85">{t.ctaBandText}</p>
          </div>
          <Button size="lg" variant="cta" nativeButton={false} render={<Link href="/contact" />} data-testid="cta-contact">
            {t.ctaBandButton}
          </Button>
        </div>
      </section>
    </main>
  );
}
