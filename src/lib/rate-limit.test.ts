import { beforeEach, describe, expect, it, vi } from 'vitest'

// Core mechanism test for "ADD PUBLIC FORM RATE LIMITING" (2026-09-15).
// Fakes just enough of the Sanity write client to model its real,
// relevant behaviour: createIfNotExists is a genuine no-op on a doc that
// already exists (never resets an in-progress window's count back to 0),
// and patch().inc().commit() atomically increments and returns the
// document — real Sanity guarantees both, and the whole "one document id
// per window" design in rate-limit.ts depends on it.
function buildFakeWriteClient() {
  const docs = new Map<string, { count: number }>()

  const createIfNotExists = vi.fn(async (doc: { _id: string; count: number }) => {
    if (!docs.has(doc._id)) docs.set(doc._id, { count: doc.count })
    return docs.get(doc._id)
  })

  function patch(id: string) {
    return {
      inc: (fields: { count: number }) => ({
        commit: async () => {
          const doc = docs.get(id)
          if (!doc) throw new Error(`patch on missing doc ${id}`)
          doc.count += fields.count
          return doc
        },
      }),
    }
  }

  return { createIfNotExists, patch: vi.fn(patch), docs }
}

vi.mock('@/lib/sanity/write-client', () => ({
  isSanityWriteConfigured: vi.fn(() => true),
  getSanityWriteClient: vi.fn(),
}))
vi.mock('next/headers', () => ({
  headers: vi.fn(),
}))

describe('getClientIp', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  it('reads the first address out of x-forwarded-for', async () => {
    const { headers } = await import('next/headers')
    vi.mocked(headers).mockResolvedValue(
      new Headers({ 'x-forwarded-for': '203.0.113.4, 10.0.0.1' }) as never
    )
    const { getClientIp } = await import('./rate-limit')
    expect(await getClientIp()).toBe('203.0.113.4')
  })

  it('falls back to x-real-ip, then a fixed placeholder', async () => {
    const { headers } = await import('next/headers')
    const { getClientIp } = await import('./rate-limit')

    vi.mocked(headers).mockResolvedValue(new Headers({ 'x-real-ip': '198.51.100.7' }) as never)
    expect(await getClientIp()).toBe('198.51.100.7')

    vi.mocked(headers).mockResolvedValue(new Headers() as never)
    expect(await getClientIp()).toBe('unknown')
  })
})

describe('isRateLimited', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  it('allows requests up to the max, then blocks the next one in the same window', async () => {
    const { getSanityWriteClient } = await import('@/lib/sanity/write-client')
    const fakeClient = buildFakeWriteClient()
    vi.mocked(getSanityWriteClient).mockReturnValue(fakeClient as never)
    const { isRateLimited } = await import('./rate-limit')

    const check = { action: 'test-action', identifier: '1.2.3.4', windowMs: 60_000, max: 3 }
    expect(await isRateLimited([check])).toBe(false) // 1
    expect(await isRateLimited([check])).toBe(false) // 2
    expect(await isRateLimited([check])).toBe(false) // 3, still allowed (== max)
    expect(await isRateLimited([check])).toBe(true) // 4, over max
  })

  it('keeps separate counts per identifier — one IP hitting its limit never affects another', async () => {
    const { getSanityWriteClient } = await import('@/lib/sanity/write-client')
    const fakeClient = buildFakeWriteClient()
    vi.mocked(getSanityWriteClient).mockReturnValue(fakeClient as never)
    const { isRateLimited } = await import('./rate-limit')

    const forFirstIp = { action: 'test-action', identifier: '1.1.1.1', windowMs: 60_000, max: 1 }
    const forSecondIp = { action: 'test-action', identifier: '2.2.2.2', windowMs: 60_000, max: 1 }
    expect(await isRateLimited([forFirstIp])).toBe(false)
    expect(await isRateLimited([forFirstIp])).toBe(true)
    expect(await isRateLimited([forSecondIp])).toBe(false)
  })

  it('keeps separate counts per action — an IP axis and an email axis never share a bucket', async () => {
    const { getSanityWriteClient } = await import('@/lib/sanity/write-client')
    const fakeClient = buildFakeWriteClient()
    vi.mocked(getSanityWriteClient).mockReturnValue(fakeClient as never)
    const { isRateLimited } = await import('./rate-limit')

    const sameIdentifierDifferentActions = [
      { action: 'newsletter-ip', identifier: 'shared', windowMs: 60_000, max: 1 },
      { action: 'newsletter-email', identifier: 'shared', windowMs: 60_000, max: 1 },
    ]
    expect(await isRateLimited(sameIdentifierDifferentActions)).toBe(false)
    // Both axes were hit once by the call above — a second call over
    // *either* axis alone must report limited.
    expect(
      await isRateLimited([
        { action: 'newsletter-ip', identifier: 'shared', windowMs: 60_000, max: 1 },
      ])
    ).toBe(true)
  })

  it('checks every axis even after an earlier one is already over its limit', async () => {
    const { getSanityWriteClient } = await import('@/lib/sanity/write-client')
    const fakeClient = buildFakeWriteClient()
    vi.mocked(getSanityWriteClient).mockReturnValue(fakeClient as never)
    const { isRateLimited } = await import('./rate-limit')

    const overLimit = { action: 'axis-a', identifier: 'x', windowMs: 60_000, max: 0 }
    const underLimit = { action: 'axis-b', identifier: 'x', windowMs: 60_000, max: 5 }
    await isRateLimited([overLimit, underLimit])
    // axis-b's bucket must have been hit exactly once, proving the loop
    // didn't short-circuit after axis-a came back limited.
    expect(fakeClient.patch).toHaveBeenCalledWith(expect.stringContaining('axis-b'))
  })

  it('fails open (never blocks) when Sanity write access is not configured', async () => {
    const { isSanityWriteConfigured } = await import('@/lib/sanity/write-client')
    vi.mocked(isSanityWriteConfigured).mockReturnValue(false)
    const { isRateLimited } = await import('./rate-limit')

    const check = { action: 'test-action', identifier: '1.2.3.4', windowMs: 60_000, max: 0 }
    expect(await isRateLimited([check])).toBe(false)
  })

  it('fails open when the underlying Sanity call throws', async () => {
    const { getSanityWriteClient } = await import('@/lib/sanity/write-client')
    vi.mocked(getSanityWriteClient).mockImplementation(() => {
      throw new Error('network blip')
    })
    const { isRateLimited } = await import('./rate-limit')

    const check = { action: 'test-action', identifier: '1.2.3.4', windowMs: 60_000, max: 0 }
    expect(await isRateLimited([check])).toBe(false)
  })
})
