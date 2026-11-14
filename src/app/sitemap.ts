import type { MetadataRoute } from "next";
import { siteUrl } from "@/config/app";
import { db } from "@/lib/db";

// Needs the database, so build it per request instead of at build time.
export const dynamic = "force-dynamic";

const staticPaths = ["", "/business", "/catalog", "/zones", "/about", "/contact", "/terms", "/privacy"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await db.product.findMany({ where: { active: true }, select: { slug: true } });
  return [
    ...staticPaths.map((p) => ({ url: `${siteUrl}${p}` })),
    ...products.map((p) => ({ url: `${siteUrl}/catalog/${p.slug}` })),
  ];
}
