import { shopifyAdminFetch, ShopifyAdminError, isShopifyAdminConfigured } from './admin-client'

// Pushes a product's real packaged shipping weight to Shopify's own
// inventory item record, so a weight-based shipping rate (set up in
// Shopify Admin → Settings → Shipping and delivery) has a real number to
// calculate against. Backs the /tools/sync-shipping-weights page — see
// honeyProduct.ts / merchProduct.ts "Shipping weight (g)" for where the
// number itself comes from (deliberately a separate field from the
// free-text "12oz / 280ml" display weight, which is never a reliable
// source for this).
//
// Requires write_inventory scope on the Admin API app (already granted —
// see admin-inventory.ts).

type ProductInventoryItemResponse = {
  productByHandle: {
    variants: { edges: { node: { inventoryItem: { id: string } } }[] }
  } | null
}

// Looked up by Shopify handle, not product title — unlike
// admin-inventory.ts's getInventoryItemId (which exists to match the
// "Honey selection" cart attribute's display name). Every honeyProduct
// and merchProduct document already carries its real shopifyHandle for
// exactly this kind of lookup (see getProductByHandle), so there's no
// need for the title-matching workaround here.
async function getInventoryItemIdByHandle(handle: string): Promise<string | null> {
  const data = await shopifyAdminFetch<ProductInventoryItemResponse>({
    query: `
      query InventoryItemByHandle($handle: String!) {
        productByHandle(handle: $handle) {
          variants(first: 1) { edges { node { inventoryItem { id } } } }
        }
      }
    `,
    variables: { handle },
  })
  return data.productByHandle?.variants.edges[0]?.node.inventoryItem.id ?? null
}

export type ShippingWeightSyncResult =
  | { handle: string; status: 'synced' }
  | { handle: string; status: 'not-found' }
  | { handle: string; status: 'error'; message: string }

// Sets one product's real shipping weight in Shopify. Returns a result
// rather than throwing on a per-product miss (not found / no matching
// variant) so a caller syncing a whole catalogue can report every
// product's outcome instead of one bad handle failing the entire run.
export async function syncShippingWeight(
  handle: string,
  grams: number
): Promise<ShippingWeightSyncResult> {
  const inventoryItemId = await getInventoryItemIdByHandle(handle)
  if (!inventoryItemId) return { handle, status: 'not-found' }

  const data = await shopifyAdminFetch<{
    inventoryItemUpdate: { userErrors: { field: string[] | null; message: string }[] }
  }>({
    query: `
      mutation SetShippingWeight($id: ID!, $input: InventoryItemUpdateInput!) {
        inventoryItemUpdate(id: $id, input: $input) {
          userErrors { field message }
        }
      }
    `,
    variables: {
      id: inventoryItemId,
      input: { measurement: { weight: { value: grams, unit: 'GRAMS' } } },
    },
  })

  const errors = data.inventoryItemUpdate.userErrors
  if (errors.length > 0) {
    return { handle, status: 'error', message: errors.map((e) => e.message).join('; ') }
  }
  return { handle, status: 'synced' }
}

// Syncs every product's shipping weight in one pass — run manually from
// /tools/sync-shipping-weights after adding or changing weights in Studio
// (no live webhook for this yet; weight changes rarely enough that a
// one-click manual sync is enough for now).
export async function syncAllShippingWeights(
  products: { handle: string; grams: number | null }[]
): Promise<ShippingWeightSyncResult[]> {
  if (!isShopifyAdminConfigured()) {
    throw new ShopifyAdminError('Shopify Admin API is not configured')
  }

  const results: ShippingWeightSyncResult[] = []
  for (const product of products) {
    if (product.grams == null || product.grams <= 0) continue
    results.push(await syncShippingWeight(product.handle, product.grams))
  }
  return results
}
