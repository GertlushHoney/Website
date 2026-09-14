import { getSanityWriteClient, isSanityWriteConfigured } from './write-client'

// Deterministic Sanity document _id derived from Shopify's own webhook
// delivery id (the X-Shopify-Webhook-Id header). Shopify's docs are
// explicit that this id "stays the same when Shopify retries the webhook
// delivery" — a timeout or a non-200 response causes a retry of the exact
// same delivery, not a new one — which is what makes it usable as an
// idempotency key at all. Prefixed so these bookkeeping documents are easy
// to spot (and bulk-clean up if ever needed) separately from real content.
function documentIdFor(webhookId: string): string {
  return `processedWebhookEvent.${webhookId}`
}

// True if this exact webhook delivery has already been fully processed.
// Reads through the write client (never a CDN-cached read client) so a
// delivery recorded moments ago by a concurrent request is never missed
// due to cache lag. Fails open (false) if Sanity write access isn't
// configured — see markWebhookProcessed below for why that's the safer
// direction — but logs loudly, since it means this critical dedup guard
// is silently doing nothing.
//
// See "FIX SHOPIFY WEBHOOK IDEMPOTENCY" audit, 2026-09-13 — the order-paid
// webhook had no idempotency guard at all despite performing real side
// effects (honey stock deductions, experience-booking increments), either
// of which Shopify redelivering the same webhook would silently double.
export async function isWebhookAlreadyProcessed(webhookId: string): Promise<boolean> {
  if (!isSanityWriteConfigured()) {
    console.error(
      'processed-webhooks: SANITY_API_WRITE_TOKEN not configured — webhook idempotency is NOT being enforced'
    )
    return false
  }
  const existing = await getSanityWriteClient().getDocument(documentIdFor(webhookId))
  return existing != null
}

// Marks a webhook delivery as done. Call this only after every side effect
// it triggers has actually completed successfully — never up front, and
// never if any part of processing failed. A request that dies partway
// through (a crash, a timeout, a thrown error) must leave no record, so
// Shopify's inevitable retry is free to actually finish the job instead of
// being silently swallowed by a "processed" marker for work that never
// happened.
export async function markWebhookProcessed(
  webhookId: string,
  meta: { topic: string; orderId: number; orderName: string }
): Promise<void> {
  if (!isSanityWriteConfigured()) return
  await getSanityWriteClient().createIfNotExists({
    _id: documentIdFor(webhookId),
    _type: 'processedWebhookEvent',
    webhookId,
    topic: meta.topic,
    orderId: meta.orderId,
    orderName: meta.orderName,
    processedAt: new Date().toISOString(),
  })
}
