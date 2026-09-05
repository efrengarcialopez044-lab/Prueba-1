/**
 * Runs once when the server starts (Next.js instrumentation hook). Used
 * here purely for a startup sanity check on optional env var groups — see
 * lib/env-check.ts. Guarded to the Node.js runtime since this doesn't
 * apply to the Edge runtime (proxy.ts) or the browser.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { checkEnvConfig } = await import("./lib/env-check");
    checkEnvConfig();
  }
}
