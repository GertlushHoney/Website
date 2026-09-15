import { beforeEach, describe, expect, it, vi } from 'vitest'

// incrementSessionPlacesBooked is the core fix for "REVIEW EXPERIENCE
// OVERBOOKING" (2026-09-13) — a fresh read-check-write on every attempt,
// guarded by Sanity's own optimistic-concurrency primitive (ifRevisionId)
// — extended in "Make Shopify order-paid processing fully idempotent"
// (2026-09-14) so the *same* booking operation (by its deterministic
// operationId) can never be counted twice, even across a redelivered
// webhook or two near-simultaneous duplicate deliveries. This fake client
// models both: a `markers` map simulating Sanity's real behaviour that a
// `create()` with an existing `_id` fails atomically together with any
// other mutation in the same transaction, and the existing `_rev`-based
// conflict simulation for the session document itself.

type FakeDoc = { _rev: string; placesTotal: number; placesBooked: number }

function conflictError(message: string) {
  const error = new Error(message) as Error & { statusCode: number }
  error.statusCode = 409
  return error
}

function buildFakeClient(
  doc: FakeDoc,
  options: { failCommitsUntilRev?: string; existingMarkerIds?: Set<string> } = {}
) {
  const markers = options.existingMarkerIds ?? new Set<string>()

  const fetch = vi.fn(async () => ({
    _rev: doc._rev,
    session: { placesTotal: doc.placesTotal, placesBooked: doc.placesBooked },
  }))

  const getDocument = vi.fn(async (id: string) => (markers.has(id) ? { _id: id } : null))

  const createIfNotExists = vi.fn(async (newDoc: { _id: string }) => {
    markers.add(newDoc._id)
    return newDoc
  })

  // A real Sanity transaction is atomic: if the `create()` conflicts
  // (marker _id already exists) or the `patch()` conflicts (stale
  // revision), the *whole* commit fails and neither mutation applies —
  // modelled here by only mutating `doc`/`markers` once every queued
  // mutation has been checked.
  function transaction() {
    let createDoc: { _id: string } | null = null
    let patchDocId: string | null = null
    let patchRev: string | null = null
    let patchInc: Record<string, number> | null = null

    const builder = {
      create(newDoc: { _id: string }) {
        createDoc = newDoc
        return builder
      },
      patch(docId: string, patchFn: (p: unknown) => unknown) {
        patchDocId = docId
        const patchBuilder = {
          ifRevisionId(rev: string) {
            patchRev = rev
            return patchBuilder
          },
          inc(fields: Record<string, number>) {
            patchInc = fields
            return patchBuilder
          },
        }
        patchFn(patchBuilder)
        return builder
      },
      async commit() {
        if (createDoc && markers.has(createDoc._id)) {
          throw conflictError(`Document with the id "${createDoc._id}" already exists`)
        }
        if (options.failCommitsUntilRev && patchRev !== options.failCommitsUntilRev) {
          throw conflictError('The document has been changed by another client')
        }
        if (createDoc) markers.add(createDoc._id)
        if (patchDocId && patchInc) {
          const amount = Object.values(patchInc)[0] ?? 0
          doc.placesBooked += amount
          doc._rev = `${doc._rev}-next`
        }
        return {}
      },
    }
    return builder
  }

  return { fetch, getDocument, createIfNotExists, transaction }
}

vi.mock('@/lib/sanity/write-client', () => ({
  isSanityWriteConfigured: vi.fn(() => true),
  getSanityWriteClient: vi.fn(),
}))
vi.mock('@/lib/sanity/client', () => ({
  sanityFetch: vi.fn(),
}))
vi.mock('@/lib/shopify/product', () => ({
  getProductByHandle: vi.fn(),
}))

const META = { webhookId: 'webhook-1', orderId: 1, orderName: '#1001', lineItemId: '10' }

describe('incrementSessionPlacesBooked', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  it('books successfully when there is enough capacity', async () => {
    const { getSanityWriteClient } = await import('@/lib/sanity/write-client')
    const client = buildFakeClient({ _rev: 'rev-1', placesTotal: 10, placesBooked: 8 })
    vi.mocked(getSanityWriteClient).mockReturnValue(client as never)

    const { incrementSessionPlacesBooked } = await import('./experience-booking')
    const result = await incrementSessionPlacesBooked('op-1', 'doc-1', 'session-1', 2, META)

    expect(result).toEqual({ outcome: 'booked' })
    expect(client.getDocument).toHaveBeenCalledWith('op-1')
  })

  it('refuses without ever attempting a write when the request exceeds what is actually left (3 jars × 2 = 6, only 4 remain)', async () => {
    const { getSanityWriteClient } = await import('@/lib/sanity/write-client')
    // placesTotal 10, placesBooked 6 → 4 remaining, but 6 requested.
    const client = buildFakeClient({ _rev: 'rev-1', placesTotal: 10, placesBooked: 6 })
    vi.mocked(getSanityWriteClient).mockReturnValue(client as never)

    const { incrementSessionPlacesBooked } = await import('./experience-booking')
    const result = await incrementSessionPlacesBooked('op-1', 'doc-1', 'session-1', 6, META)

    expect(result).toEqual({ outcome: 'insufficient_capacity', placesRequested: 6, placesRemaining: 4 })
    // A terminal outcome for this exact operationId is still recorded —
    // so a redelivered webhook doesn't re-detect (and re-record) the
    // identical conflict every time.
    expect(client.createIfNotExists).toHaveBeenCalledWith(
      expect.objectContaining({ _id: 'op-1', outcome: 'insufficient-capacity' })
    )
  })

  it('retries after a revision conflict and succeeds once it re-reads fresh data that still has room', async () => {
    const { getSanityWriteClient } = await import('@/lib/sanity/write-client')
    // The first commit attempt (against rev-1) is rejected as a conflict,
    // simulating another booking having won the race in between; only a
    // commit against the *next* revision succeeds.
    const client = buildFakeClient(
      { _rev: 'rev-1', placesTotal: 10, placesBooked: 9 },
      { failCommitsUntilRev: 'rev-1-next' }
    )
    // After the first (failed) attempt, the underlying doc must reflect
    // what actually happened — simulate the concurrent booking landing.
    let reads = 0
    client.fetch.mockImplementation(async () => {
      reads += 1
      if (reads === 1) return { _rev: 'rev-1', session: { placesTotal: 10, placesBooked: 9 } }
      // Someone else's booking committed between our two reads.
      return { _rev: 'rev-1-next', session: { placesTotal: 10, placesBooked: 9 } }
    })
    vi.mocked(getSanityWriteClient).mockReturnValue(client as never)

    const { incrementSessionPlacesBooked } = await import('./experience-booking')
    const result = await incrementSessionPlacesBooked('op-1', 'doc-1', 'session-1', 1, META)

    expect(result).toEqual({ outcome: 'booked' })
    expect(client.fetch).toHaveBeenCalledTimes(2)
  })

  it('throws (never silently gives up) once retries are exhausted under sustained conflict', async () => {
    const { getSanityWriteClient } = await import('@/lib/sanity/write-client')
    // Every single commit attempt is rejected as a conflict, and the fake
    // re-read always returns the same revision — sustained contention that
    // never resolves within the retry budget.
    const client = buildFakeClient(
      { _rev: 'rev-1', placesTotal: 10, placesBooked: 5 },
      { failCommitsUntilRev: 'this-revision-never-matches' }
    )
    vi.mocked(getSanityWriteClient).mockReturnValue(client as never)

    const { incrementSessionPlacesBooked } = await import('./experience-booking')
    await expect(incrementSessionPlacesBooked('op-1', 'doc-1', 'session-1', 1, META)).rejects.toThrow(
      /exhausted/i
    )
  })

  it('propagates a genuine (non-conflict) error immediately, without retrying', async () => {
    const { getSanityWriteClient } = await import('@/lib/sanity/write-client')
    const client = buildFakeClient({ _rev: 'rev-1', placesTotal: 10, placesBooked: 5 })
    // A self-contained builder (every method returns itself) so chaining
    // still works, but commit always throws a genuine, non-conflict error
    // — unlike the shared buildFakeClient builder, which only fails commit
    // in the ways the other tests above need to simulate.
    client.transaction = vi.fn(() => {
      const builder = {
        create: () => builder,
        patch: () => builder,
        commit: async () => {
          throw new Error('network error')
        },
      }
      return builder
    })
    vi.mocked(getSanityWriteClient).mockReturnValue(client as never)

    const { incrementSessionPlacesBooked } = await import('./experience-booking')
    await expect(incrementSessionPlacesBooked('op-1', 'doc-1', 'session-1', 1, META)).rejects.toThrow(
      'network error'
    )
    expect(client.fetch).toHaveBeenCalledTimes(1) // no retry for a non-conflict error
  })

  // The key correctness requirement for "Make Shopify order-paid
  // processing fully idempotent": no booking side effect may run twice
  // for the same logical operation.
  describe('idempotency', () => {
    it('skips immediately, with no read or write of the session at all, when this exact operation already completed', async () => {
      const { getSanityWriteClient } = await import('@/lib/sanity/write-client')
      const client = buildFakeClient(
        { _rev: 'rev-1', placesTotal: 10, placesBooked: 8 },
        { existingMarkerIds: new Set(['op-1']) }
      )
      vi.mocked(getSanityWriteClient).mockReturnValue(client as never)

      const { incrementSessionPlacesBooked } = await import('./experience-booking')
      const result = await incrementSessionPlacesBooked('op-1', 'doc-1', 'session-1', 2, META)

      expect(result).toEqual({ outcome: 'alreadyCompleted' })
      expect(client.fetch).not.toHaveBeenCalled()
    })

    it('applies the increment only once when the same operation is attempted twice in sequence (redelivered webhook)', async () => {
      const { getSanityWriteClient } = await import('@/lib/sanity/write-client')
      const client = buildFakeClient({ _rev: 'rev-1', placesTotal: 10, placesBooked: 8 })
      vi.mocked(getSanityWriteClient).mockReturnValue(client as never)

      const { incrementSessionPlacesBooked } = await import('./experience-booking')
      const first = await incrementSessionPlacesBooked('op-1', 'doc-1', 'session-1', 2, META)
      const second = await incrementSessionPlacesBooked('op-1', 'doc-1', 'session-1', 2, META)

      expect(first).toEqual({ outcome: 'booked' })
      expect(second).toEqual({ outcome: 'alreadyCompleted' })
    })

    // Two copies of the same webhook arriving at almost the same time —
    // both pass any "check first" gate before either has written a
    // marker, so the real guarantee has to come from the atomic
    // create-conflicts-on-existing-id behaviour of the transaction commit
    // itself, not from ordering.
    it('applies the increment only once when two concurrent deliveries race for the same operation', async () => {
      const { getSanityWriteClient } = await import('@/lib/sanity/write-client')
      const sharedDoc = { _rev: 'rev-1', placesTotal: 10, placesBooked: 8 }
      const client = buildFakeClient(sharedDoc)
      vi.mocked(getSanityWriteClient).mockReturnValue(client as never)

      const { incrementSessionPlacesBooked } = await import('./experience-booking')
      const [a, b] = await Promise.all([
        incrementSessionPlacesBooked('op-1', 'doc-1', 'session-1', 1, META),
        incrementSessionPlacesBooked('op-1', 'doc-1', 'session-1', 1, META),
      ])

      const outcomes = [a.outcome, b.outcome].sort()
      expect(outcomes).toEqual(['alreadyCompleted', 'booked'])
      // Exactly one place booked — not two, no matter which request "won"
      // the race to commit first.
      expect(sharedDoc.placesBooked).toBe(9)
    })
  })
})

// Core fix for "TIE EXPERIENCE BOOKINGS TO THE PAID PRODUCT" (2026-09-15):
// a "Session date" cart property is customer-settable, so matching by
// date alone would let someone attach experience B's session date onto a
// line item for experience A (or any other product) and get credited
// against a session they never actually paid for. findExperienceSession
// must confirm the resolved candidate's own Shopify product actually
// matches what was paid for, never fall back to a date-only match.
describe('findExperienceSession', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  function sessionOn(date: string) {
    return { _key: `session-${date}`, date, placesTotal: 10, placesBooked: 0 }
  }

  it('returns null when no experience has a session on that date at all', async () => {
    const { sanityFetch } = await import('@/lib/sanity/client')
    vi.mocked(sanityFetch).mockResolvedValue([])

    const { findExperienceSession } = await import('./experience-booking')
    const result = await findExperienceSession('gid://shopify/Product/1', '2026-11-01')

    expect(result).toBeNull()
  })

  it('matches when exactly one experience has that date and its real Shopify product is what was paid for', async () => {
    const { sanityFetch } = await import('@/lib/sanity/client')
    const { getProductByHandle } = await import('@/lib/shopify/product')
    vi.mocked(sanityFetch).mockResolvedValue([
      { _id: 'experience-a', shopifyHandle: 'bee-day-experience', sessions: [sessionOn('2026-11-01')] },
    ])
    vi.mocked(getProductByHandle).mockResolvedValue({
      productId: 'gid://shopify/Product/1',
    } as never)

    const { findExperienceSession } = await import('./experience-booking')
    const result = await findExperienceSession('gid://shopify/Product/1', '2026-11-01')

    expect(result).toEqual({ docId: 'experience-a', session: sessionOn('2026-11-01') })
  })

  // The actual exploit this closes: a customer pays for experience A (or
  // any unrelated product) but attaches experience B's session date as a
  // cart line-item property. A date match exists (experience B genuinely
  // has a session that day), but it must never be honoured, because the
  // product actually paid for doesn't match.
  it('rejects a date match against a product that was not actually paid for', async () => {
    const { sanityFetch } = await import('@/lib/sanity/client')
    const { getProductByHandle } = await import('@/lib/shopify/product')
    vi.mocked(sanityFetch).mockResolvedValue([
      { _id: 'experience-b', shopifyHandle: 'meet-the-bees', sessions: [sessionOn('2026-11-01')] },
    ])
    // The paid line item's product resolves to a different Shopify id
    // than experience B's.
    vi.mocked(getProductByHandle).mockResolvedValue({
      productId: 'gid://shopify/Product/999-not-what-was-paid-for',
    } as never)

    const { findExperienceSession } = await import('./experience-booking')
    const result = await findExperienceSession('gid://shopify/Product/1', '2026-11-01')

    expect(result).toBeNull()
  })

  // The literal scenario the previous date-only matching couldn't handle:
  // two active experiences sharing a session date. Must resolve to the
  // one the customer actually paid for, not whichever Sanity happens to
  // return first.
  it('disambiguates two experiences sharing the same session date by which was actually paid for', async () => {
    const { sanityFetch } = await import('@/lib/sanity/client')
    const { getProductByHandle } = await import('@/lib/shopify/product')
    vi.mocked(sanityFetch).mockResolvedValue([
      { _id: 'experience-a', shopifyHandle: 'bee-day-experience', sessions: [sessionOn('2026-11-01')] },
      { _id: 'experience-b', shopifyHandle: 'meet-the-bees', sessions: [sessionOn('2026-11-01')] },
    ])
    vi.mocked(getProductByHandle).mockImplementation(async (handle: string) =>
      ({
        'bee-day-experience': { productId: 'gid://shopify/Product/1' },
        'meet-the-bees': { productId: 'gid://shopify/Product/2' },
      })[handle] as never
    )

    const { findExperienceSession } = await import('./experience-booking')

    expect(await findExperienceSession('gid://shopify/Product/2', '2026-11-01')).toEqual({
      docId: 'experience-b',
      session: sessionOn('2026-11-01'),
    })
    expect(await findExperienceSession('gid://shopify/Product/1', '2026-11-01')).toEqual({
      docId: 'experience-a',
      session: sessionOn('2026-11-01'),
    })
  })

  it('returns null (never a false match) if the Shopify lookup itself comes back empty', async () => {
    const { sanityFetch } = await import('@/lib/sanity/client')
    const { getProductByHandle } = await import('@/lib/shopify/product')
    vi.mocked(sanityFetch).mockResolvedValue([
      { _id: 'experience-a', shopifyHandle: 'bee-day-experience', sessions: [sessionOn('2026-11-01')] },
    ])
    vi.mocked(getProductByHandle).mockResolvedValue(null)

    const { findExperienceSession } = await import('./experience-booking')
    const result = await findExperienceSession('gid://shopify/Product/1', '2026-11-01')

    expect(result).toBeNull()
  })
})
