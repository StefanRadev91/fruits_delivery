import { appConfig } from "@/config/app";

/** All money is stored as integer cents (EUR). */

export function toBgnCents(eurCents: number, rate = appConfig.bgnPerEur): number {
  return Math.round(eurCents * rate);
}

function format(cents: number, symbol: string): string {
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(cents);
  const whole = Math.floor(abs / 100);
  const frac = String(abs % 100).padStart(2, "0");
  return `${sign}${whole},${frac} ${symbol}`;
}

/** "12,50 €" or, when BGN is enabled, "12,50 € (24,45 лв.)". */
export function formatMoney(
  eurCents: number,
  opts: { showBgn?: boolean } = {},
): string {
  const showBgn = opts.showBgn ?? appConfig.showBgn;
  const eur = format(eurCents, "€");
  return showBgn ? `${eur} (${format(toBgnCents(eurCents), "лв.")})` : eur;
}
