import { beforeEach, describe, expect, it, vi } from 'vitest'

// Newsletter signup had no tests at all before "ADD PUBLIC FORM RATE
// LIMITING" (2026-09-15) — coverage here is deliberately focused on the
// new rate-limit gate plus the couple of pre-existing branches (TAKEN
// email, missing config) it sits in front of, not a full rewrite of this
// file's test coverage.
vi.mock('@/lib/shopify/client', () => ({
  isShopifyConfigured: vi.fn(() => true),
  shopifyFetch: vi.fn(),
  ShopifyError: class ShopifyError extends Error {},
}))
vi.mock('@/lib/rate-limit', () => ({
  getClientIp: vi.fn(async () => '203.0.113.1'),
  isRateLimited: vi.fn(async () => false),
}))

function customerCreateResponse(customer: { id: string } | null, errors: { code: string; message: string }[] = []) {
  return { customerCreate: { customer, customerUserErrors: errors } }
}

describe('subscribeToNewsletter', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  it('rejects an invalid email before ever checking the rate limit', async () => {
    const { isRateLimited } = await import('@/lib/rate-limit')
    const { subscribeToNewsletter } = await import('./customer')

    const result = await subscribeToNewsletter('not-an-email')

    expect(result.ok).toBe(false)
    expect(isRateLimited).not.toHaveBeenCalled()
  })

  it('rejects when rate-limited, before ever calling Shopify', async () => {
    const { isRateLimited } = await import('@/lib/rate-limit')
    vi.mocked(isRateLimited).mockResolvedValueOnce(true)
    const { shopifyFetch } = await import('@/lib/shopify/client')
    const { subscribeToNewsletter } = await import('./customer')

    const result = await subscribeToNewsletter('real@example.com')

    expect(result).toEqual({ ok: false, error: 'Too many attempts — please try again later.' })
    expect(shopifyFetch).not.toHaveBeenCalled()
  })

  it('checks both the IP and the (lowercased) email as independent axes', async () => {
    const { isRateLimited } = await import('@/lib/rate-limit')
    const { shopifyFetch } = await import('@/lib/shopify/client')
    vi.mocked(shopifyFetch).mockResolvedValue(customerCreateResponse({ id: 'gid://1' }))
    const { subscribeToNewsletter } = await import('./customer')

    await subscribeToNewsletter('Real@Example.com')

    expect(isRateLimited).toHaveBeenCalledWith([
      expect.objectContaining({ action: 'newsletter-ip', identifier: '203.0.113.1' }),
      expect.objectContaining({ action: 'newsletter-email', identifier: 'real@example.com' }),
    ])
  })

  it('still succeeds for a real signup once past the rate limit', async () => {
    const { shopifyFetch } = await import('@/lib/shopify/client')
    vi.mocked(shopifyFetch).mockResolvedValue(customerCreateResponse({ id: 'gid://1' }))
    const { subscribeToNewsletter } = await import('./customer')

    expect(await subscribeToNewsletter('real@example.com')).toEqual({ ok: true })
  })

  it('still treats an already-subscribed email as success, not an error', async () => {
    const { shopifyFetch } = await import('@/lib/shopify/client')
    vi.mocked(shopifyFetch).mockResolvedValue(
      customerCreateResponse(null, [{ code: 'TAKEN', message: 'Email has already been taken' }])
    )
    const { subscribeToNewsletter } = await import('./customer')

    expect(await subscribeToNewsletter('real@example.com')).toEqual({ ok: true })
  })
})
