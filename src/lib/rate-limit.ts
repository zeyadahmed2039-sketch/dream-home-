// Simple in-memory rate limiter (per-process). In production with multiple
// instances, replace with a shared store (e.g. Redis). Each key tracks a
// rolling window of request timestamps.
const store = new Map<string, number[]>();

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const cutoff = now - windowMs;
  const hits = (store.get(key) || []).filter((t) => t > cutoff);

  if (hits.length >= limit) {
    store.set(key, hits);
    return false;
  }

  hits.push(now);
  store.set(key, hits);
  return true;
}

export function ipKey(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}
