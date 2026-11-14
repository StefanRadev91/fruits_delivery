export const appConfig = {
  currency: "EUR" as const,
  /** Also display BGN next to EUR (fixed conversion rate). */
  showBgn: process.env.NEXT_PUBLIC_SHOW_BGN === "true",
  bgnPerEur: 1.95583,
  /** Default VAT rate in percent (Bulgaria). */
  vatRate: 20,
  locale: "bg" as const,
  /** Home delivery for households. Off for now: the site serves businesses only. */
  b2cEnabled: process.env.NEXT_PUBLIC_B2C_ENABLED === "true",
};

export const siteUrl = process.env.APP_URL ?? "http://localhost:3000";
