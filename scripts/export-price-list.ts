import { writeFileSync } from "node:fs";
import { OUR_REDUCTION_PERCENT, ourNetCents, priceList, supplierNetCents, vatLooksOff } from "../prisma/data/price-list";

const out = process.argv[2] ?? "price-list.csv";
const eur = (cents: number) => (cents / 100).toFixed(2).replace(".", ",");
const unit = { KG: "кг", PIECE: "бр.", BUNCH: "връзка" } as const;
const cell = (s: string) => (/[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);

const lines = [
  ["Категория", "Продукт", "Мярка", "Цена на доставчика без ДДС", "Цена на доставчика с ДДС (от листа)", `Наша цена без ДДС (−${OUR_REDUCTION_PERCENT}%)`, "Наша цена с ДДС", "Забележка"],
];
for (const [category, rows] of Object.entries(priceList)) {
  for (const row of rows) {
    const [name, u, net, gross] = row;
    const ours = ourNetCents(row);
    const notes = [
      net == null ? "няма цена без ДДС в листа — изчислена от цената с ДДС" : "",
      vatLooksOff(row) ? "колоните без/с ДДС не съответстват на 20% — проверете" : "",
    ].filter(Boolean).join("; ");
    lines.push([
      category, name, unit[u],
      net != null ? eur(net * 100) : `(${eur(supplierNetCents(row))})`,
      gross != null ? eur(gross * 100) : "",
      eur(ours), eur(Math.round(ours * 1.2)), notes,
    ]);
  }
}
// BOM + semicolon separators so Excel (Bulgarian locale) opens it correctly.
writeFileSync(out, "﻿" + lines.map((l) => l.map(cell).join(";")).join("\r\n") + "\r\n");
console.log(`Wrote ${lines.length - 1} products to ${out}`);
