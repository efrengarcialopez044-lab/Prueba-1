"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export const COOKIE_CONSENT_KEY = "cookie_consent";
export const COOKIE_CONSENT_EVENT = "cookie-consent-changed";

export type CookieConsentValue = "accepted" | "rejected";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // localStorage isn't available during SSR, so this can only be read
    // after mount — the resulting one-time setState is unavoidable here.
    try {
      const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (!stored) setVisible(true);
    } catch {
      // localStorage blocked (private mode, etc.) — don't nag on every load.
    }
  }, []);

  function choose(value: CookieConsentValue) {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, value);
    } catch {
      // Ignore — worst case the banner reappears next visit.
    }
    window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT, { detail: value }));
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-sand-200 bg-white/95 p-4 backdrop-blur-sm sm:p-5">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <p className="text-center text-sm text-forest-800/80 sm:text-left">
          Usamos cookies propias y, si las aceptas, de analítica para entender cómo se usa la
          web. Puedes cambiar tu decisión cuando quieras en la{" "}
          <Link href="/politica-cookies" className="underline hover:text-forest-800">
            política de cookies
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-3">
          <Button variant="outline" size="sm" onClick={() => choose("rejected")}>
            Rechazar
          </Button>
          <Button size="sm" onClick={() => choose("accepted")}>
            Aceptar
          </Button>
        </div>
      </div>
    </div>
  );
}
