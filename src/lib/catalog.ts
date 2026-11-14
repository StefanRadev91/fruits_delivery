import { getCurrentUser } from "@/auth/guards";
import { canAccessBackoffice } from "@/auth/policy";
import { appConfig } from "@/config/app";
import type { PriceList } from "@/domain/pricing";
import { sofiaNow } from "@/domain/delivery";
import { isInSeason } from "@/domain/season";
import type { Audience } from "@/domain/types";
import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

const include = { category: true, photos: { orderBy: { sortOrder: "asc" } } } satisfies Prisma.ProductInclude;
type ProductRow = Prisma.ProductGetPayload<{ include: typeof include }>;

/** Product with plain numbers (Prisma Decimals converted) ready for the UI. */
export type ProductView = Omit<ProductRow, "minQuantity" | "stepQuantity"> & {
  minQuantity: number;
  stepQuantity: number;
  inSeason: boolean;
};

function toView(p: ProductRow): ProductView {
  const month = Number(sofiaNow(new Date()).date.slice(5, 7));
  return {
    ...p,
    minQuantity: Number(p.minQuantity),
    stepQuantity: Number(p.stepQuantity),
    inSeason: isInSeason(month, p.seasonStartMonth, p.seasonEndMonth),
  };
}

export async function listCategories() {
  return db.category.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function listProducts(opts: { q?: string; categorySlug?: string } = {}) {
  const rows = await db.product.findMany({
    where: {
      active: true,
      ...(opts.q ? { name: { contains: opts.q, mode: "insensitive" } } : {}),
      ...(opts.categorySlug ? { category: { slug: opts.categorySlug } } : {}),
    },
    include,
    orderBy: [{ category: { sortOrder: "asc" } }, { name: "asc" }],
  });
  return rows.map(toView);
}

export async function getProductBySlug(slug: string) {
  const row = await db.product.findFirst({ where: { slug, active: true }, include });
  return row ? toView(row) : null;
}

/**
 * Who is looking at prices. Prices are private: only an approved company member
 * (with their company price list) and back-office staff (base price) see them.
 * Everyone else sees the catalog without any prices. Households (B2C, when enabled)
 * see the public gross price.
 */
export type PriceContext = {
  audience: Audience;
  priceList: PriceList | null;
  /** Approved company member (sees their own prices). */
  isClient: boolean;
  /** Whether prices are shown at all. */
  showPrices: boolean;
};

export async function getPriceContext(): Promise<PriceContext> {
  const user = await getCurrentUser();
  if (user) {
    const membership = await db.companyMember.findFirst({
      where: { userId: user.id, company: { status: "APPROVED" } },
      include: { company: { include: { priceList: { include: { items: true } } } } },
    });
    if (membership) {
      const list = membership.company.priceList;
      return {
        audience: "B2B",
        isClient: true,
        showPrices: true,
        priceList: list && {
          discountPercent: Number(list.discountPercent),
          overrides: Object.fromEntries(list.items.map((i) => [i.productId, i.priceCents])),
        },
      };
    }
  }
  const staff = !!user && canAccessBackoffice(user.role);
  return {
    audience: appConfig.b2cEnabled ? "B2C" : "B2B",
    priceList: null,
    isClient: false,
    showPrices: staff || appConfig.b2cEnabled,
  };
}
