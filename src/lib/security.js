/** Shared security helpers for the verification flow. */
import { verifyConfig } from "@/lib/config";

/** Best-effort client IP from proxy headers (Render/Vercel/Cloudflare). */
export function clientIp(request) {
  const cf = request.headers.get("cf-connecting-ip");
  if (cf) return cf.trim();
  const real = request.headers.get("x-real-ip");
  if (real) return real.trim();
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return "unknown";
}

/**
 * In-memory sliding-window rate limiter.
 * Good enough for a single Render/Vercel instance; swap for Redis if you scale out.
 */
const buckets = new Map();

export function rateLimit(key, { limit, windowMs }) {
  const now = Date.now();
  const hits = (buckets.get(key) || []).filter((t) => now - t < windowMs);

  if (hits.length >= limit) {
    buckets.set(key, hits);
    return { allowed: false, retryAfter: Math.ceil((windowMs - (now - hits[0])) / 1000) };
  }

  hits.push(now);
  buckets.set(key, hits);

  // Opportunistic cleanup so the map cannot grow without bound.
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) {
      if (!v.length || now - v[v.length - 1] > windowMs) buckets.delete(k);
    }
  }

  return { allowed: true, remaining: limit - hits.length };
}

/** Verifies a Cloudflare Turnstile token server-side. */
export async function verifyTurnstile({ token, ip }) {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  // No captcha configured → skip (the UI falls back to the manual checkbox).
  if (!secret) return { ok: true, skipped: true };
  if (!token) return { ok: false, reason: "captcha_missing" };

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret,
        response: token,
        ...(ip && ip !== "unknown" ? { remoteip: ip } : {}),
      }),
    });
    const data = await res.json();
    if (data.success) return { ok: true };
    return { ok: false, reason: "captcha_failed", codes: data["error-codes"] };
  } catch {
    return { ok: false, reason: "captcha_unreachable" };
  }
}

/** Discord snowflake → account creation date. */
export function snowflakeDate(id) {
  try {
    return new Date(Number((BigInt(id) >> 22n) + 1420070400000n));
  } catch {
    return null;
  }
}

/** Rejects freshly-made alt accounts. 0 disables the check. */
export function checkAccountAge(userId) {
  const minDays = verifyConfig.minAccountAgeDays;
  if (!minDays) return { ok: true };

  const created = snowflakeDate(userId);
  if (!created) return { ok: true };

  const ageDays = (Date.now() - created.getTime()) / 86400000;
  if (ageDays < minDays) {
    return { ok: false, reason: "account_too_new", ageDays: Math.floor(ageDays), minDays };
  }
  return { ok: true, ageDays: Math.floor(ageDays) };
}
