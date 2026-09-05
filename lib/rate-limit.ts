import "server-only";

/**
 * Minimal in-memory, fixed-window rate limiter keyed by client IP.
 *
 * This protects public write endpoints (booking creation, cancellation)
 * from basic spam/abuse without any external infrastructure. It resets
 * whenever the serverless function cold-starts and isn't shared across
 * concurrent instances, so it's a best-effort throttle, not a hard
 * guarantee — for strict, distributed rate limiting at scale, swap this
 * for a shared store like Upstash Redis (`@upstash/ratelimit`).
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

// Bound memory growth: buckets are cheap, but a long-running instance
// under sustained random-IP abuse shouldn't accumulate forever.
const MAX_TRACKED_KEYS = 5000;

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    if (buckets.size >= MAX_TRACKED_KEYS) buckets.clear();
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (existing.count >= limit) {
    return { allowed: false, retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000) };
  }

  existing.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

/** Best-effort client IP extraction behind Vercel's proxy. */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
