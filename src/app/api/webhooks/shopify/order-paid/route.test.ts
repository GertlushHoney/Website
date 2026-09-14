import { createHmac } from 'crypto'
import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Order-paid does real stock/booking side effects per line item — none of
// that logic is under test here, so every order used below has an empty
// line_items array. This isolates exactly what this suite cares about: the
// idempotency gate (X-Shopify-Webhook-Id header + processed-webhook check)
// added in the "FIX SHOPIFY WEBHOOK IDEMPOTENCY" audit, 2026-09-13.
vi.mock('@/lib/sanity/processed-webhooks', () => ({
  isWebhookAlreadyProcessed: vi.fn(),
  markWebhookProcessed: vi.fn(),
}))

// Only used by the "retry behaviour" suite below, to force a line item
// down the hamper/stock-deduction path without needing a real honey
// selection to parse.
vi.mock('@/lib/hamper', () => ({
  parseHamperJarCount: vi.fn(),
  parseHoneySelection: vi.fn(),
  CHOOSE_YOUR_OWN_VARIANT_LABEL: 'Choose your own',
  SURPRISE_VARIANT_LABEL: 'Surprise selection',
}))
vi.mock('@/lib/shopify/admin-inventory', () => ({
  deductHoneyStock: vi.fn(),
}))

// Only used by the "experience booking concurrency" suite below.
vi.mock('@/lib/sanity/experience-booking', () => ({
  findExperienceSessionByDate: vi.fn(),
  incrementSessionPlacesBooked: vi.fn(),
  recordBookingConflict: vi.fn(),
}))

// Only used by the "surprise hamper stock validation" suite below.
vi.mock('@/lib/sanity/products', () => ({
  getHoneyProducts: vi.fn(),
}))
vi.mock('@/lib/shopify/product', () => ({
  getProductByHandle: vi.fn(),
}))

const WEBHOOK_SECRET = 'test-webhook-secret'

function signedRequest(body: unknown, headers: Record<string, string> = {}) {
  const rawBody = JSON.stringify(body)
  const signature = createHmac('sha256', WEBHOOK_SECRET).update(rawBody, 'utf8').digest('base64')
  return new NextRequest('https://example.com/api/webhooks/shopify/order-paid', {
    method: 'POST',
    body: rawBody,
    headers: {
      'x-shopify-hmac-sha256': signature,
      'x-shopify-webhook-id': 'webhook-123',
      ...headers,
    },
  })
}

describe('order-paid webhook idempotency', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    process.env.SHOPIFY_WEBHOOK_SECRET = WEBHOOK_SECRET
  })

  it('refuses a request with a valid signature but no X-Shopify-Webhook-Id header', async () => {
    const { POST } = await import('./route')
    const request = signedRequest({ id: 1, name: '#1001', line_items: [] }, { 'x-shopify-webhook-id': '' })
    const response = await POST(request)
    expect(response.status).toBe(400)
  })

  it('processes a first-time delivery and marks it processed', async () => {
    const { isWebhookAlreadyProcessed, markWebhookProcessed } = await import(
      '@/lib/sanity/processed-webhooks'
    )
    vi.mocked(isWebhookAlreadyProcessed).mockResolvedValue(false)

    const { POST } = await import('./route')
    const order = { id: 42, name: '#1042', line_items: [] }
    const response = await POST(signedRequest(order))
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual({ ok: true })
    expect(isWebhookAlreadyProcessed).toHaveBeenCalledWith('webhook-123')
    expect(markWebhookProcessed).toHaveBeenCalledWith('webhook-123', {
      topic: 'orders/paid',
      orderId: 42,
      orderName: '#1042',
    })
  })

  it('skips processing entirely on a redelivered webhook and never marks it again', async () => {
    const { isWebhookAlreadyProcessed, markWebhookProcessed } = await import(
      '@/lib/sanity/processed-webhooks'
    )
    vi.mocked(isWebhookAlreadyProcessed).mockResolvedValue(true)

    const { POST } = await import('./route')
    const order = { id: 42, name: '#1042', line_items: [] }
    const response = await POST(signedRequest(order))
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual({ ok: true, duplicate: true })
    expect(markWebhookProcessed).not.toHaveBeenCalled()
  })
})

describe('order-paid webhook retry behaviour', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    process.env.SHOPIFY_WEBHOOK_SECRET = WEBHOOK_SECRET
  })

  it('returns 400 for a well-formed JSON payload missing required order fields', async () => {
    const { POST } = await import('./route')
    const response = await POST(signedRequest({ line_items: [] }))
    expect(response.status).toBe(400)
  })

  it('returns a non-2xx and does not mark processed when a downstream call throws', async () => {
    const { isWebhookAlreadyProcessed, markWebhookProcessed } = await import(
      '@/lib/sanity/processed-webhooks'
    )
    const { parseHamperJarCount, parseHoneySelection } = await import('@/lib/hamper')
    const { deductHoneyStock } = await import('@/lib/shopify/admin-inventory')
    vi.mocked(isWebhookAlreadyProcessed).mockResolvedValue(false)
    vi.mocked(parseHamperJarCount).mockReturnValue(3)
    vi.mocked(parseHoneySelection).mockReturnValue([{ honeyName: 'Bee S3', jars: 3 }])
    vi.mocked(deductHoneyStock).mockRejectedValue(new Error('Shopify Admin API request failed: 503'))

    const { POST } = await import('./route')
    const order = {
      id: 99,
      name: '#1099',
      line_items: [
        {
          title: 'Gift Hamper (3 jars)',
          quantity: 1,
          variant_title: 'Choose your own',
          properties: [{ name: 'Honey selection', value: 'Bee S3 x3' }],
        },
      ],
    }
    const response = await POST(signedRequest(order))

    expect(response.status).toBeGreaterThanOrEqual(500)
    expect(response.status).toBeLessThan(600)
    expect(markWebhookProcessed).not.toHaveBeenCalled()
  })

  it('still returns 2xx and marks processed when a line item fails for a non-transient (data) reason', async () => {
    const { isWebhookAlreadyProcessed, markWebhookProcessed } = await import(
      '@/lib/sanity/processed-webhooks'
    )
    const { parseHamperJarCount } = await import('@/lib/hamper')
    vi.mocked(isWebhookAlreadyProcessed).mockResolvedValue(false)
    // No honey selection resolves (variant_title matches neither the
    // "Surprise selection" nor "Choose your own" branch) — a data problem
    // that would fail identically on every retry, so it must not block the
    // rest of the order or force a retry the way a thrown error does.
    vi.mocked(parseHamperJarCount).mockReturnValue(3)

    const { POST } = await import('./route')
    const order = {
      id: 100,
      name: '#1100',
      line_items: [
        { title: 'Gift Hamper (3 jars)', quantity: 1, variant_title: 'Unrecognised variant', properties: null },
      ],
    }
    const response = await POST(signedRequest(order))
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual({ ok: true })
    expect(markWebhookProcessed).toHaveBeenCalledTimes(1)
  })
})

describe('surprise hamper stock validation', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    process.env.SHOPIFY_WEBHOOK_SECRET = WEBHOOK_SECRET
  })

  function surpriseOrder(quantity: number) {
    return {
      id: 200,
      name: '#1200',
      line_items: [
        {
          title: 'Gift Hamper (3 jars)',
          quantity,
          variant_title: 'Surprise selection',
          properties: null,
        },
      ],
    }
  }

  it('deducts from the most-stocked honey that has enough for the whole order (3 jars × 2 = 6)', async () => {
    const { isWebhookAlreadyProcessed, markWebhookProcessed } = await import(
      '@/lib/sanity/processed-webhooks'
    )
    const { parseHamperJarCount } = await import('@/lib/hamper')
    const { deductHoneyStock } = await import('@/lib/shopify/admin-inventory')
    const { getHoneyProducts } = await import('@/lib/sanity/products')
    const { getProductByHandle } = await import('@/lib/shopify/product')

    vi.mocked(isWebhookAlreadyProcessed).mockResolvedValue(false)
    vi.mocked(parseHamperJarCount).mockReturnValue(3)
    vi.mocked(deductHoneyStock).mockResolvedValue(true)
    vi.mocked(getHoneyProducts).mockResolvedValue([
      { name: 'Bee S3', shopifyHandle: 'bee-s3' },
      { name: 'Bee S4', shopifyHandle: 'bee-s4' },
    ] as Awaited<ReturnType<typeof getHoneyProducts>>)
    // Bee S4 has the most stock overall (10), but only 4 — not enough for
    // this order's 6 required jars. Bee S3 has fewer in total (8) but
    // still clears 6, so it's the one that must actually get picked.
    vi.mocked(getProductByHandle).mockImplementation(async (handle: string) => {
      const quantityAvailable = handle === 'bee-s3' ? 8 : 4
      return { quantityAvailable } as Awaited<ReturnType<typeof getProductByHandle>>
    })

    const { POST } = await import('./route')
    const response = await POST(signedRequest(surpriseOrder(2)))
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual({ ok: true })
    expect(deductHoneyStock).toHaveBeenCalledWith('Bee S3', 6)
    expect(markWebhookProcessed).toHaveBeenCalledTimes(1)
  })

  it('deducts nothing and does not force a retry when no honey has enough for the whole order', async () => {
    const { isWebhookAlreadyProcessed, markWebhookProcessed } = await import(
      '@/lib/sanity/processed-webhooks'
    )
    const { parseHamperJarCount } = await import('@/lib/hamper')
    const { deductHoneyStock } = await import('@/lib/shopify/admin-inventory')
    const { getHoneyProducts } = await import('@/lib/sanity/products')
    const { getProductByHandle } = await import('@/lib/shopify/product')

    vi.mocked(isWebhookAlreadyProcessed).mockResolvedValue(false)
    vi.mocked(parseHamperJarCount).mockReturnValue(3)
    vi.mocked(getHoneyProducts).mockResolvedValue([
      { name: 'Bee S3', shopifyHandle: 'bee-s3' },
      { name: 'Bee S4', shopifyHandle: 'bee-s4' },
    ] as Awaited<ReturnType<typeof getHoneyProducts>>)
    // Highest-stocked honey (Bee S4, 4) still falls short of the 6 jars
    // this order (3-jar hamper × quantity 2) actually needs — per the
    // "FIX SURPRISE HAMPER STOCK VALIDATION" example, it must not be
    // selected, and nothing should be deducted from it or anything else.
    vi.mocked(getProductByHandle).mockImplementation(async (handle: string) => {
      const quantityAvailable = handle === 'bee-s3' ? 2 : 4
      return { quantityAvailable } as Awaited<ReturnType<typeof getProductByHandle>>
    })

    const { POST } = await import('./route')
    const response = await POST(signedRequest(surpriseOrder(2)))
    const body = await response.json()

    // A data problem (no honey qualifies), not a transient one — retrying
    // the identical order would resolve the same way every time, so this
    // is still a 2xx/marked-processed outcome, same as the "unrecognised
    // variant" case above, and deductHoneyStock must never be called with
    // an insufficient honey.
    expect(response.status).toBe(200)
    expect(body).toEqual({ ok: true })
    expect(deductHoneyStock).not.toHaveBeenCalled()
    expect(markWebhookProcessed).toHaveBeenCalledTimes(1)
  })
})

describe('experience booking concurrency', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    process.env.SHOPIFY_WEBHOOK_SECRET = WEBHOOK_SECRET
  })

  function experienceOrder(quantity: number) {
    return {
      id: 300,
      name: '#1300',
      line_items: [
        {
          title: 'Meet the Bees Experience',
          quantity,
          variant_title: null,
          properties: [{ name: 'Session date', value: '2026-10-04' }],
        },
      ],
    }
  }

  it('books successfully and marks the webhook processed', async () => {
    const { isWebhookAlreadyProcessed, markWebhookProcessed } = await import(
      '@/lib/sanity/processed-webhooks'
    )
    const { findExperienceSessionByDate, incrementSessionPlacesBooked, recordBookingConflict } =
      await import('@/lib/sanity/experience-booking')
    vi.mocked(isWebhookAlreadyProcessed).mockResolvedValue(false)
    vi.mocked(findExperienceSessionByDate).mockResolvedValue({
      docId: 'experience-doc',
      session: { _key: 'session-key', date: '2026-10-04', placesTotal: 10, placesBooked: 8 },
    })
    vi.mocked(incrementSessionPlacesBooked).mockResolvedValue({ outcome: 'booked' })

    const { POST } = await import('./route')
    const response = await POST(signedRequest(experienceOrder(2)))
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual({ ok: true })
    expect(incrementSessionPlacesBooked).toHaveBeenCalledWith('experience-doc', 'session-key', 2)
    expect(recordBookingConflict).not.toHaveBeenCalled()
    expect(markWebhookProcessed).toHaveBeenCalledTimes(1)
  })

  it('records a durable conflict and still marks processed — a paid overbooking is not retryable', async () => {
    const { isWebhookAlreadyProcessed, markWebhookProcessed } = await import(
      '@/lib/sanity/processed-webhooks'
    )
    const { findExperienceSessionByDate, incrementSessionPlacesBooked, recordBookingConflict } =
      await import('@/lib/sanity/experience-booking')
    vi.mocked(isWebhookAlreadyProcessed).mockResolvedValue(false)
    vi.mocked(findExperienceSessionByDate).mockResolvedValue({
      docId: 'experience-doc',
      session: { _key: 'session-key', date: '2026-10-04', placesTotal: 10, placesBooked: 10 },
    })
    // Another order won the race for the same place(s) first.
    vi.mocked(incrementSessionPlacesBooked).mockResolvedValue({
      outcome: 'insufficient_capacity',
      placesRequested: 2,
      placesRemaining: 0,
    })

    const { POST } = await import('./route')
    const response = await POST(signedRequest(experienceOrder(2)))
    const body = await response.json()

    // Not a transient failure — the customer already paid, and retrying
    // this webhook later would find the same shortfall every time. It
    // must still be 2xx/marked processed, with the conflict recorded for
    // a human to act on instead of forcing a pointless Shopify retry loop.
    expect(response.status).toBe(200)
    expect(body).toEqual({ ok: true })
    expect(recordBookingConflict).toHaveBeenCalledWith({
      orderId: 300,
      orderName: '#1300',
      productTitle: 'Meet the Bees Experience',
      sessionDate: '2026-10-04',
      placesRequested: 2,
      placesRemaining: 0,
    })
    expect(markWebhookProcessed).toHaveBeenCalledTimes(1)
  })

  it('treats a thrown error (e.g. retries exhausted under contention) as transient and does not mark processed', async () => {
    const { isWebhookAlreadyProcessed, markWebhookProcessed } = await import(
      '@/lib/sanity/processed-webhooks'
    )
    const { findExperienceSessionByDate, incrementSessionPlacesBooked, recordBookingConflict } =
      await import('@/lib/sanity/experience-booking')
    vi.mocked(isWebhookAlreadyProcessed).mockResolvedValue(false)
    vi.mocked(findExperienceSessionByDate).mockResolvedValue({
      docId: 'experience-doc',
      session: { _key: 'session-key', date: '2026-10-04', placesTotal: 10, placesBooked: 8 },
    })
    vi.mocked(incrementSessionPlacesBooked).mockRejectedValue(
      new Error('incrementSessionPlacesBooked: exhausted 5 attempts for session session-key under contention')
    )

    const { POST } = await import('./route')
    const response = await POST(signedRequest(experienceOrder(2)))

    expect(response.status).toBeGreaterThanOrEqual(500)
    expect(response.status).toBeLessThan(600)
    expect(recordBookingConflict).not.toHaveBeenCalled()
    expect(markWebhookProcessed).not.toHaveBeenCalled()
  })
})
