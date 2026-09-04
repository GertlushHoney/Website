import { isShopifyConfigured, shopifyFetch, ShopifyError } from './client'
import { PRODUCT_BY_HANDLE_QUERY } from './queries'

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

type ProductByHandleResponse = {
  product: {
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
  } | null
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

    const product = data.product
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
  } catch (error) {
    if (error instanceof ShopifyError) {
      console.error('Shopify product lookup failed:', error.message)
      return null
    }
    throw error
  }
}
