import { beforeEach, describe, expect, it, vi } from 'vitest'

// adjustInventory is the last line of defense against overselling honey
// stock — this checks the actual current quantity (via shopifyAdminFetch)
// immediately before ever attempting the deduction mutation, and refuses
// (returning false, not throwing) rather than letting stock go negative.
// See "FIX SURPRISE HAMPER STOCK VALIDATION" audit, 2026-09-13.
vi.mock('@/lib/shopify/admin-client', () => ({
  shopifyAdminFetch: vi.fn(),
  isShopifyAdminConfigured: vi.fn(() => true),
  ShopifyAdminError: class ShopifyAdminError extends Error {},
}))

function availableQuantityResponse(quantity: number) {
  return { inventoryItem: { inventoryLevel: { quantities: [{ name: 'available', quantity }] } } }
}

describe('adjustInventory', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  it('refuses and never calls the mutation when the fresh read shows insufficient stock', async () => {
    const { shopifyAdminFetch } = await import('@/lib/shopify/admin-client')
    // Only 4 available; this call asks to deduct 6 — must be refused.
    vi.mocked(shopifyAdminFetch).mockResolvedValueOnce(availableQuantityResponse(4))

    const { adjustInventory } = await import('./admin-inventory')
    const applied = await adjustInventory('gid://shopify/InventoryItem/1', 'gid://shopify/Location/1', -6)

    expect(applied).toBe(false)
    // Exactly one call — the availability read — and never a second call
    // for the mutation itself.
    expect(shopifyAdminFetch).toHaveBeenCalledTimes(1)
  })

  it('applies the mutation and returns true when there is enough stock', async () => {
    const { shopifyAdminFetch } = await import('@/lib/shopify/admin-client')
    vi.mocked(shopifyAdminFetch)
      .mockResolvedValueOnce(availableQuantityResponse(10))
      .mockResolvedValueOnce({ inventoryAdjustQuantities: { userErrors: [] } })

    const { adjustInventory } = await import('./admin-inventory')
    const applied = await adjustInventory('gid://shopify/InventoryItem/1', 'gid://shopify/Location/1', -6)

    expect(applied).toBe(true)
    expect(shopifyAdminFetch).toHaveBeenCalledTimes(2)
  })

  it('still allows a positive delta (restocking) regardless of the current quantity', async () => {
    const { shopifyAdminFetch } = await import('@/lib/shopify/admin-client')
    vi.mocked(shopifyAdminFetch)
      .mockResolvedValueOnce(availableQuantityResponse(0))
      .mockResolvedValueOnce({ inventoryAdjustQuantities: { userErrors: [] } })

    const { adjustInventory } = await import('./admin-inventory')
    const applied = await adjustInventory('gid://shopify/InventoryItem/1', 'gid://shopify/Location/1', 6)

    expect(applied).toBe(true)
  })
})
