import "dotenv/config";
import { existsSync, readFileSync } from "node:fs";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type Unit } from "../src/generated/prisma/client";
import { addDays, sofiaNow } from "../src/domain/delivery";
import { slugify } from "../src/lib/slug";
import { IMPORTED, VARIABLE_WEIGHT, quantityRules } from "./data/catalog-rules";
import { ourNetCents, priceList } from "./data/price-list";

if (process.env.NODE_ENV === "production") {
  throw new Error("Refusing to seed a production database.");
}

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const PASSWORD = "demo1234";
/** Example photos fetched by scripts/fetch-product-photos.ts (slug -> file). */
const photos: Record<string, { file: string }> = existsSync("prisma/data/photos.json")
  ? JSON.parse(readFileSync("prisma/data/photos.json", "utf8"))
  : {};
const date = (iso: string) => new Date(`${iso}T00:00:00Z`);
const today = sofiaNow(new Date()).date;
async function main() {
  // Reset (children first)
  for (const m of [
    db.invoice, db.payment, db.orderLine, db.order, db.standingOrderSkip, db.standingOrderItem,
    db.standingOrder, db.favorite, db.priceListItem, db.productPhoto, db.product, db.category,
    db.address, db.companyMember, db.company, db.priceList, db.timeSlot, db.zonePostcode,
    db.deliveryZone, db.account, db.verificationToken, db.user,
  ]) {
    await (m as unknown as { deleteMany: () => Promise<unknown> }).deleteMany();
  }

  // Catalog (from the supplier price list, minus our reduction)
  const products: Record<string, { id: string; basePriceCents: number; unit: Unit; variableWeight: boolean; name: string }> = {};
  const slugs = new Set<string>();
  let sort = 0;
  for (const [catName, rows] of Object.entries(priceList)) {
    const category = await db.category.create({
      data: { name: catName, slug: slugify(catName), sortOrder: sort++ },
    });
    for (const row of rows) {
      const [name, unit] = row;
      const basePriceCents = ourNetCents(row);
      const slug = slugify(name);
      if (slugs.has(slug)) throw new Error(`Duplicate product slug: ${slug}`);
      slugs.add(slug);
      const { min, step } = quantityRules(name, unit, basePriceCents);
      products[name] = await db.product.create({
        data: {
          name, slug, categoryId: category.id, unit, basePriceCents,
          origin: IMPORTED.has(name) ? "IMPORT" : null,
          variableWeight: VARIABLE_WEIGHT.has(name),
          minQuantity: min, stepQuantity: step,
          photos: photos[slug] ? { create: { url: photos[slug].file } } : undefined,
        },
      });
    }
  }


  // Delivery zones
  const slots = [["06:00", "08:00"], ["08:00", "11:00"], ["11:00", "14:00"], ["14:00", "18:00"]];
  const mkZone = async (
    name: string, weekdays: number[], cutoff: string,
    b2b: [number, number], b2c: [number, number], postcodes: [string, string][],
  ) =>
    db.deliveryZone.create({
      data: {
        name, deliveryWeekdays: weekdays, cutoffTime: cutoff, leadDays: 1,
        b2bMinOrderCents: b2b[0], b2bFeeCents: b2b[1],
        b2cMinOrderCents: b2c[0], b2cFeeCents: b2c[1],
        postcodes: { create: postcodes.map(([city, postcode]) => ({ city, postcode })) },
        slots: { create: slots.map(([startTime, endTime]) => ({ startTime, endTime })) },
      },
      include: { slots: true },
    });
  const center = await mkZone("София – център", [1, 2, 3, 4, 5, 6], "22:00", [3000, 0], [2000, 300],
    [["София", "1000"], ["София", "1124"], ["София", "1164"], ["София", "1408"]]);
  await mkZone("София – периферия", [2, 4, 6], "20:00", [5000, 500], [3000, 400],
    [["София", "1700"], ["София", "1618"], ["София", "1799"], ["София", "1836"]]);
  await mkZone("Пловдив", [1, 3, 5], "18:00", [6000, 600], [3500, 500],
    [["Пловдив", "4000"], ["Пловдив", "4003"], ["Пловдив", "4004"]]);

  // Users
  const passwordHash = await bcrypt.hash(PASSWORD, 10);
  const user = (email: string, name: string, role: "ADMIN" | "STAFF" | "CUSTOMER" = "CUSTOMER") =>
    db.user.create({ data: { email, name, role, passwordHash, emailVerified: new Date(), phone: "+359 888 000 000" } });
  await user("admin@fruits.local", "Администратор", "ADMIN");
  await user("staff@fruits.local", "Складов работник", "STAFF");
  const ivana = await user("ivana@example.bg", "Ивана Георгиева");

  // Price lists & companies
  const restaurants = await db.priceList.create({ data: { name: "Ресторанти −8%", discountPercent: 8 } });
  const hotels = await db.priceList.create({
    data: {
      name: "Хотели −10%", discountPercent: 10,
      items: { create: [{ productId: products["Портокал фреш"].id, priceCents: 100 }] },
    },
  });

  const mkCompany = async (
    name: string, eik: string, mol: string, contact: string, ownerEmail: string,
    opts: { status?: "PENDING" | "APPROVED"; terms?: number; priceListId?: string; vat?: boolean } = {},
  ) => {
    const owner = await user(ownerEmail, contact);
    const company = await db.company.create({
      data: {
        name, eik, mol, contactName: contact, contactPhone: "+359 888 111 222",
        vatNumber: opts.vat === false ? null : `BG${eik}`,
        status: opts.status ?? "APPROVED",
        paymentTermsDays: opts.terms ?? null,
        priceListId: opts.priceListId,
        members: { create: { userId: owner.id, role: "OWNER" } },
        addresses: {
          create: [
            { label: "Основен обект", city: "София", postcode: "1000", street: "ул. Граф Игнатиев 15" },
            { label: "Втори обект", city: "София", postcode: "1164", street: "бул. Черни връх 47" },
          ],
        },
      },
      include: { addresses: true },
    });
    return { company, owner };
  };

  const roza = await mkCompany("Ресторант „Роза“ ЕООД", "203456783", "Петър Димитров", "Петър Димитров", "owner@roza.example",
    { terms: 14, priceListId: restaurants.id });
  const orderer = await user("orderer@roza.example", "Мария Стоянова");
  await db.companyMember.create({ data: { userId: orderer.id, companyId: roza.company.id, role: "ORDERER" } });
  const hotel = await mkCompany("Хотел „Слънце“ АД", "204567893", "Георги Колев", "Георги Колев", "owner@slunce.example",
    { terms: 30, priceListId: hotels.id });
  await mkCompany("Кафене „Луна“ ЕТ", "206789120", "Анна Тодорова", "Анна Тодорова", "owner@luna.example",
    { vat: false });
  await mkCompany("Детска градина „Детелина“", "205678918", "Силвия Маринова", "Силвия Маринова", "owner@detelina.example",
    { status: "PENDING" });

  // Favorites
  for (const n of ["Домат розов", "Краставица", "Картоф стар", "Лук кромид", "Магданоз"]) {
    await db.favorite.create({ data: { userId: roza.owner.id, productId: products[n].id } });
  }

  // Orders
  const tomorrow = addDays(today, 1);
  const slot = center.slots[1];
  const mkOrder = async (o: {
    company?: typeof roza; guest?: boolean; status: "NEW" | "CONFIRMED" | "DELIVERED"; day: string;
    lines: [string, number][]; payment: "INVOICE" | "CASH" | "CARD"; priceFactor?: number;
    actual?: Record<string, number>;
  }) => {
    const b2b = !!o.company;
    const addr = o.company?.company.addresses[0];
    return db.order.create({
      data: {
        audience: b2b ? "B2B" : "B2C", status: o.status,
        userId: b2b ? o.company!.owner.id : o.guest ? null : ivana.id,
        companyId: o.company?.company.id,
        guestEmail: o.guest ? "gost@example.bg" : null,
        contactName: b2b ? o.company!.owner.name! : "Ивана Георгиева",
        contactPhone: "+359 888 000 000",
        city: addr?.city ?? "София", postcode: addr?.postcode ?? "1124",
        street: addr?.street ?? "ул. Шипка 8",
        zoneId: center.id, deliveryDate: date(o.day), timeSlotId: slot.id,
        paymentMethod: o.payment, paymentTermsDays: o.payment === "INVOICE" ? o.company?.company.paymentTermsDays : null,
        paymentStatus: o.status === "DELIVERED" && o.payment !== "INVOICE" ? "PAID" : "PENDING",
        deliveryFeeCents: b2b ? 0 : 300,
        lines: {
          create: o.lines.map(([name, qty]) => {
            const p = products[name];
            return {
              productId: p.id, productName: p.name, unit: p.unit,
              unitNetCents: Math.round(p.basePriceCents * (o.priceFactor ?? 1)),
              variableWeight: p.variableWeight, quantity: qty,
              actualQuantity: o.actual?.[name],
            };
          }),
        },
      },
    });
  };
  await mkOrder({ guest: false, status: "DELIVERED", day: addDays(today, -3), payment: "CASH",
    lines: [["Банани", 2], ["Ябълка златна", 3], ["Лимони", 1]] });
  await mkOrder({ guest: true, status: "NEW", day: tomorrow, payment: "CARD",
    lines: [["Домат розов", 2], ["Краставица", 1.5], ["Магданоз", 5], ["Зеле", 5]] });
  await mkOrder({ company: roza, status: "CONFIRMED", day: tomorrow, payment: "INVOICE", priceFactor: 0.92,
    lines: [["Домат розов", 10], ["Картоф стар", 20], ["Лук кромид", 10], ["Зеле", 6], ["Целина", 4]] });
  await mkOrder({ company: hotel, status: "NEW", day: tomorrow, payment: "INVOICE", priceFactor: 0.9,
    lines: [["Портокал фреш", 30], ["Банани", 15], ["Морков", 10], ["Ананас", 6]] });
  await mkOrder({ company: roza, status: "DELIVERED", day: addDays(today, -2), payment: "INVOICE", priceFactor: 0.92,
    lines: [["Зеле", 5], ["Целина", 3], ["Картоф стар", 10]], actual: { Зеле: 5.4, Целина: 2.8 } });

  // Standing order: Mon/Wed/Fri for Роза
  await db.standingOrder.create({
    data: {
      companyId: roza.company.id, addressId: roza.company.addresses[0].id, zoneId: center.id,
      timeSlotId: center.slots[0].id, weekdays: [1, 3, 5], startDate: date(addDays(today, -14)),
      items: {
        create: [
          { productId: products["Картоф стар"].id, quantity: 10 },
          { productId: products["Лук кромид"].id, quantity: 5 },
          { productId: products["Магданоз"].id, quantity: 10 },
        ],
      },
    },
  });

  console.log(`Seed done. Demo password for all users: ${PASSWORD}`);
}

main().finally(() => db.$disconnect());
