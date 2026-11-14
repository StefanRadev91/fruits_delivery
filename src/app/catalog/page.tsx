import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/site/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { bg } from "@/i18n/bg";
import { getPriceContext, listCategories, listProducts } from "@/lib/catalog";
import { cn } from "@/lib/utils";

const t = bg.shop;
export const metadata: Metadata = {
  title: t.title,
  description: "Пресни плодове и зеленчуци с доставка до дома. Разгледайте асортимента ни.",
  alternates: { canonical: "/catalog" },
};

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function CatalogPage({ searchParams }: PageProps<"/catalog">) {
  const params = await searchParams;
  const q = first(params.q)?.trim() || undefined;
  const categorySlug = first(params.category) || undefined;

  const [categories, products, ctx] = await Promise.all([
    listCategories(),
    listProducts({ q, categorySlug }),
    getPriceContext(),
  ]);

  const href = (category?: string) => {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (category) sp.set("category", category);
    const s = sp.toString();
    return s ? `/catalog?${s}` : "/catalog";
  };
  const chip = (active: boolean) =>
    cn("rounded-full border px-4 py-1.5 text-sm font-medium hover:bg-accent", active && "border-primary bg-primary text-primary-foreground hover:bg-primary");

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-4 py-10">
      <h1 className="text-3xl font-extrabold">{t.title}</h1>

      <form action="/catalog" className="flex max-w-md gap-2" role="search">
        {categorySlug && <input type="hidden" name="category" value={categorySlug} />}
        <Input name="q" defaultValue={q} placeholder={t.searchPlaceholder} data-testid="catalog-search" />
        <Button type="submit" data-testid="catalog-search-submit">{t.search}</Button>
      </form>

      <nav className="flex flex-wrap gap-2" aria-label="Категории">
        <Link href={href()} className={chip(!categorySlug)} data-testid="category-all">{t.allCategories}</Link>
        {categories.map((c) => (
          <Link key={c.id} href={href(c.slug)} className={chip(categorySlug === c.slug)} data-testid={`category-${c.slug}`}>
            {c.name}
          </Link>
        ))}
      </nav>

      {products.length === 0 ? (
        <p data-testid="catalog-empty">{t.noResults}</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4" data-testid="product-grid">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} {...ctx} />
          ))}
        </div>
      )}
    </main>
  );
}
