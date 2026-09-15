import { beforeEach, describe, expect, it, vi } from 'vitest'

// Core fix for "SECURE REVIEW SUBMISSION" (2026-09-15): the client used to
// send productName straight through to the created document, and
// productSlug was never checked against anything — a caller invoking this
// Server Action directly (bypassing ReviewForm entirely) could create a
// review for a product that doesn't exist. Now the server derives
// productName itself from a real, active product lookup and rejects
// anything that doesn't resolve to one.
vi.mock('@/lib/sanity/reviews', () => ({
  getActiveProductName: vi.fn(),
}))
vi.mock('@/lib/sanity/write-client', () => ({
  isSanityWriteConfigured: vi.fn(() => true),
  getSanityWriteClient: vi.fn(),
}))
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))
vi.mock('@/lib/rate-limit', () => ({
  getClientIp: vi.fn(async () => '203.0.113.1'),
  isRateLimited: vi.fn(async () => false),
}))

const validInput = {
  productSlug: 'bee-s3',
  reviewerName: 'Alex',
  rating: 5,
  body: 'Lovely honey, would buy again and again.',
  companyWebsite: '',
}

describe('submitReview', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  it('rejects a product that does not resolve to a real, active product', async () => {
    const { getActiveProductName } = await import('@/lib/sanity/reviews')
    vi.mocked(getActiveProductName).mockResolvedValue(null)
    const { getSanityWriteClient } = await import('@/lib/sanity/write-client')
    const create = vi.fn()
    vi.mocked(getSanityWriteClient).mockReturnValue({ create } as never)

    const { submitReview } = await import('./submit-review')
    const result = await submitReview(validInput)

    expect(result).toEqual({ ok: false, error: "Couldn't find that product." })
    expect(create).not.toHaveBeenCalled()
  })

  it('never trusts a client-supplied product name — derives it server-side from the lookup', async () => {
    const { getActiveProductName } = await import('@/lib/sanity/reviews')
    vi.mocked(getActiveProductName).mockResolvedValue('Bee S3')
    const { getSanityWriteClient } = await import('@/lib/sanity/write-client')
    const create = vi.fn().mockResolvedValue({})
    vi.mocked(getSanityWriteClient).mockReturnValue({ create } as never)

    const { submitReview } = await import('./submit-review')
    // Note: the input type no longer even has a productName field to
    // smuggle a fake one through — this also guards against a caller that
    // bypasses TypeScript (e.g. a raw fetch to the action) by asserting
    // exactly what gets written.
    const result = await submitReview(validInput)

    expect(result).toEqual({ ok: true })
    expect(getActiveProductName).toHaveBeenCalledWith('bee-s3')
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ productSlug: 'bee-s3', productName: 'Bee S3' })
    )
  })

  it('rejects a reviewer name over the length cap without ever looking up the product', async () => {
    const { getActiveProductName } = await import('@/lib/sanity/reviews')
    const { submitReview } = await import('./submit-review')

    const result = await submitReview({ ...validInput, reviewerName: 'a'.repeat(101) })

    expect(result.ok).toBe(false)
    expect(getActiveProductName).not.toHaveBeenCalled()
  })

  it('rejects a product slug over the length cap without ever looking up the product', async () => {
    const { getActiveProductName } = await import('@/lib/sanity/reviews')
    const { submitReview } = await import('./submit-review')

    const result = await submitReview({ ...validInput, productSlug: 'a'.repeat(201) })

    expect(result.ok).toBe(false)
    expect(getActiveProductName).not.toHaveBeenCalled()
  })

  it('rejects an empty product slug', async () => {
    const { submitReview } = await import('./submit-review')
    const result = await submitReview({ ...validInput, productSlug: '   ' })
    expect(result.ok).toBe(false)
  })

  it('still rejects a missing name, an out-of-range rating, and a too-short/too-long body', async () => {
    const { submitReview } = await import('./submit-review')

    expect((await submitReview({ ...validInput, reviewerName: '  ' })).ok).toBe(false)
    expect((await submitReview({ ...validInput, rating: 6 })).ok).toBe(false)
    expect((await submitReview({ ...validInput, body: 'too short' })).ok).toBe(false)
    expect((await submitReview({ ...validInput, body: 'x'.repeat(2001) })).ok).toBe(false)
  })

  it('rejects when the IP is over its rate limit, before ever looking up the product', async () => {
    const { isRateLimited } = await import('@/lib/rate-limit')
    vi.mocked(isRateLimited).mockResolvedValueOnce(true)
    const { getActiveProductName } = await import('@/lib/sanity/reviews')
    const { submitReview } = await import('./submit-review')

    const result = await submitReview(validInput)

    expect(result).toEqual({
      ok: false,
      error: 'Too many reviews submitted — please try again later.',
    })
    expect(getActiveProductName).not.toHaveBeenCalled()
  })

  it('rate-limits a honeypot-triggering submission too — a direct-call script never fills it', async () => {
    const { isRateLimited } = await import('@/lib/rate-limit')
    vi.mocked(isRateLimited).mockResolvedValueOnce(true)
    const { submitReview } = await import('./submit-review')

    const result = await submitReview({ ...validInput, companyWebsite: 'https://spam.example' })

    expect(result.ok).toBe(false)
  })

  it('silently accepts (without writing anything) when the honeypot field is filled', async () => {
    const { getActiveProductName } = await import('@/lib/sanity/reviews')
    const { submitReview } = await import('./submit-review')

    const result = await submitReview({ ...validInput, companyWebsite: 'https://spam.example' })

    expect(result).toEqual({ ok: true })
    expect(getActiveProductName).not.toHaveBeenCalled()
  })
})
