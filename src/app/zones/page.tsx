import type { Metadata } from "next";
import { appConfig } from "@/config/app";
import { formatMoney } from "@/domain/money";
import { bg } from "@/i18n/bg";
import { formatWeekdays } from "@/i18n/labels";
import { db } from "@/lib/db";

const t = bg.zones;
export const metadata: Metadata = {
  title: t.title,
  description: t.intro,
  alternates: { canonical: "/zones" },
};

function Terms({ title, min, fee }: { title: string; min: number; fee: number }) {
  return (
    <div>
      <h3 className="font-medium">{title}</h3>
      <p className="text-sm">
        {t.minOrder}: {min > 0 ? formatMoney(min) : t.none} · {t.fee}: {fee > 0 ? formatMoney(fee) : t.free}
      </p>
    </div>
  );
}

export default async function ZonesPage() {
  const zones = await db.deliveryZone.findMany({
    where: { active: true },
    include: { postcodes: { orderBy: { postcode: "asc" } } },
    orderBy: { name: "asc" },
  });

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 space-y-6 px-4 py-10" data-testid="zones-page">
      <h1 className="text-3xl font-extrabold">{t.title}</h1>
      <p>{t.intro}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {zones.map((z) => (
          <section key={z.id} className="space-y-3 rounded-xl border p-5" data-testid="zone-card">
            <h2 className="text-xl font-semibold">{z.name}</h2>
            <p className="text-sm">
              <span className="text-muted-foreground">{t.deliveryDays}:</span> {formatWeekdays(z.deliveryWeekdays)}
              <br />
              <span className="text-muted-foreground">{t.cutoff}:</span> {z.cutoffTime}{" "}
              {z.leadDays === 1 ? t.cutoffNextDay : `(${z.leadDays} дни преди доставката)`}
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">{t.areas}:</span>{" "}
              {z.postcodes.map((p) => `${p.city} ${p.postcode}`).join(", ")}
            </p>
            {appConfig.b2cEnabled && <Terms title={t.individuals} min={z.b2cMinOrderCents} fee={z.b2cFeeCents} />}
            <Terms title={t.businesses} min={z.b2bMinOrderCents} fee={z.b2bFeeCents} />
          </section>
        ))}
      </div>
    </main>
  );
}
