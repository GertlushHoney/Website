import { beforeEach, describe, expect, it, vi } from 'vitest'

// Restock alerts had no tests at all before "ADD PUBLIC FORM RATE
// LIMITING" (2026-09-15) — coverage here is deliberately focused on the
// new rate-limit gate plus the couple of pre-existing branches (existing
// customer vs new) it sits in front of, not a full rewrite of this file's
// test coverage. Extended for "SECURE RESTOCK ALERT SUBMISSION"
// (2026-09-15): productName is no longer a client-supplied argument at
// all — the server derives it from productHandle via a real, active
// product lookup, and rejects anything that doesn't resolve to one.
vi.mock('@/lib/shopify/admin-client', () => ({
  isShopifyAdminConfigured: vi.fn(() => true),
  shopifyAdminFetch: vi.fn(),
  ShopifyAdminError: class ShopifyAdminError extends Error {},
}))
vi.mock('@/lib/rate-limit', () => ({
  getClientIp: vi.fn(async () => '203.0.113.1'),
  isRateLimited: vi.fn(async () => false),
}))
vi.mock('@/lib/sanity/active-product-lookup', () => ({
  getActiveProductNameByShopifyHandle: vi.fn(async () => 'Bee S3'),
}))

function findCustomerResponse(id: string | null) {
  return { customers: { edges: id ? [{ node: { id } }] : [] } }
}

describe('subscribeToRestockAlert', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  it('rejects an invalid email before ever checking the rate limit', async () => {
    const { isRateLimited } = await import('@/lib/rate-limit')
    const { subscribeToRestockAlert } = await import('./restock')

    const result = await subscribeToRestockAlert('not-an-email', 'bee-s3')

    expect(result.ok).toBe(false)
    expect(isRateLimited).not.toHaveBeenCalled()
  })

  it('rejects an empty or over-length product handle without ever checking the rate limit', async () => {
    const { isRateLimited } = await import('@/lib/rate-limit')
    const { subscribeToRestockAlert } = await import('./restock')

    expect((await subscribeToRestockAlert('real@example.com', '   ')).ok).toBe(false)
    expect((await subscribeToRestockAlert('real@example.com', 'a'.repeat(201))).ok).toBe(false)
    expect(isRateLimited).not.toHaveBeenCalled()
  })

  it('rejects when rate-limited, before ever looking up the product or calling Shopify', async () => {
    const { isRateLimited } = await import('@/lib/rate-limit')
    vi.mocked(isRateLimited).mockResolvedValueOnce(true)
    const { getActiveProductNameByShopifyHandle } = await import(
      '@/lib/sanity/active-product-lookup'
    )
    const { shopifyAdminFetch } = await import('@/lib/shopify/admin-client')
    const { subscribeToRestockAlert } = await import('./restock')

    const result = await subscribeToRestockAlert('real@example.com', 'bee-s3')

    expect(result).toEqual({ ok: false, error: 'Too many attempts — please try again later.' })
    expect(getActiveProductNameByShopifyHandle).not.toHaveBeenCalled()
    expect(shopifyAdminFetch).not.toHaveBeenCalled()
  })

  it('rejects a handle that does not resolve to a real, active product, before calling Shopify', async () => {
    const { getActiveProductNameByShopifyHandle } = await import(
      '@/lib/sanity/active-product-lookup'
    )
    vi.mocked(getActiveProductNameByShopifyHandle).mockResolvedValueOnce(null)
    const { shopifyAdminFetch } = await import('@/lib/shopify/admin-client')
    const { subscribeToRestockAlert } = await import('./restock')

    const result = await subscribeToRestockAlert('real@example.com', 'not-a-real-product')

    expect(result).toEqual({ ok: false, error: "Couldn't find that product." })
    expect(shopifyAdminFetch).not.toHaveBeenCalled()
  })

  it('checks both the IP and the (lowercased) email as independent axes', async () => {
    const { isRateLimited } = await import('@/lib/rate-limit')
    const { shopifyAdminFetch } = await import('@/lib/shopify/admin-client')
    vi.mocked(shopifyAdminFetch).mockResolvedValueOnce(findCustomerResponse('gid://existing'))
    vi.mocked(shopifyAdminFetch).mockResolvedValueOnce({ tagsAdd: { userErrors: [] } })
    const { subscribeToRestockAlert } = await import('./restock')

    await subscribeToRestockAlert('Real@Example.com', 'bee-s3')

    expect(isRateLimited).toHaveBeenCalledWith([
      expect.objectContaining({ action: 'restock-ip', identifier: '203.0.113.1' }),
      expect.objectContaining({ action: 'restock-email', identifier: 'real@example.com' }),
    ])
  })

  it('never trusts a client-supplied product name — there is no longer even a parameter for one', async () => {
    const { getActiveProductNameByShopifyHandle } = await import(
      '@/lib/sanity/active-product-lookup'
    )
    const { shopifyAdminFetch } = await import('@/lib/shopify/admin-client')
    vi.mocked(shopifyAdminFetch).mockResolvedValueOnce(findCustomerResponse('gid://existing'))
    vi.mocked(shopifyAdminFetch).mockResolvedValueOnce({ tagsAdd: { userErrors: [] } })
    const { subscribeToRestockAlert } = await import('./restock')

    const result = await subscribeToRestockAlert('real@example.com', 'bee-s3')

    expect(result).toEqual({ ok: true })
    expect(getActiveProductNameByShopifyHandle).toHaveBeenCalledWith('bee-s3')
  })

  it('still tags an existing customer once past every check', async () => {
    const { shopifyAdminFetch } = await import('@/lib/shopify/admin-client')
    vi.mocked(shopifyAdminFetch).mockResolvedValueOnce(findCustomerResponse('gid://existing'))
    vi.mocked(shopifyAdminFetch).mockResolvedValueOnce({ tagsAdd: { userErrors: [] } })
    const { subscribeToRestockAlert } = await import('./restock')

    const result = await subscribeToRestockAlert('real@example.com', 'bee-s3')

    expect(result).toEqual({ ok: true })
    expect(shopifyAdminFetch).toHaveBeenCalledWith(
      expect.objectContaining({ variables: expect.objectContaining({ tags: ['restock:bee-s3'] }) })
    )
  })

  it('still creates a new tagged, non-marketing-subscribed customer once past every check', async () => {
    const { shopifyAdminFetch } = await import('@/lib/shopify/admin-client')
    vi.mocked(shopifyAdminFetch).mockResolvedValueOnce(findCustomerResponse(null))
    vi.mocked(shopifyAdminFetch).mockResolvedValueOnce({
      customerCreate: { customer: { id: 'gid://new' }, userErrors: [] },
    })
    const { subscribeToRestockAlert } = await import('./restock')

    const result = await subscribeToRestockAlert('real@example.com', 'bee-s3')

    expect(result).toEqual({ ok: true })
  })
})
