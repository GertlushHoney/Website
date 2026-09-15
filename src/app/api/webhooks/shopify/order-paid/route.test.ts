import { createHmac } from 'crypto'
import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Order-paid does real stock/booking side effects per line item — none of
// that logic is under test here, so every order used below has an empty
// line_items array unless a specific suite needs one. This isolates
// exactly what each suite cares about.
vi.mock('@/lib/sanity/processed-webhooks', () => ({
  isWebhookAlreadyProcessed: vi.fn(),
  markWebhookProcessed: vi.fn(),
}))

// buildOperationId is a pure function (no I/O) — kept real so these tests
// exercise actual id construction, not a stand-in. Only the two functions
// that touch Sanity are mocked.
vi.mock('@/lib/sanity/webhook-operations', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/sanity/webhook-operations')>()
  return {
    ...actual,
    isOperationCompleted: vi.fn(),
    markOperationCompleted: vi.fn(),
  }
})

vi.mock('@/lib/hamper', () => ({
  parseHamperJarCount: vi.fn(),
  parseHoneySelection: vi.fn(),
  CHOOSE_YOUR_OWN_VARIANT_LABEL: 'Choose your own',
  SURPRISE_VARIANT_LABEL: 'Surprise selection',
}))
vi.mock('@/lib/shopify/admin-inventory', () => ({
  deductHoneyStock: vi.fn(),
}))
vi.mock('@/lib/sanity/experience-booking', () => ({
  findExperienceSession: vi.fn(),
  incrementSessionPlacesBooked: vi.fn(),
  recordBookingConflict: vi.fn(),
}))
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

async function commonMocks() {
  const { isWebhookAlreadyProcessed, markWebhookProcessed } = await import(
    '@/lib/sanity/processed-webhooks'
  )
  const { isOperationCompleted, markOperationCompleted } = await import(
    '@/lib/sanity/webhook-operations'
  )
  vi.mocked(isWebhookAlreadyProcessed).mockResolvedValue(false)
  vi.mocked(isOperationCompleted).mockResolvedValue(false)
  return { isWebhookAlreadyProcessed, markWebhookProcessed, isOperationCompleted, markOperationCompleted }
}

describe('order-paid webhook idempotency', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    process.env.SHOPIFY_WEBHOOK_SECRET = WEBHOOK_SECRET
  })

  it('rejects a request with an invalid signature', async () => {
    const { POST } = await import('./route')
    const request = new NextRequest('https://example.com/api/webhooks/shopify/order-paid', {
      method: 'POST',
      body: JSON.stringify({ id: 1, name: '#1001', line_items: [] }),
      headers: { 'x-shopify-hmac-sha256': 'not-a-real-signature', 'x-shopify-webhook-id': 'webhook-123' },
    })
    const response = await POST(request)
    expect(response.status).toBe(401)
  })

  it('refuses a request with a valid signature but no X-Shopify-Webhook-Id header', async () => {
    const { POST } = await import('./route')
    const request = signedRequest({ id: 1, name: '#1001', line_items: [] }, { 'x-shopify-webhook-id': '' })
    const response = await POST(request)
    expect(response.status).toBe(400)
  })

  it('processes a first-time delivery and marks it processed', async () => {
    const { isWebhookAlreadyProcessed, markWebhookProcessed } = await commonMocks()
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
    const { isWebhookAlreadyProcessed, markWebhookProcessed } = await commonMocks()
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
    const { markWebhookProcessed } = await commonMocks()
    const { parseHamperJarCount, parseHoneySelection } = await import('@/lib/hamper')
    const { deductHoneyStock } = await import('@/lib/shopify/admin-inventory')
    vi.mocked(parseHamperJarCount).mockReturnValue(3)
    vi.mocked(parseHoneySelection).mockReturnValue([{ honeyName: 'Bee S3', jars: 3 }])
    vi.mocked(deductHoneyStock).mockRejectedValue(new Error('Shopify Admin API request failed: 503'))

    const { POST } = await import('./route')
    const order = {
      id: 99,
      name: '#1099',
      line_items: [
        {
          id: 1001,
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
    const { markWebhookProcessed } = await commonMocks()
    const { parseHamperJarCount } = await import('@/lib/hamper')
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
        {
          id: 1001,
          title: 'Gift Hamper (3 jars)',
          quantity: 1,
          variant_title: 'Unrecognised variant',
          properties: null,
        },
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
          id: 2001,
          title: 'Gift Hamper (3 jars)',
          quantity,
          variant_title: 'Surprise selection',
          properties: null,
        },
      ],
    }
  }

  it('deducts from the most-stocked honey that has enough for the whole order (3 jars × 2 = 6)', async () => {
    const { markWebhookProcessed } = await commonMocks()
    const { parseHamperJarCount } = await import('@/lib/hamper')
    const { deductHoneyStock } = await import('@/lib/shopify/admin-inventory')
    const { getHoneyProducts } = await import('@/lib/sanity/products')
    const { getProductByHandle } = await import('@/lib/shopify/product')

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
    expect(deductHoneyStock).toHaveBeenCalledWith('Bee S3', 6, expect.any(String))
    expect(markWebhookProcessed).toHaveBeenCalledTimes(1)
  })

  it('deducts nothing and does not force a retry when no honey has enough for the whole order', async () => {
    const { markWebhookProcessed } = await commonMocks()
    const { parseHamperJarCount } = await import('@/lib/hamper')
    const { deductHoneyStock } = await import('@/lib/shopify/admin-inventory')
    const { getHoneyProducts } = await import('@/lib/sanity/products')
    const { getProductByHandle } = await import('@/lib/shopify/product')

    vi.mocked(parseHamperJarCount).mockReturnValue(3)
    vi.mocked(getHoneyProducts).mockResolvedValue([
      { name: 'Bee S3', shopifyHandle: 'bee-s3' },
      { name: 'Bee S4', shopifyHandle: 'bee-s4' },
    ] as Awaited<ReturnType<typeof getHoneyProducts>>)
    vi.mocked(getProductByHandle).mockImplementation(async (handle: string) => {
      const quantityAvailable = handle === 'bee-s3' ? 2 : 4
      return { quantityAvailable } as Awaited<ReturnType<typeof getProductByHandle>>
    })

    const { POST } = await import('./route')
    const response = await POST(signedRequest(surpriseOrder(2)))
    const body = await response.json()

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
          id: 3001,
          product_id: 555,
          title: 'Meet the Bees Experience',
          quantity,
          variant_title: null,
          properties: [{ name: 'Session date', value: '2026-10-04' }],
        },
      ],
    }
  }

  it('books successfully and marks the webhook processed', async () => {
    const { markWebhookProcessed } = await commonMocks()
    const { findExperienceSession, incrementSessionPlacesBooked, recordBookingConflict } =
      await import('@/lib/sanity/experience-booking')
    vi.mocked(findExperienceSession).mockResolvedValue({
      docId: 'experience-doc',
      session: { _key: 'session-key', date: '2026-10-04', placesTotal: 10, placesBooked: 8 },
    })
    vi.mocked(incrementSessionPlacesBooked).mockResolvedValue({ outcome: 'booked' })

    const { POST } = await import('./route')
    const response = await POST(signedRequest(experienceOrder(2)))
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual({ ok: true })
    // Core of "TIE EXPERIENCE BOOKINGS TO THE PAID PRODUCT" (2026-09-15):
    // the route must resolve the line's real product_id (555) into the
    // same GID shape findExperienceSession expects, not just pass the
    // date through on its own.
    expect(findExperienceSession).toHaveBeenCalledWith('gid://shopify/Product/555', '2026-10-04')
    expect(incrementSessionPlacesBooked).toHaveBeenCalledWith(
      expect.any(String),
      'experience-doc',
      'session-key',
      2,
      { webhookId: 'webhook-123', orderId: 300, orderName: '#1300', lineItemId: '3001' }
    )
    expect(recordBookingConflict).not.toHaveBeenCalled()
    expect(markWebhookProcessed).toHaveBeenCalledTimes(1)
  })

  it('skips a "Session date" line with no product_id at all, rather than assuming it is safe to book', async () => {
    const { markWebhookProcessed } = await commonMocks()
    const { findExperienceSession, incrementSessionPlacesBooked } = await import(
      '@/lib/sanity/experience-booking'
    )

    const orderWithoutProductId = {
      id: 301,
      name: '#1301',
      line_items: [
        {
          id: 3002,
          product_id: null,
          title: 'Meet the Bees Experience',
          quantity: 1,
          variant_title: null,
          properties: [{ name: 'Session date', value: '2026-10-04' }],
        },
      ],
    }

    const { POST } = await import('./route')
    const response = await POST(signedRequest(orderWithoutProductId))
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual({ ok: true })
    expect(findExperienceSession).not.toHaveBeenCalled()
    expect(incrementSessionPlacesBooked).not.toHaveBeenCalled()
    expect(markWebhookProcessed).toHaveBeenCalledTimes(1)
  })

  it('records a durable conflict and still marks processed — a paid overbooking is not retryable', async () => {
    const { markWebhookProcessed } = await commonMocks()
    const { findExperienceSession, incrementSessionPlacesBooked, recordBookingConflict } =
      await import('@/lib/sanity/experience-booking')
    vi.mocked(findExperienceSession).mockResolvedValue({
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
    const { markWebhookProcessed } = await commonMocks()
    const { findExperienceSession, incrementSessionPlacesBooked, recordBookingConflict } =
      await import('@/lib/sanity/experience-booking')
    vi.mocked(findExperienceSession).mockResolvedValue({
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

  it('skips a booking already completed by an earlier attempt of this exact operation, without recording a duplicate conflict', async () => {
    const { markWebhookProcessed } = await commonMocks()
    const { findExperienceSession, incrementSessionPlacesBooked, recordBookingConflict } =
      await import('@/lib/sanity/experience-booking')
    vi.mocked(findExperienceSession).mockResolvedValue({
      docId: 'experience-doc',
      session: { _key: 'session-key', date: '2026-10-04', placesTotal: 10, placesBooked: 8 },
    })
    vi.mocked(incrementSessionPlacesBooked).mockResolvedValue({ outcome: 'alreadyCompleted' })

    const { POST } = await import('./route')
    const response = await POST(signedRequest(experienceOrder(2)))
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual({ ok: true })
    expect(recordBookingConflict).not.toHaveBeenCalled()
    expect(markWebhookProcessed).toHaveBeenCalledTimes(1)
  })
})

// The key requirement of "Make Shopify order-paid processing fully
// idempotent" (2026-09-14): no stock deduction or booking side effect may
// run twice for the same logical operation — including across a retry
// after a *partial* failure (one operation succeeded, a different one on
// the same order failed), not just an exact whole-webhook duplicate.
describe('per-operation idempotency across a partial-failure retry', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    process.env.SHOPIFY_WEBHOOK_SECRET = WEBHOOK_SECRET
  })

  function mixedOrder() {
    return {
      id: 400,
      name: '#1400',
      line_items: [
        {
          id: 4001,
          title: 'Gift Hamper (3 jars)',
          quantity: 1,
          variant_title: 'Choose your own',
          properties: [{ name: 'Honey selection', value: 'Bee S3 x3' }],
        },
        {
          id: 4002,
          product_id: 555,
          title: 'Meet the Bees Experience',
          quantity: 1,
          variant_title: null,
          properties: [{ name: 'Session date', value: '2026-10-04' }],
        },
      ],
    }
  }

  it('hamper succeeds, experience fails: retry skips the hamper deduction and only retries the experience booking', async () => {
    const { markWebhookProcessed, isOperationCompleted, markOperationCompleted } = await commonMocks()
    const { parseHamperJarCount, parseHoneySelection } = await import('@/lib/hamper')
    const { deductHoneyStock } = await import('@/lib/shopify/admin-inventory')
    const { findExperienceSession, incrementSessionPlacesBooked } = await import(
      '@/lib/sanity/experience-booking'
    )
    vi.mocked(parseHamperJarCount).mockReturnValue(3)
    vi.mocked(parseHoneySelection).mockReturnValue([{ honeyName: 'Bee S3', jars: 3 }])
    vi.mocked(deductHoneyStock).mockResolvedValue(true)
    vi.mocked(findExperienceSession).mockResolvedValue({
      docId: 'experience-doc',
      session: { _key: 'session-key', date: '2026-10-04', placesTotal: 10, placesBooked: 8 },
    })

    const { POST } = await import('./route')

    // --- First delivery: hamper succeeds, experience throws transiently.
    vi.mocked(incrementSessionPlacesBooked).mockRejectedValueOnce(
      new Error('Sanity API request failed: 503')
    )
    const firstResponse = await POST(signedRequest(mixedOrder()))
    expect(firstResponse.status).toBeGreaterThanOrEqual(500)
    expect(markWebhookProcessed).not.toHaveBeenCalled()
    expect(deductHoneyStock).toHaveBeenCalledTimes(1)
    const [, , hamperOperationId] = vi.mocked(deductHoneyStock).mock.calls[0]!
    // The hamper deduction genuinely completed — recorded so a retry
    // knows not to repeat it.
    expect(markOperationCompleted).toHaveBeenCalledWith(
      hamperOperationId,
      expect.objectContaining({ operationType: 'hamper-deduction', outcome: 'completed' })
    )

    // --- Retry (same webhook id — Shopify redelivers the identical
    // delivery, not a new one). The hamper operation now reports as
    // already completed; the experience booking succeeds this time.
    vi.mocked(isOperationCompleted).mockImplementation(async (id: string) => id === hamperOperationId)
    vi.mocked(incrementSessionPlacesBooked).mockResolvedValueOnce({ outcome: 'booked' })

    const secondResponse = await POST(signedRequest(mixedOrder()))
    const secondBody = await secondResponse.json()

    expect(secondResponse.status).toBe(200)
    expect(secondBody).toEqual({ ok: true })
    // Still only ever called once, total, across both deliveries — the
    // retry must not repeat a deduction that already succeeded.
    expect(deductHoneyStock).toHaveBeenCalledTimes(1)
    expect(incrementSessionPlacesBooked).toHaveBeenCalledTimes(2)
    expect(markWebhookProcessed).toHaveBeenCalledTimes(1)
  })

  it('experience succeeds, hamper fails: retry skips the experience booking and only retries the hamper deduction', async () => {
    const { markWebhookProcessed, isOperationCompleted } = await commonMocks()
    const { parseHamperJarCount, parseHoneySelection } = await import('@/lib/hamper')
    const { deductHoneyStock } = await import('@/lib/shopify/admin-inventory')
    const { findExperienceSession, incrementSessionPlacesBooked } = await import(
      '@/lib/sanity/experience-booking'
    )
    vi.mocked(parseHamperJarCount).mockReturnValue(3)
    vi.mocked(parseHoneySelection).mockReturnValue([{ honeyName: 'Bee S3', jars: 3 }])
    vi.mocked(findExperienceSession).mockResolvedValue({
      docId: 'experience-doc',
      session: { _key: 'session-key', date: '2026-10-04', placesTotal: 10, placesBooked: 8 },
    })
    vi.mocked(incrementSessionPlacesBooked).mockResolvedValue({ outcome: 'booked' })

    const { POST } = await import('./route')

    // --- First delivery: experience succeeds, hamper deduction throws.
    vi.mocked(deductHoneyStock).mockRejectedValueOnce(new Error('Shopify Admin API request failed: 503'))
    const firstResponse = await POST(signedRequest(mixedOrder()))
    expect(firstResponse.status).toBeGreaterThanOrEqual(500)
    expect(markWebhookProcessed).not.toHaveBeenCalled()
    expect(incrementSessionPlacesBooked).toHaveBeenCalledTimes(1)

    // --- Retry: the experience booking now reports alreadyCompleted; the
    // hamper deduction is attempted again and succeeds this time.
    vi.mocked(incrementSessionPlacesBooked).mockResolvedValueOnce({ outcome: 'alreadyCompleted' })
    vi.mocked(deductHoneyStock).mockResolvedValueOnce(true)
    // isOperationCompleted (the hamper-side pre-check) still reports false
    // — this exact operation genuinely never completed last time.
    vi.mocked(isOperationCompleted).mockResolvedValue(false)

    const secondResponse = await POST(signedRequest(mixedOrder()))
    const secondBody = await secondResponse.json()

    expect(secondResponse.status).toBe(200)
    expect(secondBody).toEqual({ ok: true })
    expect(deductHoneyStock).toHaveBeenCalledTimes(2) // 1 failed attempt + 1 that succeeded
    // Still only ever booked once, total, across both deliveries.
    expect(incrementSessionPlacesBooked).toHaveBeenCalledTimes(2)
    expect(markWebhookProcessed).toHaveBeenCalledTimes(1)
  })

  // Two copies of the same webhook arriving at almost the same time. At
  // this layer (deductHoneyStock is mocked, not real Shopify), the
  // meaningful assertion is that both concurrent calls resolve to the
  // *identical* deterministic idempotency key — that's what actually
  // prevents a double deduction at Shopify's end even if this app's own
  // local pre-check happened to race (see admin-inventory.ts). The atomic
  // (transaction-based) guarantee for the experience-booking side of this
  // is covered directly in experience-booking.test.ts.
  it('two concurrent deliveries of the same webhook use the identical idempotency key for the same hamper operation', async () => {
    await commonMocks()
    const { parseHamperJarCount, parseHoneySelection } = await import('@/lib/hamper')
    const { deductHoneyStock } = await import('@/lib/shopify/admin-inventory')
    vi.mocked(parseHamperJarCount).mockReturnValue(3)
    vi.mocked(parseHoneySelection).mockReturnValue([{ honeyName: 'Bee S3', jars: 3 }])
    vi.mocked(deductHoneyStock).mockResolvedValue(true)

    const { POST } = await import('./route')
    const order = {
      id: 500,
      name: '#1500',
      line_items: [
        {
          id: 5001,
          title: 'Gift Hamper (3 jars)',
          quantity: 1,
          variant_title: 'Choose your own',
          properties: [{ name: 'Honey selection', value: 'Bee S3 x3' }],
        },
      ],
    }

    const [first, second] = await Promise.all([
      POST(signedRequest(order)),
      POST(signedRequest(order)),
    ])

    expect(first.status).toBe(200)
    expect(second.status).toBe(200)
    expect(deductHoneyStock).toHaveBeenCalledTimes(2)
    const keys = vi.mocked(deductHoneyStock).mock.calls.map(([, , key]) => key)
    expect(keys[0]).toBe(keys[1])
    expect(keys[0]).toMatch(/^webhookOp\./)
  })
})
