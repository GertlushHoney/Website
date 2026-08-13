// Shopify Admin API — a deliberate, narrow exception to this codebase's
// otherwise Storefront-API-only rule (see docs/technical-architecture.md,
// "Security boundaries", which explicitly anticipates this: "the Shopify
// Admin API token... is a separate credential, server-only, never
// referenced from any client-reachable code path"). The ONLY thing this
// client is used for is tagging a customer with which sold-out product
// they want a restock alert for (src/lib/shopify/restock.ts) — nothing
// else in this codebase touches the Admin API. Never import this file
// from a client component; every caller must be a 'use server' function.
const API_VERSION = '2026-04'

const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN
const token = process.env.SHOPIFY_ADMIN_API_TOKEN

export function isShopifyAdminConfigured(): boolean {
  return Boolean(domain && token)
}

export class ShopifyAdminError extends Error {}

export async function shopifyAdminFetch<T>(params: {
  query: string
  variables?: Record<string, unknown>
}): Promise<T> {
  if (!domain || !token) {
    throw new ShopifyAdminError('Shopify Admin API is not configured')
  }

  const res = await fetch(`https://${domain}/admin/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token,
    },
    body: JSON.stringify(params),
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new ShopifyAdminError(`Shopify Admin API request failed: ${res.status}`)
  }

  const json = await res.json()
  if (json.errors?.length) {
    throw new ShopifyAdminError(json.errors.map((e: { message: string }) => e.message).join('; '))
  }
  return json.data as T
}
