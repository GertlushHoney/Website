import { isShopifyConfigured, shopifyFetch, ShopifyError } from './client'
import { PRODUCT_BY_HANDLE_QUERY, PRODUCT_FIELDS } from './queries'

// A single option a customer can pick when a product has more than one
// variant (e.g. a hamper's honey selection). `label` is Shopify's own
// variant title, which for a single-option product is just that option's
// value (e.g. "Bee S3 only") — no separate Sanity config needed.
export type ShopifyProductVariant = {
  id: string
  label: string
  price: number
  availableForSale: boolean
  quantityAvailable: number
}

export type ShopifyProduct = {
  productId: string
  variantId: string
  handle: string
  price: number
  currencyCode: string
  availableForSale: boolean
  quantityAvailable: number
  // The real Shopify Selling Plan id for this product, if a merchant has
  // actually created one (via the Shopify Subscriptions app) — null means
  // no subscription is set up in Shopify yet, regardless of whether Sanity
  // has a subscriptionPrice configured for the front-end toggle.
  subscriptionSellingPlanId: string | null
  // Every real variant on the product, always at least length 1 (the same
  // one reflected in the top-level variantId/price/etc above, which is
  // just variants[0] kept for every existing single-variant caller). A
  // product page only needs to render a picker when this has more than one
  // entry — see PurchaseOptions.
  variants: ShopifyProductVariant[]
}

// The single source of truth for "can this actually be bought right now",
// used everywhere a page needs to decide OutOfStock vs InStock (product
// JSON-LD, most visibly) — never inferred from quantityAvailable alone.
// availableForSale is Shopify's own authoritative signal and already
// accounts for untracked inventory: a variant with inventory tracking off
// (e.g. a hamper — see docs/technical-architecture.md, "Hamper stock
// sync") reports quantityAvailable: 0 while staying availableForSale:
// true, because its real limit is something else entirely (the honey it's
// made from), not its own stock count. Treating quantityAvailable <= 0 as
// sold out, as this codebase used to for structured data, reported
// OutOfStock to Google for products customers could actually buy. See
// "FIX PRODUCT STRUCTURED DATA STOCK STATUS" audit, 2026-09-13.
//
// No product at all (Shopify unreachable, or the handle doesn't match a
// real product yet) is treated as sold out too — safer to under-claim
// than to ever tell Google InStock with zero real data behind it. In
// practice this case is moot for the current callers anyway: productJsonLd
// omits the whole `offers` block (availability included) whenever there's
// no price to show, which is exactly when there's no product either.
export function isProductSoldOut(product: Pick<ShopifyProduct, 'availableForSale'> | null): boolean {
  return product == null || !product.availableForSale
}

type RawProductNode = {
  id: string
  handle: string
  availableForSale: boolean
  variants: {
    edges: {
      node: {
        id: string
        title: string
        availableForSale: boolean
        quantityAvailable: number | null
        price: { amount: string; currencyCode: string }
      }
    }[]
  }
  sellingPlanGroups: {
    edges: { node: { sellingPlans: { edges: { node: { id: string } }[] } } }[]
  }
}

type ProductByHandleResponse = {
  product: RawProductNode | null
}

// The single place raw Storefront API product JSON becomes a ShopifyProduct
// — shared by both getProductByHandle (one product) and getProductsByHandles
// (many, in a single request) below, so the two query shapes can never
// silently drift into mapping a field differently. Returns null if the node
// is missing or genuinely has no variants (shouldn't happen for a real
// product, but never assumed).
function mapRawProduct(product: RawProductNode | null): ShopifyProduct | null {
  const variantNodes = product?.variants.edges.map((edge) => edge.node) ?? []
  const variant = variantNodes[0]
  if (!product || !variant) return null

  const sellingPlanId =
    product.sellingPlanGroups.edges[0]?.node.sellingPlans.edges[0]?.node.id ?? null

  const variants: ShopifyProductVariant[] = variantNodes.map((node) => ({
    id: node.id,
    label: node.title,
    price: Number(node.price.amount),
    availableForSale: product.availableForSale && node.availableForSale,
    quantityAvailable: node.quantityAvailable ?? 0,
  }))

  return {
    productId: product.id,
    variantId: variant.id,
    handle: product.handle,
    price: Number(variant.price.amount),
    currencyCode: variant.price.currencyCode,
    availableForSale: product.availableForSale && variant.availableForSale,
    quantityAvailable: variant.quantityAvailable ?? 0,
    subscriptionSellingPlanId: sellingPlanId,
    variants,
  }
}

// Looks up by the exact Shopify handle stored on the matching Sanity
// honeyProduct document — never a fuzzy title search, which breaks down
// once there's more than one similarly-named product. Returns null (never
// throws) on any failure — product pages fall back to an honest
// "pricing temporarily unavailable" state rather than breaking when
// Shopify is unreachable or the handle doesn't match a real product yet.
export async function getProductByHandle(handle: string): Promise<ShopifyProduct | null> {
  if (!isShopifyConfigured()) return null

  try {
    const data = await shopifyFetch<ProductByHandleResponse>({
      query: PRODUCT_BY_HANDLE_QUERY,
      variables: { handle },
    })
    return mapRawProduct(data.product)
  } catch (error) {
    if (error instanceof ShopifyError) {
      console.error('Shopify product lookup failed:', error.message)
      return null
    }
    throw error
  }
}

// Builds one GraphQL document that asks for every handle at once, each as
// its own aliased `product(handle: ...)` field (p0, p1, ...) — the
// standard way to batch several instances of the same query field into a
// single request. Used wherever a listing page needs live Shopify data
// (price, stock) for every product it's about to render — see
// getProductsByHandles below.
function buildBatchProductsQuery(handles: string[]): {
  query: string
  variables: Record<string, string>
} {
  const variableDefs = handles.map((_, i) => `$h${i}: String!`).join(', ')
  const aliasedFields = handles
    .map((_, i) => `p${i}: product(handle: $h${i}) { ${PRODUCT_FIELDS} }`)
    .join('\n')
  return {
    query: `query ProductsByHandles(${variableDefs}) { ${aliasedFields} }`,
    variables: Object.fromEntries(handles.map((handle, i) => [`h${i}`, handle])),
  }
}

// Fetches every handle in one Storefront API request instead of one request
// per product — the fix for "REVIEW PERFORMANCE AS PRODUCT COUNT GROWS"
// (2026-09-13). A honey listing page (or the homepage's featured-product
// picker) used to fire N separate Shopify requests for N products, fine at
// 2-3 honeys but a real scaling risk — both request volume and Shopify's
// own API rate limits — once that range reaches the 20-50 honeys this
// build is meant to handle. Silently drops any handle Shopify doesn't
// resolve (a stale/mistyped Sanity handle) rather than failing the whole
// batch — same "never break the page over one bad product" principle as
// getProductByHandle.
//
// Comfortably covers the real target range (20-50 honeys) as one request;
// deliberately not chunked into multiple batched calls for a much larger
// catalogue, since that's not the range this needs to handle today — see
// docs/technical-architecture.md, "Batched product/review fetching".
export async function getProductsByHandles(
  handles: string[]
): Promise<Record<string, ShopifyProduct | null>> {
  if (handles.length === 0) return {}
  if (!isShopifyConfigured()) return Object.fromEntries(handles.map((h) => [h, null]))

  const { query, variables } = buildBatchProductsQuery(handles)

  try {
    const data = await shopifyFetch<Record<string, RawProductNode | null>>({ query, variables })
    return Object.fromEntries(
      handles.map((handle, i) => [handle, mapRawProduct(data[`p${i}`] ?? null)])
    )
  } catch (error) {
    if (error instanceof ShopifyError) {
      console.error('Shopify batch product lookup failed:', error.message)
      return Object.fromEntries(handles.map((h) => [h, null]))
    }
    throw error
  }
}
