import { getSanityWriteClient, isSanityWriteConfigured } from './write-client'

// Per-operation idempotency for the order-paid webhook (see "Make Shopify
// order-paid processing fully idempotent", 2026-09-14) — one deterministic
// id per individual side effect (one honey deduction for one hamper line
// item, one booking for one experience line item), never a random UUID.
// The same logical operation always recomputes the same id, so "has this
// exact operation already run" is answerable by a single document lookup,
// no matter how many times Shopify redelivers the webhook or how the
// delivery happened to fail partway through last time.
//
// Deliberately NOT used for the experience-booking operation itself —
// that one needs its marker created in the *same atomic transaction* as
// the actual booking increment (see experience-booking.ts), because two
// near-simultaneous duplicate deliveries racing this check-then-act
// pattern could both pass the check before either writes the marker. This
// module's check-then-mark pattern is only safe for hamper deductions,
// where the real concurrency guard is Shopify's own idempotent mutation
// key (see admin-inventory.ts) — this Sanity marker is a fast skip/logging
// layer on top of that, not the thing that actually prevents a double
// deduction.

// Sanity document ids allow a limited character set — this keeps every
// segment safe (lowercase alphanumeric and hyphens) regardless of what a
// honey's real name or Shopify's ids look like, while staying deterministic:
// the same input always produces the same output, unlike a hash chosen to
// "look tidier" would risk if ever changed.
function sanitizeIdSegment(value: string): string {
  const cleaned = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  return cleaned || 'x'
}

// Builds a deterministic Sanity document id from an ordered list of parts
// (e.g. [webhookId, 'hamper', lineItemId, honeyName]) — conceptually the
// same key shape as `{webhookId}:hamper:{lineItemId}:{honeyId}`, just using
// `.` as the separator and a sanitized alphabet, since Sanity ids can't
// contain `:`. Order matters: it's what makes two different operations on
// the same line item (e.g. two honeys in one mixed hamper) produce two
// different ids.
export function buildOperationId(parts: (string | number)[]): string {
  return ['webhookOp', ...parts.map((p) => sanitizeIdSegment(String(p)))].join('.')
}

// True if this exact operation has already run to completion (or reached
// a terminal, non-retryable outcome — see webhookOperation.outcome). Reads
// through the write client, never the CDN-cached read client, so a
// completion recorded moments ago by a concurrent request is never missed.
// Fails open (false) if Sanity write access isn't configured, same
// direction as isWebhookAlreadyProcessed and for the same reason — logged
// loudly, since it means this dedup guard is silently doing nothing (the
// hamper case still has Shopify's own idempotent key as a backstop; see
// module comment above).
export async function isOperationCompleted(operationId: string): Promise<boolean> {
  if (!isSanityWriteConfigured()) {
    console.error(
      `webhook-operations: SANITY_API_WRITE_TOKEN not configured — per-operation idempotency is NOT being enforced for ${operationId}`
    )
    return false
  }
  const existing = await getSanityWriteClient().getDocument(operationId)
  return existing != null
}

export type WebhookOperationOutcome = 'completed' | 'insufficient-stock' | 'insufficient-capacity'

// Marks one operation done. Call only after the side effect has actually
// finished (or reached a genuine terminal data outcome like
// "insufficient-stock") — never before, and never on a thrown/transient
// error, so a request that dies partway through leaves no record and a
// retry is free to actually attempt the work.
export async function markOperationCompleted(
  operationId: string,
  meta: {
    operationType: 'hamper-deduction' | 'experience-booking'
    webhookId: string
    orderId: number
    orderName: string
    lineItemId: string
    outcome: WebhookOperationOutcome
    detail: string
  }
): Promise<void> {
  if (!isSanityWriteConfigured()) return
  await getSanityWriteClient().createIfNotExists({
    _id: operationId,
    _type: 'webhookOperation',
    operationId,
    ...meta,
    completedAt: new Date().toISOString(),
  })
}

// Sanity rejects a plain `create()` (not createIfNotExists) with a
// document id that already exists — the atomic primitive that makes the
// experience-booking transaction in experience-booking.ts safe against two
// near-simultaneous duplicate deliveries racing for the same operation id:
// only one create can ever win for a given id, so only one transaction
// (marker + booking increment together) can ever commit.
//
// This detection is necessarily heuristic — Sanity's client doesn't expose
// a typed "already exists" error distinct from other 409s — so it checks
// both a status code and the documented wording. An error that doesn't
// match either falls through as a genuine transient failure (the existing,
// safe default: propagate, let the webhook return non-2xx, let Shopify
// retry), never the other way around — this can under-detect a duplicate
// and cause one harmless extra retry, but can never mistake a real failure
// for a duplicate and silently drop work.
export function isAlreadyExistsConflict(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  const message = error instanceof Error ? error.message : String(error)
  const statusCode =
    'statusCode' in error && typeof (error as { statusCode?: unknown }).statusCode === 'number'
      ? (error as { statusCode: number }).statusCode
      : undefined
  if (/already exists/i.test(message)) return true
  return statusCode === 409 && /exists/i.test(message)
}
