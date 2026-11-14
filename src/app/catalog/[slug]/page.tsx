import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductBadges, ProductImage, ProductPrice } from "@/components/site/product-card";
import { appConfig, siteUrl } from "@/config/app";
import { displayUnitPrice } from "@/domain/pricing";
import { bg } from "@/i18n/bg";
import { originLabel, stockLabel, unitLabel } from "@/i18n/labels";
import { getPriceContext, getProductBySlug, type ProductView } from "@/lib/catalog";

const t = bg.shop;
const qty = (n: number) => n.toLocaleString("bg-BG", { maximumFractionDigits: 3 });

export async function generateMetadata({ params }: PageProps<"/catalog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  const description =
    product.description ??
    `${product.name}${product.origin ? ` — ${originLabel[product.origin]}` : ""}. Пресни плодове и зеленчуци с доставка за бизнеса.`;
  return {
    title: product.name,
    description,
    alternates: { canonical: `/catalog/${product.slug}` },
    openGraph: { title: product.name, description, images: product.photos[0] ? [product.photos[0].url] : undefined },
  };
}

/** schema.org Product. Public structured data uses the public price (gross for households, net for businesses). */
function productJsonLd(product: ProductView) {
  const availability =
    product.stockStatus === "OUT_OF_STOCK" ? "https://schema.org/OutOfStock" : "https://schema.org/InStock";
  // Prices are private unless households can buy (B2C): then the public gross price is published.
  if (!appConfig.b2cEnabled) {
    return {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      description: product.description ?? undefined,
      category: product.category.name,
      image: product.photos.map((p) => new URL(p.url, siteUrl).toString()),
    };
  }
  const price = displayUnitPrice(product, "B2C");
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? undefined,
    category: product.category.name,
    image: product.photos.map((p) => new URL(p.url, siteUrl).toString()),
    offers: {
      "@type": "Offer",
      url: `${siteUrl}/catalog/${product.slug}`,
      priceCurrency: "EUR",
      price: (price.cents / 100).toFixed(2),
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: (price.cents / 100).toFixed(2),
        priceCurrency: "EUR",
        valueAddedTaxIncluded: price.includesVat,
      },
      availability,
    },
  };
}

export default async function ProductPage({ params }: PageProps<"/catalog/[slug]">) {
  const { slug } = await params;
  const [product, ctx] = await Promise.all([getProductBySlug(slug), getPriceContext()]);
  if (!product) notFound();

  const season =
    product.seasonStartMonth && product.seasonEndMonth
      ? `${t.months[product.seasonStartMonth - 1]} – ${t.months[product.seasonEndMonth - 1]}`
      : t.allYear;
  const unit = unitLabel[product.unit];
  const jsonLd = JSON.stringify(productJsonLd(product)).replace(/</g, "\\u003c");

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 space-y-6 px-4 py-10" data-testid="product-page">
      <Link href="/catalog" className="text-sm underline">{t.back}</Link>
      <div className="grid gap-8 sm:grid-cols-2">
        <ProductImage product={product} priority />
        <div className="space-y-4">
          <h1 className="text-3xl font-bold" data-testid="product-name">{product.name}</h1>
          <ProductBadges product={product} />
          <ProductPrice product={product} {...ctx} />
          {!ctx.showPrices && (
            <p className="text-sm text-muted-foreground" data-testid="product-client-hint">
              {t.clientPriceHint}{" "}
              <Link href="/login" className="font-medium text-forest underline underline-offset-2">{t.loginForPrices}</Link>
              <br />
              {t.askForAccess}{" "}
              <Link href="/contact" className="font-medium text-forest underline underline-offset-2">{t.contactUs}</Link>
            </p>
          )}
          {product.description && <p>{product.description}</p>}
          {product.variableWeight && <p className="text-sm text-muted-foreground">{t.variableWeight}</p>}
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
            {product.origin && (
              <>
                <dt className="text-muted-foreground">{t.origin}</dt><dd>{originLabel[product.origin]}</dd>
              </>
            )}
            <dt className="text-muted-foreground">{t.availability}</dt><dd>{stockLabel[product.stockStatus]}</dd>
            <dt className="text-muted-foreground">{t.season}</dt><dd>{season}</dd>
            <dt className="text-muted-foreground">{t.minOrder}</dt><dd>{qty(product.minQuantity)} {unit}</dd>
            <dt className="text-muted-foreground">{t.step}</dt><dd>{qty(product.stepQuantity)} {unit}</dd>
          </dl>
        </div>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} data-testid="product-jsonld" />
    </main>
  );
}
