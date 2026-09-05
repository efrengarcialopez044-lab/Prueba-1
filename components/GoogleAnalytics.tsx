"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import {
  COOKIE_CONSENT_EVENT,
  COOKIE_CONSENT_KEY,
  type CookieConsentValue,
} from "@/components/CookieConsent";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

/**
 * Loads Google Analytics only once the visitor has accepted cookies, and
 * only if NEXT_PUBLIC_GA_MEASUREMENT_ID is configured. Without that env
 * var this renders nothing — no Google script is ever requested.
 */
export function GoogleAnalytics() {
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    if (!GA_MEASUREMENT_ID) return;

    function checkConsent() {
      try {
        setConsented(localStorage.getItem(COOKIE_CONSENT_KEY) === "accepted");
      } catch {
        setConsented(false);
      }
    }

    checkConsent();

    function onConsentChange(e: Event) {
      const value = (e as CustomEvent<CookieConsentValue>).detail;
      setConsented(value === "accepted");
    }

    window.addEventListener(COOKIE_CONSENT_EVENT, onConsentChange);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, onConsentChange);
  }, []);

  if (!GA_MEASUREMENT_ID || !consented) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  );
}
