/**
 * Warns (once, at server start) about half-configured integrations —
 * env vars that only make sense set together. A silent typo in one of a
 * pair (e.g. STRIPE_SECRET_KEY without STRIPE_WEBHOOK_SECRET) would
 * otherwise fail quietly at the worst possible time: mid-checkout, or
 * mid-webhook, in production. This never throws — every integration here
 * is optional and the app runs fine in demo mode with none of them set.
 */
export function checkEnvConfig(): void {
  const warn = (message: string) => console.warn(`[env-check] ${message}`);

  const supabaseVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };
  reportPartialGroup("Supabase", supabaseVars, warn);

  const stripeVars = {
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  };
  reportPartialGroup("Stripe", stripeVars, warn);

  const googleCalendarVars = {
    GOOGLE_SERVICE_ACCOUNT_EMAIL: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
    GOOGLE_CALENDAR_ID: process.env.GOOGLE_CALENDAR_ID,
  };
  reportPartialGroup("Google Calendar", googleCalendarVars, warn);

  if (process.env.RESEND_API_KEY && !process.env.EMAIL_FROM) {
    warn("RESEND_API_KEY está definida pero falta EMAIL_FROM — los emails no se enviarán.");
  }
}

function reportPartialGroup(
  name: string,
  vars: Record<string, string | undefined>,
  warn: (message: string) => void
) {
  const entries = Object.entries(vars);
  const set = entries.filter(([, value]) => Boolean(value));
  const missing = entries.filter(([, value]) => !value);

  if (set.length > 0 && missing.length > 0) {
    warn(
      `${name} está configurado a medias — faltan: ${missing.map(([key]) => key).join(", ")}. ` +
        `La integración no funcionará correctamente hasta que estén todas definidas.`
    );
  }
}
