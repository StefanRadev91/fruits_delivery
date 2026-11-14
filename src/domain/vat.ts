import { appConfig } from "@/config/app";

/** VAT amount for a net amount (cents). */
export function vatOf(netCents: number, rate = appConfig.vatRate): number {
  return Math.round((netCents * rate) / 100);
}

/** Net -> gross (cents). */
export function addVat(netCents: number, rate = appConfig.vatRate): number {
  return netCents + vatOf(netCents, rate);
}

/** Gross -> net (cents). */
export function removeVat(grossCents: number, rate = appConfig.vatRate): number {
  return Math.round((grossCents * 100) / (100 + rate));
}
