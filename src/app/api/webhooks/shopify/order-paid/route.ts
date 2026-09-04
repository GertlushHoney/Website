import { createHmac, timingSafeEqual } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { getHoneyProducts } from '@/lib/sanity/products'
import { getProductByHandle } from '@/lib/shopify/product'
import { deductHoneyStock } from '@/lib/shopify/admin-inventory'
import { parseHamperJarCount, parseHoneySelection, type HoneyTally } from '@/lib/hamper'

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

const SURPRISE_VARIANT_LABEL = 'Surprise selection'
const CHOOSE_YOUR_OWN_VARIANT_LABEL = 'Choose your own'
const HONEY_CHOICE_PROPERTY_NAME = 'Honey selection'

type ShopifyOrderLineItem = {
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

function isValidSignature(rawBody: string, signatureHeader: string | null, secret: string): boolean {
  if (!signatureHeader) return false
  const expected = createHmac('sha256', secret).update(rawBody, 'utf8').digest('base64')
  const expectedBuffer = Buffer.from(expected)
  const actualBuffer = Buffer.from(signatureHeader)
  if (expectedBuffer.length !== actualBuffer.length) return false
  return timingSafeEqual(expectedBuffer, actualBuffer)
}

// "Surprise selection" doesn't name a specific honey, so this picks one
// for the whole hamper: whichever currently-active honey has the most
// stock, so the surprise mechanic naturally favours what's abundant
// rather than eating into something already low. A different rule
// (round-robin, even split) would be just as valid — this is the
// simplest one that can't accidentally sell out something already scarce.
async function pickSurpriseHoney(jarsPerHamper: number): Promise<HoneyTally[]> {
  const honeys = await getHoneyProducts()
  const withStock = await Promise.all(
    honeys.map(async (honey) => ({
      honeyName: honey.name,
      quantityAvailable: (await getProductByHandle(honey.shopifyHandle))?.quantityAvailable ?? 0,
    }))
  )
  const mostInStock = withStock.sort((a, b) => b.quantityAvailable - a.quantityAvailable)[0]
  return mostInStock ? [{ honeyName: mostInStock.honeyName, jars: jarsPerHamper }] : []
}

async function resolveHoneyTally(
  line: ShopifyOrderLineItem,
  jarsPerHamper: number
): Promise<HoneyTally[]> {
  if (line.variant_title === SURPRISE_VARIANT_LABEL) {
    return pickSurpriseHoney(jarsPerHamper)
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

  // Always 200 past this point — a failure here is a business-logic
  // problem (an unresolvable honey choice, an Admin API hiccup), not
  // something Shopify retrying the same webhook delivery will fix. Errors
  // are logged for manual follow-up instead.
  for (const line of order.line_items ?? []) {
    const jarsPerHamper = parseHamperJarCount(line.title)
    if (jarsPerHamper === null) continue

    try {
      const tally = await resolveHoneyTally(line, jarsPerHamper)
      if (tally.length === 0) {
        console.error(
          `order-paid webhook: order ${order.name} — couldn't resolve a honey selection for "${line.title}" (variant "${line.variant_title}")`
        )
        continue
      }

      for (const { honeyName, jars } of tally) {
        const totalJars = jars * line.quantity
        const adjusted = await deductHoneyStock(honeyName, totalJars)
        if (!adjusted) {
          console.error(
            `order-paid webhook: order ${order.name} — couldn't adjust stock for "${honeyName}" (${totalJars} jars from "${line.title}")`
          )
        }
      }
    } catch (error) {
      console.error(`order-paid webhook: order ${order.name} — failed processing "${line.title}"`, error)
    }
  }

  return NextResponse.json({ ok: true })
}
