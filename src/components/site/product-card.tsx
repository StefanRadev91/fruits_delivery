import { Apple } from "lucide-react";
import Link from "next/link";
import { displayUnitPrice } from "@/domain/pricing";
import { formatMoney } from "@/domain/money";
import { bg } from "@/i18n/bg";
import { originLabel, stockLabel, unitLabel } from "@/i18n/labels";
import type { PriceContext, ProductView } from "@/lib/catalog";

const t = bg.shop;

export function ProductPrice({
  product, audience, priceList,
}: { product: ProductView } & PriceContext) {
  const price = displayUnitPrice(product, audience, priceList);
  return (
    <p data-testid="product-price">
      <span className="text-lg font-semibold">{formatMoney(price.cents)}</span>{" "}
      <span className="text-sm text-muted-foreground">
        / {unitLabel[product.unit]} · {price.includesVat ? t.priceWithVat : t.priceWithoutVat}
      </span>
    </p>
  );
}

/** Placeholder until product photos are uploaded. */
export function ProductImage({ product }: { product: ProductView }) {
  const photo = product.photos[0];
  return photo ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={photo.url} alt={product.name} className="aspect-square w-full rounded-md object-cover" />
  ) : (
    <div className="flex aspect-square w-full items-center justify-center rounded-md bg-muted text-muted-foreground">
      <Apple className="size-12" aria-hidden />
    </div>
  );
}

export function ProductBadges({ product }: { product: ProductView }) {
  return (
    <div className="flex flex-wrap gap-1 text-xs">
      {product.origin && (
        <span className="rounded-full bg-accent px-2 py-0.5 text-accent-foreground">{originLabel[product.origin]}</span>
      )}
      {!product.inSeason && <span className="rounded bg-amber-100 px-2 py-0.5 text-amber-900">{t.outOfSeason}</span>}
      {product.stockStatus !== "IN_STOCK" && (
        <span className="rounded bg-red-100 px-2 py-0.5 text-red-900">{stockLabel[product.stockStatus]}</span>
      )}
    </div>
  );
}

export function ProductCard(props: { product: ProductView } & PriceContext) {
  const { product } = props;
  return (
    <Link
      href={`/catalog/${product.slug}`}
      className="flex flex-col gap-2 rounded-xl border bg-card p-3 transition hover:-translate-y-0.5 hover:shadow-md"
      data-testid="product-card"
    >
      <ProductImage product={product} />
      <h3 className="font-semibold">{product.name}</h3>
      <ProductBadges product={product} />
      <ProductPrice {...props} />
    </Link>
  );
}
