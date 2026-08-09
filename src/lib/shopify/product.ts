import { isShopifyConfigured, shopifyFetch, ShopifyError } from './client'
import { PRODUCT_BY_HANDLE_QUERY } from './queries'

export type ShopifyProduct = {
  productId: string
  variantId: string
  handle: string
  price: number
  currencyCode: string
  availableForSale: boolean
  quantityAvailable: number
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
          availableForSale: boolean
          quantityAvailable: number | null
          price: { amount: string; currencyCode: string }
        }
      }[]
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
    const variant = product?.variants.edges[0]?.node
    if (!product || !variant) return null

    return {
      productId: product.id,
      variantId: variant.id,
      handle: product.handle,
      price: Number(variant.price.amount),
      currencyCode: variant.price.currencyCode,
      availableForSale: product.availableForSale && variant.availableForSale,
      quantityAvailable: variant.quantityAvailable ?? 0,
    }
  } catch (error) {
    if (error instanceof ShopifyError) {
      console.error('Shopify product lookup failed:', error.message)
      return null
    }
    throw error
  }
}
