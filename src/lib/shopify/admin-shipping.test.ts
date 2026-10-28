import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('./admin-client', () => ({
  shopifyAdminFetch: vi.fn(),
  isShopifyAdminConfigured: vi.fn(() => true),
  ShopifyAdminError: class ShopifyAdminError extends Error {},
}))

describe('syncShippingWeight', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  it('sets the same packed weight on every variant of the product (e.g. a hamper\'s two options)', async () => {
    const { shopifyAdminFetch } = await import('./admin-client')
    vi.mocked(shopifyAdminFetch)
      .mockResolvedValueOnce({
        productByHandle: {
          variants: {
            edges: [
              { node: { inventoryItem: { id: 'gid://shopify/InventoryItem/1' } } },
              { node: { inventoryItem: { id: 'gid://shopify/InventoryItem/2' } } },
            ],
          },
        },
      })
      .mockResolvedValue({ inventoryItemUpdate: { userErrors: [] } })

    const { syncShippingWeight } = await import('./admin-shipping')
    expect(await syncShippingWeight('hamper-3-jar-honey', 1845)).toEqual({
      handle: 'hamper-3-jar-honey',
      status: 'synced',
    })

    const updates = vi.mocked(shopifyAdminFetch).mock.calls.slice(1)
    expect(updates).toHaveLength(2)
    expect(updates.map(([call]) => call.variables?.id)).toEqual([
      'gid://shopify/InventoryItem/1',
      'gid://shopify/InventoryItem/2',
    ])
    for (const [call] of updates) {
      expect(call.variables?.input).toEqual({
        measurement: { weight: { value: 1845, unit: 'GRAMS' } },
      })
    }
  })

  it('reports not-found when the product or its variants are missing', async () => {
    const { shopifyAdminFetch } = await import('./admin-client')
    vi.mocked(shopifyAdminFetch).mockResolvedValueOnce({ productByHandle: null })
    const { syncShippingWeight } = await import('./admin-shipping')
    expect(await syncShippingWeight('nope', 100)).toEqual({ handle: 'nope', status: 'not-found' })
  })

  it('reports an error if Shopify rejects any variant', async () => {
    const { shopifyAdminFetch } = await import('./admin-client')
    vi.mocked(shopifyAdminFetch)
      .mockResolvedValueOnce({
        productByHandle: {
          variants: { edges: [{ node: { inventoryItem: { id: 'gid://shopify/InventoryItem/1' } } }] },
        },
      })
      .mockResolvedValueOnce({ inventoryItemUpdate: { userErrors: [{ field: null, message: 'bad weight' }] } })
    const { syncShippingWeight } = await import('./admin-shipping')
    expect(await syncShippingWeight('x', 100)).toEqual({ handle: 'x', status: 'error', message: 'bad weight' })
  })
})
