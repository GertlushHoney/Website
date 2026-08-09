import { isShopifyConfigured, shopifyFetch, ShopifyError } from './client'
import { PRODUCT_BY_QUERY } from './queries'

export type ShopifyProduct = {
  productId: string
  variantId: string
  handle: string
  price: number
  currencyCode: string
  availableForSale: boolean
  quantityAvailable: number
}

type ProductSearchResponse = {
  products: {
    edges: {
      node: {
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
      }
    }[]
  }
}

// Matches by title fragment rather than a hardcoded handle, since the
// handle Shopify generates from a product title isn't something we control
// or want to hardcode/guess. Returns null (never throws) on any failure —
// product pages fall back to their static price/mailto content rather than
// breaking when Shopify is unreachable or the product isn't found yet.
export async function getProductByTitle(titleFragment: string): Promise<ShopifyProduct | null> {
  if (!isShopifyConfigured()) return null

  try {
    const data = await shopifyFetch<ProductSearchResponse>({
      query: PRODUCT_BY_QUERY,
      variables: { query: `title:*${titleFragment}*` },
    })

    const product = data.products.edges[0]?.node
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
