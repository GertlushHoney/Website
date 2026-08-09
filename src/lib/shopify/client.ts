// Storefront API only — never the Admin API. See docs/launch-checklist.md
// and docs/technical-architecture.md for why (an Admin token in this
// codebase would expose orders/customers/payments to the public site).
const API_VERSION = '2026-04'

const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN
const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN

export function isShopifyConfigured(): boolean {
  return Boolean(domain && token)
}

export class ShopifyError extends Error {}

export async function shopifyFetch<T>(params: {
  query: string
  variables?: Record<string, unknown>
}): Promise<T> {
  if (!domain || !token) {
    throw new ShopifyError('Shopify Storefront API is not configured')
  }

  const res = await fetch(`https://${domain}/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': token,
    },
    body: JSON.stringify(params),
    // Product data can change (price, stock) — don't cache indefinitely.
    next: { revalidate: 60 },
  })

  if (!res.ok) {
    throw new ShopifyError(`Shopify Storefront API request failed: ${res.status}`)
  }

  const json = await res.json()
  if (json.errors?.length) {
    throw new ShopifyError(json.errors.map((e: { message: string }) => e.message).join('; '))
  }
  return json.data as T
}
