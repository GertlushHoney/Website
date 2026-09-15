import { createHmac, timingSafeEqual } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { getHoneyProducts } from '@/lib/sanity/products'
import { getProductByHandle } from '@/lib/shopify/product'
import { deductHoneyStock } from '@/lib/shopify/admin-inventory'
import {
  parseHamperJarCount,
  parseHoneySelection,
  CHOOSE_YOUR_OWN_VARIANT_LABEL,
  SURPRISE_VARIANT_LABEL,
  type HoneyTally,
} from '@/lib/hamper'
import {
  findExperienceSession,
  incrementSessionPlacesBooked,
  recordBookingConflict,
} from '@/lib/sanity/experience-booking'
import { isWebhookAlreadyProcessed, markWebhookProcessed } from '@/lib/sanity/processed-webhooks'
import {
  buildOperationId,
  isOperationCompleted,
  markOperationCompleted,
} from '@/lib/sanity/webhook-operations'

// Hamper stock sync (see docs/technical-architecture.md). A hamper is its
// own Shopify product with inventory tracking turned off (it's always
// "in stock" — the real limit is the honey it's made from), so buying one
// never touches the individual honey jars' own stock automatically.
// Shopify's native Bundles app can't help here since it only supports
// fixed compositions, not a customer mixing and matching which honey goes
// in which jar. This webhook is the workaround: for every paid order, it
// finds any hamper line items, works out which honey (or honeys, for a
// mixed pick, or a surprise) to charge the jars against, and adjusts that
// honey's real stock via the Admin API.
//
// Register this in Shopify Admin → Settings → Notifications → Webhooks:
// topic "Order payment", format JSON, URL
// https://www.gertlushhoney.co.uk/api/webhooks/shopify/order-paid — copy
// the signing secret it gives you into SHOPIFY_WEBHOOK_SECRET (here and in
// Vercel's env vars). This route is excluded from the site's Basic Auth
// gate (see middleware.ts) since Shopify can't supply those credentials;
// the HMAC check below is the real security boundary.

const HONEY_CHOICE_PROPERTY_NAME = 'Honey selection'
// Same key PurchaseOptions attaches an Experience booking's chosen date
// under — its value is the raw ISO date, not a display-formatted string,
// so it matches Sanity's session.date exactly. Detected generically (not
// tied to a specific product name) so a second Experience works without
// any webhook changes. On its own this is NOT enough to identify which
// experience/session to credit — see the product_id check below and
// findExperienceSession's own comment.
const SESSION_DATE_PROPERTY_NAME = 'Session date'

// Turns a webhook's plain numeric product_id into the same GID shape
// Shopify's Storefront API (and this codebase's ShopifyProduct.productId)
// uses, so the two are directly comparable without a second lookup just
// to convert formats.
function shopifyProductGid(productId: number): string {
  return `gid://shopify/Product/${productId}`
}

type ShopifyOrderLineItem = {
  // Shopify's own line item id — stable across retries of the same
  // delivery (it's the same order data every time), and the piece that
  // makes a per-operation id actually specific to *this* line, not just
  // this order. See "Make Shopify order-paid processing fully idempotent"
  // (2026-09-14).
  id: number
  // The Shopify product actually paid for on this line — Shopify's own
  // record of what was purchased, set when the order was placed and never
  // something a cart-attribute/property change can alter after the fact.
  // Used to confirm an experience booking's session date against the
  // product that was genuinely bought, not just a customer-settable
  // property value. See "TIE EXPERIENCE BOOKINGS TO THE PAID PRODUCT"
  // audit, 2026-09-15. Shopify sets this to null only for a line with no
  // real product behind it (a manually-added custom line) — never the
  // case for a real Experience purchase, but handled defensively below.
  product_id: number | null
  title: string
  quantity: number
  variant_title: string | null
  properties: { name: string; value: string }[] | null
}

type ShopifyOrderPayload = {
  id: number
  name: string
  line_items: ShopifyOrderLineItem[]
}

// Logs only the error's own message — never the raw error object (which,
// depending on the underlying client library, can carry response bodies or
// request details alongside it) and never the order/line-item payload
// itself, which can contain a customer's name, address or other order
// detail. See "FIX WEBHOOK RETRY BEHAVIOUR" audit, 2026-09-13.
function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

function isValidSignature(rawBody: string, signatureHeader: string | null, secret: string): boolean {
  if (!signatureHeader) return false
  const expected = createHmac('sha256', secret).update(rawBody, 'utf8').digest('base64')
  const expectedBuffer = Buffer.from(expected)
  const actualBuffer = Buffer.from(signatureHeader)
  if (expectedBuffer.length !== actualBuffer.length) return false
  return timingSafeEqual(expectedBuffer, actualBuffer)
}

// "Surprise selection" doesn't name a specific honey, so this picks one
// for the whole order: whichever currently-active honey has the most
// stock *among those that actually have enough for every hamper in this
// order* (jarsPerHamper × the line's quantity — a 3-jar hamper bought ×2
// needs 6 jars from one honey, not 3), so the surprise mechanic naturally
// favours what's abundant rather than eating into something already low,
// without ever picking a honey it can't actually fulfil. Previously this
// picked the most-stocked honey with no sufficiency check at all, so a
// hamper could be sold against a honey with less stock than the order
// needed. See "FIX SURPRISE HAMPER STOCK VALIDATION" audit, 2026-09-13 —
// the storefront now blocks this before checkout too (purchase-options.tsx),
// but this check stands on its own: it's what actually prevents the
// stock deduction below from ever running against insufficient stock,
// regardless of what happened client-side.
//
// The read here is only as fresh as the moment this webhook runs — a
// concurrent order could still consume the same stock in between. The
// real race protection is one level down, in adjustInventory's own
// changeFromQuantity check (a fresh read immediately before the mutation,
// which Shopify's API itself enforces as an optimistic-concurrency
// guard) — this function's job is just picking a plausible candidate.
async function pickSurpriseHoney(jarsPerHamper: number, hamperQuantity: number): Promise<HoneyTally[]> {
  const totalJarsRequired = jarsPerHamper * hamperQuantity
  const honeys = await getHoneyProducts()
  const withStock = await Promise.all(
    honeys.map(async (honey) => ({
      honeyName: honey.name,
      quantityAvailable: (await getProductByHandle(honey.shopifyHandle))?.quantityAvailable ?? 0,
    }))
  )
  const qualifying = withStock
    .filter((honey) => honey.quantityAvailable >= totalJarsRequired)
    .sort((a, b) => b.quantityAvailable - a.quantityAvailable)
  const best = qualifying[0]
  return best ? [{ honeyName: best.honeyName, jars: jarsPerHamper }] : []
}

async function resolveHoneyTally(
  line: ShopifyOrderLineItem,
  jarsPerHamper: number
): Promise<HoneyTally[]> {
  if (line.variant_title === SURPRISE_VARIANT_LABEL) {
    return pickSurpriseHoney(jarsPerHamper, line.quantity)
  }
  if (line.variant_title === CHOOSE_YOUR_OWN_VARIANT_LABEL) {
    const value = line.properties?.find((p) => p.name === HONEY_CHOICE_PROPERTY_NAME)?.value
    return value ? parseHoneySelection(value) : []
  }
  return []
}

export async function POST(request: NextRequest) {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET
  if (!secret) {
    console.error('order-paid webhook: SHOPIFY_WEBHOOK_SECRET is not configured')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  const rawBody = await request.text()
  const signature = request.headers.get('x-shopify-hmac-sha256')
  if (!isValidSignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let order: ShopifyOrderPayload
  try {
    order = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Unrecoverable: a payload missing the fields this route actually keys
  // everything off (which line item belongs to which order, and what to
  // call it in logs) can never be salvaged by a retry — Shopify would just
  // resend the identical body. 400 here, same as the invalid-JSON case
  // above, rather than a 5xx that implies trying again might help.
  if (typeof order?.id !== 'number' || typeof order?.name !== 'string') {
    console.error('order-paid webhook: payload missing required id/name fields')
    return NextResponse.json({ error: 'Malformed order payload' }, { status: 400 })
  }

  // Shopify's own delivery id — present on every real webhook request and,
  // per Shopify's docs, unchanged across retries of the *same* delivery
  // (a timeout or non-200 response triggers a retry, not a new delivery).
  // That stability is exactly what makes it usable as an idempotency key.
  // Its absence on an otherwise HMAC-valid request is unexpected enough
  // (every Shopify webhook has sent it for years) that refusing outright
  // is safer than silently processing with no way to de-duplicate a
  // request that does real stock/booking side effects.
  const webhookId = request.headers.get('x-shopify-webhook-id')
  if (!webhookId) {
    console.error('order-paid webhook: missing X-Shopify-Webhook-Id header')
    return NextResponse.json({ error: 'Missing webhook id' }, { status: 400 })
  }

  // Shopify explicitly documents that a webhook can be delivered more than
  // once — this must never repeat the stock deduction / booking increment
  // work below for a delivery already fully processed. Returning success
  // (rather than an error) tells Shopify the delivery is done and stops it
  // retrying further. See "FIX SHOPIFY WEBHOOK IDEMPOTENCY" audit,
  // 2026-09-13 — in-memory dedup wouldn't survive a redeploy or a
  // multi-instance deployment, so this is checked against Sanity, the same
  // persistent store every other piece of real state in this app uses.
  if (await isWebhookAlreadyProcessed(webhookId)) {
    return NextResponse.json({ ok: true, duplicate: true })
  }

  // Every individual side effect below (one honey deduction for one
  // hamper line, one booking increment for one experience line) is now
  // independently idempotent, keyed by a deterministic operation id (see
  // buildOperationId / webhook-operations.ts) — not just this whole
  // webhook delivery. This is the fix for "Make Shopify order-paid
  // processing fully idempotent" (2026-09-14): previously, a delivery that
  // got partway through (e.g. a hamper deduction succeeded, then an
  // experience booking threw) and was retried would redo *every* line,
  // including the one that already genuinely succeeded. Now a retry
  // recomputes the same operation ids, finds the ones already marked
  // complete, skips them, and only actually attempts the ones that never
  // finished last time.
  //
  // Two different kinds of failure can happen per operation, and they must
  // still be told apart:
  //  - A *data* problem (no matching experience session, an unresolvable
  //    honey choice) is logged and skipped — retrying the identical
  //    webhook would fail identically every time, so it can't block the
  //    rest of the order or the whole response.
  //  - A *transient* failure (an exception thrown by the Sanity or Shopify
  //    Admin API calls themselves — a network blip, a rate limit, a 5xx)
  //    might well succeed if attempted again. hadTransientFailure records
  //    that at least one occurred; the whole delivery is answered with a
  //    non-2xx below so Shopify retries it, and is deliberately NOT marked
  //    processed, so the retry can actually attempt the work again. A
  //    retry now only re-attempts the operations that actually failed —
  //    every operation that already completed is skipped via its own
  //    marker, closing the gap the previous per-line-item-only guard left.
  let hadTransientFailure = false

  for (const line of order.line_items ?? []) {
    const sessionDate = line.properties?.find((p) => p.name === SESSION_DATE_PROPERTY_NAME)?.value

    if (sessionDate) {
      try {
        // No product_id at all means this line isn't tied to a real
        // Shopify product — never something a genuine Experience purchase
        // produces, but treated as an unresolvable data problem rather
        // than assumed-safe, exactly like a date with no matching session.
        if (line.product_id == null) {
          console.error(
            `order-paid webhook: order ${order.name} (webhook ${webhookId}) — experience line "${line.title}" has a "${SESSION_DATE_PROPERTY_NAME}" property but no product_id, can't confirm what was actually paid for`
          )
          continue
        }
        const match = await findExperienceSession(shopifyProductGid(line.product_id), sessionDate)
        if (!match) {
          console.error(
            `order-paid webhook: order ${order.name} (webhook ${webhookId}) — no experience session found for date "${sessionDate}" on the actual paid product (from "${line.title}", product_id ${line.product_id})`
          )
          continue
        }
        const operationId = buildOperationId([
          webhookId,
          'experience',
          line.id,
          match.session._key,
        ])
        const result = await incrementSessionPlacesBooked(
          operationId,
          match.docId,
          match.session._key,
          line.quantity,
          { webhookId, orderId: order.id, orderName: order.name, lineItemId: String(line.id) }
        )
        if (result.outcome === 'alreadyCompleted') {
          console.log(
            `order-paid webhook: order ${order.name} (webhook ${webhookId}) — operation ${operationId} skipped (duplicate, already completed)`
          )
        } else if (result.outcome === 'insufficient_capacity') {
          // A genuine overbooking conflict, not a transient problem: the
          // customer has already paid (Shopify confirmed this order) but
          // there's no place left — someone else's booking won the same
          // race. Retrying this webhook later resolves identically every
          // time, so this must not set hadTransientFailure; instead it's
          // logged loudly and recorded durably for a human to refund or
          // otherwise accommodate. See docs/technical-architecture.md,
          // "Experience booking concurrency". incrementSessionPlacesBooked
          // itself records this outcome under `operationId`, so a later
          // retry of this exact operation resolves to `alreadyCompleted`
          // above instead of re-detecting (and this recording again) the
          // identical conflict.
          console.error(
            `OVERBOOKING CONFLICT — order-paid webhook: order ${order.name} (webhook ${webhookId}, operation ${operationId}) — requested ${line.quantity} place(s) for "${line.title}" on ${sessionDate}, only ${result.placesRemaining} actually available. Customer has already paid — needs manual follow-up.`
          )
          await recordBookingConflict({
            orderId: order.id,
            orderName: order.name,
            productTitle: line.title,
            sessionDate,
            placesRequested: line.quantity,
            placesRemaining: result.placesRemaining,
          })
        } else {
          console.log(
            `order-paid webhook: order ${order.name} (webhook ${webhookId}) — operation ${operationId} completed (booked ${line.quantity} place(s) for "${line.title}")`
          )
        }
      } catch (error) {
        hadTransientFailure = true
        console.error(
          `order-paid webhook: order ${order.name} (webhook ${webhookId}) — retryable failure recording experience booking for "${line.title}": ${errorMessage(error)}`
        )
      }
      continue
    }

    const jarsPerHamper = parseHamperJarCount(line.title)
    if (jarsPerHamper === null) continue

    // Resolving the tally itself can throw — "Surprise selection" fetches
    // live honey stock from Sanity/Shopify (pickSurpriseHoney) to pick a
    // candidate, a real network call independent of any single honey's
    // own deduction below. A failure here must be treated as retryable,
    // same as a failure deducting stock, not silently swallowed.
    let tally: HoneyTally[]
    try {
      tally = await resolveHoneyTally(line, jarsPerHamper)
    } catch (error) {
      hadTransientFailure = true
      console.error(
        `order-paid webhook: order ${order.name} (webhook ${webhookId}) — retryable failure resolving honey selection for "${line.title}": ${errorMessage(error)}`
      )
      continue
    }
    if (tally.length === 0) {
      console.error(
        `order-paid webhook: order ${order.name} (webhook ${webhookId}) — couldn't resolve a honey selection for "${line.title}" (variant "${line.variant_title}")`
      )
      continue
    }

    for (const { honeyName, jars } of tally) {
      const totalJars = jars * line.quantity
      const operationId = buildOperationId([webhookId, 'hamper', line.id, honeyName])

      if (await isOperationCompleted(operationId)) {
        console.log(
          `order-paid webhook: order ${order.name} (webhook ${webhookId}) — operation ${operationId} skipped (duplicate, already completed)`
        )
        continue
      }

      try {
        // Shopify's own idempotent mutation key (see admin-inventory.ts)
        // is what actually closes the race for two near-simultaneous
        // duplicate deliveries — this Sanity marker is the fast
        // skip-and-log layer on top of that, checked before ever calling
        // Shopify.
        const adjusted = await deductHoneyStock(honeyName, totalJars, operationId)
        await markOperationCompleted(operationId, {
          operationType: 'hamper-deduction',
          webhookId,
          orderId: order.id,
          orderName: order.name,
          lineItemId: String(line.id),
          outcome: adjusted ? 'completed' : 'insufficient-stock',
          detail: `${totalJars} jar(s) of ${honeyName} from "${line.title}"`,
        })
        if (adjusted) {
          console.log(
            `order-paid webhook: order ${order.name} (webhook ${webhookId}) — operation ${operationId} completed (deducted ${totalJars} jar(s) of ${honeyName})`
          )
        } else {
          console.error(
            `order-paid webhook: order ${order.name} (webhook ${webhookId}, operation ${operationId}) — couldn't adjust stock for "${honeyName}" (${totalJars} jars from "${line.title}")`
          )
        }
      } catch (error) {
        hadTransientFailure = true
        console.error(
          `order-paid webhook: order ${order.name} (webhook ${webhookId}) — retryable failure on operation ${operationId} ("${honeyName}", ${totalJars} jars from "${line.title}"): ${errorMessage(error)}`
        )
      }
    }
  }

  if (hadTransientFailure) {
    // Not marked processed — see the comment above the loop. The non-2xx
    // is what tells Shopify to actually redeliver this webhook rather than
    // treating it as done.
    return NextResponse.json({ error: 'Temporary failure processing order' }, { status: 502 })
  }

  // Only marked now that the whole delivery has genuinely finished (data
  // problems logged above notwithstanding — retrying wouldn't fix those) —
  // never up front, so a request that crashes before reaching here leaves
  // no record and Shopify's retry can attempt the work again.
  await markWebhookProcessed(webhookId, {
    topic: 'orders/paid',
    orderId: order.id,
    orderName: order.name,
  })

  return NextResponse.json({ ok: true })
}
