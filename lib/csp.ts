/**
 * Static Content-Security-Policy, applied to every response via
 * next.config.ts. Deliberately not nonce-based: a per-request nonce would
 * require reading it with next/headers in the root layout, which forces
 * the entire site (including the otherwise fully static landing page) to
 * render dynamically on every request — a real performance cost this app
 * doesn't need to pay. `'unsafe-inline'` on script-src is the trade-off
 * that keeps static generation intact; everything else is locked down to
 * only the hosts this app actually talks to from the browser:
 *   - Supabase: admin login/logout (lib/supabase/client.ts) call the
 *     project's REST/Auth API directly from the browser.
 *   - Google Analytics: optional, only loaded post-consent (see
 *     components/GoogleAnalytics.tsx) when NEXT_PUBLIC_GA_MEASUREMENT_ID
 *     is set — allowed here unconditionally since an unused allowance is
 *     harmless and keeps this policy independent of env vars.
 *   - OpenStreetMap: the embedded location map iframe.
 */
export const CSP_HEADER = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline' https://www.googletagmanager.com`,
  `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' blob: data:`,
  `font-src 'self'`,
  `connect-src 'self' https://*.supabase.co https://*.google-analytics.com https://*.analytics.google.com`,
  `frame-src 'self' https://www.openstreetmap.org`,
  `object-src 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `frame-ancestors 'self'`,
  `upgrade-insecure-requests`,
].join("; ");
