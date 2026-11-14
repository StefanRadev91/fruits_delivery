"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { bg } from "@/i18n/bg";

const t = bg.cookies;
const COOKIE = "cookie_notice=1";

function subscribe(callback: () => void) {
  window.addEventListener("cookie-notice", callback);
  return () => window.removeEventListener("cookie-notice", callback);
}

export function CookieBanner() {
  // Server snapshot is "seen" so the banner never flashes into server HTML.
  const seen = useSyncExternalStore(
    subscribe,
    () => document.cookie.includes(COOKIE),
    () => true,
  );
  if (seen) return null;

  function accept() {
    document.cookie = `${COOKIE}; path=/; max-age=31536000; SameSite=Lax`;
    window.dispatchEvent(new Event("cookie-notice"));
  }

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 border-t bg-background p-4 shadow-lg"
      role="dialog"
      aria-label="Бисквитки"
      data-testid="cookie-banner"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center">
        <p className="flex-1 text-sm">
          {t.text}{" "}
          <Link href="/privacy" className="underline">{t.more}</Link>
        </p>
        <Button onClick={accept} data-testid="cookie-accept">{t.accept}</Button>
      </div>
    </div>
  );
}
