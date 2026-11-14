import { Apple } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { displayUnitPrice } from "@/domain/pricing";
import { formatMoney } from "@/domain/money";
import { bg } from "@/i18n/bg";
import { originLabel, stockLabel, unitLabel } from "@/i18n/labels";
import type { PriceContext, ProductView } from "@/lib/catalog";

const t = bg.shop;

export function ProductPrice({
  product, audience, priceList, showPrices,
}: { product: ProductView } & PriceContext) {
  if (!showPrices) return null;
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

/** Product photo (optimized, lazy by default); a placeholder icon when there is none. */
export function ProductImage({ product, priority = false }: { product: ProductView; priority?: boolean }) {
  const photo = product.photos[0];
  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-md bg-muted">
      {photo ? (
        <Image
          src={photo.url}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 280px, (min-width: 768px) 30vw, (min-width: 640px) 45vw, 50vw"
          priority={priority}
          className="object-cover"
        />
      ) : (
        <div className="flex size-full items-center justify-center text-muted-foreground">
          <Apple className="size-12" aria-hidden />
        </div>
      )}
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
