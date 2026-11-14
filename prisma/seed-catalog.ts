/**
 * Safe catalog loader: adds/updates categories and products from prisma/data/price-list.ts.
 * Never deletes anything and creates no users, so it can run repeatedly against a real database.
 * Existing products keep admin-edited fields (stock, active, description, quantity rules, photos);
 * only category, unit and price follow the price list.
 */
import "dotenv/config";
import { existsSync, readFileSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { slugify } from "../src/lib/slug";
import { IMPORTED, VARIABLE_WEIGHT, quantityRules } from "./data/catalog-rules";
import { ourNetCents, priceList } from "./data/price-list";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL }),
});

const photos: Record<string, { file: string }> = existsSync("prisma/data/photos.json")
  ? JSON.parse(readFileSync("prisma/data/photos.json", "utf8"))
  : {};

async function main() {
  let created = 0;
  let updated = 0;
  let sort = 0;
  const slugs = new Set<string>();
  for (const [catName, rows] of Object.entries(priceList)) {
    const category = await db.category.upsert({
      where: { slug: slugify(catName) },
      update: { name: catName, sortOrder: sort },
      create: { name: catName, slug: slugify(catName), sortOrder: sort },
    });
    sort++;
    for (const row of rows) {
      const [name, unit] = row;
      const basePriceCents = ourNetCents(row);
      const slug = slugify(name);
      if (slugs.has(slug)) throw new Error(`Duplicate product slug: ${slug}`);
      slugs.add(slug);
      const existing = await db.product.findUnique({ where: { slug }, select: { id: true } });
      if (existing) {
        await db.product.update({
          where: { slug },
          data: { categoryId: category.id, unit, basePriceCents },
        });
        updated++;
      } else {
        const { min, step } = quantityRules(name, unit, basePriceCents);
        await db.product.create({
          data: {
            name, slug, categoryId: category.id, unit, basePriceCents,
            origin: IMPORTED.has(name) ? "IMPORT" : null,
            variableWeight: VARIABLE_WEIGHT.has(name),
            minQuantity: min, stepQuantity: step,
            photos: photos[slug] ? { create: { url: photos[slug].file } } : undefined,
          },
        });
        created++;
      }
    }
  }
  console.log(`Catalog loaded: ${created} created, ${updated} updated.`);
}

main().finally(() => db.$disconnect());
