import { randomUUID } from 'crypto'
import { shopifyAdminFetch, ShopifyAdminError, isShopifyAdminConfigured } from './admin-client'

// Manual stock sync for hampers (see docs/technical-architecture.md,
// "Hamper stock sync"). A hamper is its own standalone Shopify product, so
// buying one never touches the individual honey products' own inventory —
// Shopify has no native way to link them once a customer picks *which*
// honey at checkout (its Bundles app only supports fixed compositions).
// This is the deliberate workaround: the order-paid webhook reads which
// honey was chosen and calls the functions below to adjust that honey's
// real stock by hand, via the Admin API.
//
// Requires read_products, read_inventory and write_inventory scopes on the
// Admin API app — none of which the app had before this (it was
// deliberately narrow, just read/write_customers for restock alerts).
// Reading a location's id turned out not to need read_locations — only
// its name field does, and this never asks for that.

type ProductInventoryResponse = {
  products: {
    edges: { node: { variants: { edges: { node: { inventoryItem: { id: string } } }[] } } }[]
  }
}

// The real Shopify inventory item id behind a honey's first (only) variant
// — needed because inventoryAdjustQuantities operates on inventory items,
// not products or variants directly.
//
// Matches by product TITLE, not the shopifyHandle stored in Sanity — some
// honey products (Bee S3 confirmed) have a handle in Shopify that differs
// from what's in Sanity, a leftover from a past rename that the Storefront
// API silently redirects through but the Admin API does not. Title is what
// the "Honey selection" cart attribute already stores, and matches Sanity's
// honeyProduct.name exactly, so it's the more reliable key here.
export async function getInventoryItemId(honeyName: string): Promise<string | null> {
  const data = await shopifyAdminFetch<ProductInventoryResponse>({
    query: `
      query InventoryItemByTitle($query: String!) {
        products(first: 1, query: $query) {
          edges { node { variants(first: 1) { edges { node { inventoryItem { id } } } } } }
        }
      }
    `,
    variables: { query: `title:'${honeyName.replace(/'/g, "\\'")}'` },
  })
  return data.products.edges[0]?.node.variants.edges[0]?.node.inventoryItem.id ?? null
}

// Cached for the life of the server instance — a shop's primary location
// essentially never changes, so this saves a round trip on every webhook
// delivery rather than genuinely needing to be fresh each time.
let cachedLocationId: string | null = null

export async function getPrimaryLocationId(): Promise<string | null> {
  if (cachedLocationId) return cachedLocationId
  const data = await shopifyAdminFetch<{ locations: { edges: { node: { id: string } }[] } }>({
    query: `query PrimaryLocation { locations(first: 1) { edges { node { id } } } }`,
  })
  cachedLocationId = data.locations.edges[0]?.node.id ?? null
  return cachedLocationId
}

// The current "available" quantity for one inventory item at one location
// — inventoryAdjustQuantities requires this as changeFromQuantity (an
// optimistic-concurrency check against the value the caller thinks is
// current), not just a bare delta, discovered by trial against the real
// API rather than documented anywhere obvious.
async function getAvailableQuantity(inventoryItemId: string, locationId: string): Promise<number> {
  const data = await shopifyAdminFetch<{
    inventoryItem: {
      inventoryLevel: { quantities: { name: string; quantity: number }[] } | null
    } | null
  }>({
    query: `
      query AvailableQuantity($id: ID!, $locationId: ID!) {
        inventoryItem(id: $id) {
          inventoryLevel(locationId: $locationId) {
            quantities(names: ["available"]) { name quantity }
          }
        }
      }
    `,
    variables: { id: inventoryItemId, locationId },
  })
  return data.inventoryItem?.inventoryLevel?.quantities.find((q) => q.name === 'available')
    ?.quantity ?? 0
}

// Applies a stock change (negative to reduce) to one honey's real
// inventory. `reason: correction` is the closest fit Shopify's fixed enum
// offers for "adjusted by hand because of a bundled sale it can't track
// natively" — there's no more specific reason code for this.
//
// The mutation is marked @idempotent by Shopify's schema, which requires
// a fresh key per call (a retried request with the same key is treated as
// a duplicate and ignored rather than double-applied) — generated here,
// not something callers need to think about.
export async function adjustInventory(
  inventoryItemId: string,
  locationId: string,
  delta: number
): Promise<void> {
  const changeFromQuantity = await getAvailableQuantity(inventoryItemId, locationId)

  const data = await shopifyAdminFetch<{
    inventoryAdjustQuantities: { userErrors: { field: string[] | null; message: string }[] }
  }>({
    query: `
      mutation AdjustInventory($input: InventoryAdjustQuantitiesInput!, $key: String!) {
        inventoryAdjustQuantities(input: $input) @idempotent(key: $key) {
          userErrors { field message }
        }
      }
    `,
    variables: {
      input: {
        reason: 'correction',
        name: 'available',
        changes: [{ inventoryItemId, locationId, delta, changeFromQuantity }],
      },
      key: randomUUID(),
    },
  })
  const errors = data.inventoryAdjustQuantities.userErrors
  if (errors.length > 0) {
    throw new ShopifyAdminError(errors.map((e) => e.message).join('; '))
  }
}

// Looks up a honey by its Shopify product title (matches Sanity's
// honeyProduct.name and the "Honey selection" cart attribute value) and
// deducts `jars` from its real stock. Silently does nothing if the Admin
// API isn't configured or the name doesn't resolve — callers (the webhook
// route) log the outcome themselves rather than this throwing and failing
// the whole webhook over one unmatched line.
export async function deductHoneyStock(honeyName: string, jars: number): Promise<boolean> {
  // TEMPORARY diagnostic — remove once the Vercel env var issue is
  // confirmed fixed. Logs presence only, never the actual secret values.
  console.log('deductHoneyStock env check', {
    hasDomain: Boolean(process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN),
    hasClientId: Boolean(process.env.SHOPIFY_ADMIN_CLIENT_ID),
    hasClientSecret: Boolean(process.env.SHOPIFY_ADMIN_CLIENT_SECRET),
    isConfigured: isShopifyAdminConfigured(),
  })

  if (!isShopifyAdminConfigured() || jars <= 0) return false

  const [inventoryItemId, locationId] = await Promise.all([
    getInventoryItemId(honeyName),
    getPrimaryLocationId(),
  ])
  if (!inventoryItemId || !locationId) return false

  await adjustInventory(inventoryItemId, locationId, -jars)
  return true
}
