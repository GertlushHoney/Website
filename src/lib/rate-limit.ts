import { headers } from 'next/headers'
import { getSanityWriteClient, isSanityWriteConfigured } from './sanity/write-client'

// Per-feature rate limiting for the site's publicly callable Server
// Actions (review submission, newsletter signup, restock alerts) — see
// "ADD PUBLIC FORM RATE LIMITING" audit, 2026-09-15. A script doesn't have
// to fill in the visible form and trip the honeypot; it can call the
// action directly, as many times as it likes, with no browser involved at
// all. Rate limiting is the backstop for exactly that case.
//
// Backed by Sanity, not an in-memory counter or a new Redis/KV account:
// this app already has a configured, durable, write-capable Sanity
// project (the same one webhookOperation/processedWebhookEvent use for
// idempotency bookkeeping), and an in-memory counter would silently reset
// on every cold start and never be shared across concurrent serverless
// instances — meaning it would look like it works locally and do close to
// nothing in production. If this ever needs sub-millisecond checks at
// real scale, a dedicated KV store is the natural upgrade — not needed at
// this traffic level.
//
// Fixed windows, one Sanity document per (action, identifier, window) —
// the window index is baked into the document's own _id, so a new window
// is simply a new document (starting at count 0 via createIfNotExists)
// rather than something that has to notice a previous count has "expired"
// and reset it. The same deterministic-id idea as webhookOperation, for
// the same reason: it turns "what's the count for this window" into a
// single, unambiguous lookup.

// Sanity document ids allow a limited character set — keeps every segment
// safe (lowercase alphanumeric and hyphens) regardless of what an email
// address or IP actually looks like.
function sanitizeIdSegment(value: string): string {
  const cleaned = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  return cleaned || 'x'
}

// Vercel (and most proxies) set x-forwarded-for to "client, proxy1,
// proxy2..." — the first entry is the original client. Falls back to
// x-real-ip, then a fixed placeholder for local dev/tooling where neither
// header exists, so rate limiting still groups those requests together
// rather than crashing or silently no-op-ing.
export async function getClientIp(): Promise<string> {
  const requestHeaders = await headers()
  const forwardedFor = requestHeaders.get('x-forwarded-for')
  if (forwardedFor) {
    const first = forwardedFor.split(',')[0]?.trim()
    if (first) return first
  }
  return requestHeaders.get('x-real-ip') ?? 'unknown'
}

// Records one hit for (action, identifier) in the current window and
// returns the count *after* this hit. Fails open (returns 0, i.e. "not
// limited") if Sanity write access isn't configured or the check itself
// errors — a rate limiter must never be the reason a genuine customer's
// submission fails, and every action already has its own real
// availability check for the dependency it actually needs (Sanity for
// reviews, Shopify for newsletter/restock).
async function hit(action: string, identifier: string, windowMs: number): Promise<number> {
  if (!isSanityWriteConfigured()) return 0
  const windowIndex = Math.floor(Date.now() / windowMs)
  const id = `rateLimit.${sanitizeIdSegment(action)}.${sanitizeIdSegment(identifier)}.${windowIndex}`
  try {
    const client = getSanityWriteClient()
    await client.createIfNotExists({ _id: id, _type: 'rateLimitBucket', action, count: 0 })
    const patched = await client.patch(id).inc({ count: 1 }).commit<{ count: number }>()
    return patched.count
  } catch (error) {
    console.error('Rate limit check failed (failing open):', error)
    return 0
  }
}

export type RateLimitCheck = {
  // A short, stable name for the thing being limited, e.g. "review-ip" or
  // "newsletter-email" — kept separate per axis (IP vs email) rather than
  // combined, so one script hammering from a single IP with rotating
  // emails still gets caught by the IP axis, and one email retried across
  // rotating IPs/proxies still gets caught by the email axis.
  action: string
  identifier: string
  windowMs: number
  max: number
}

// Runs every check and returns true (limited) on the first one that's
// over its max — deliberately checks all axes rather than stopping at the
// first identifier, so e.g. a newsletter signup counts against *both* its
// IP and email buckets even if the IP bucket alone wasn't over the limit.
export async function isRateLimited(checks: RateLimitCheck[]): Promise<boolean> {
  let limited = false
  for (const check of checks) {
    const count = await hit(check.action, check.identifier, check.windowMs)
    if (count > check.max) limited = true
  }
  return limited
}
