/* ============================================================
   Rate limiting.

   A public site holding a live API key needs a brake. This is an
   in-memory token bucket per IP plus a global daily cap, which is
   adequate for a portfolio and costs nothing to run.

   Caveat worth knowing: serverless instances do not share memory,
   so the effective limit is per-instance. For a personal site that
   is fine. If this ever sees real traffic, swap the Map for Upstash
   Redis — the interface below is the only thing that would change.
   ============================================================ */

interface Bucket {
  tokens: number;
  last: number;
}

const BUCKET_SIZE = 14;
/** Tokens per second — roughly one question every four seconds, sustained. */
const REFILL_RATE = 1 / 4;
const GLOBAL_DAILY_CAP = 2000;
const SWEEP_AFTER_MS = 30 * 60 * 1000;

const buckets = new Map<string, Bucket>();

let globalCount = 0;
let globalWindowStart = Date.now();

function sweep(now: number) {
  if (buckets.size < 500) return;
  for (const [key, b] of buckets) {
    if (now - b.last > SWEEP_AFTER_MS) buckets.delete(key);
  }
}

export type LimitResult =
  | { allowed: true }
  | { allowed: false; reason: "per-ip" | "global" };

export function checkLimit(ip: string): LimitResult {
  const now = Date.now();

  // Global daily cap — protects the key from a single bad day.
  if (now - globalWindowStart > 24 * 60 * 60 * 1000) {
    globalCount = 0;
    globalWindowStart = now;
  }
  if (globalCount >= GLOBAL_DAILY_CAP) return { allowed: false, reason: "global" };

  sweep(now);

  const bucket = buckets.get(ip) ?? { tokens: BUCKET_SIZE, last: now };
  const elapsed = (now - bucket.last) / 1000;
  bucket.tokens = Math.min(BUCKET_SIZE, bucket.tokens + elapsed * REFILL_RATE);
  bucket.last = now;

  if (bucket.tokens < 1) {
    buckets.set(ip, bucket);
    return { allowed: false, reason: "per-ip" };
  }

  bucket.tokens -= 1;
  buckets.set(ip, bucket);
  globalCount += 1;
  return { allowed: true };
}

/** Best-effort client IP behind Vercel's proxy. */
export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
