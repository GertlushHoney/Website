// Shopify Admin API — a deliberate, narrow exception to this codebase's
// otherwise Storefront-API-only rule (see docs/technical-architecture.md,
// "Security boundaries"). The ONLY thing this client is used for is
// tagging a customer with which sold-out product they want a restock
// alert for (src/lib/shopify/restock.ts) — nothing else in this codebase
// touches the Admin API. Never import this file from a client component;
// every caller must be a 'use server' function.
//
// Apps created via Shopify's Dev Dashboard (the only way to create a new
// custom app since Shopify retired the old in-admin "Develop apps" flow
// on 2026-01-01) don't hand you a static, copyable Admin API token the
// way legacy custom apps used to. Instead you get a Client ID + Client
// secret (Dev Dashboard → your app → Settings), and exchange them for a
// short-lived (24h) access token via the OAuth client_credentials grant
// — see https://shopify.dev/docs/apps/build/dev-dashboard/get-api-access-tokens.
// This client fetches and caches that token itself; callers never see it.
const API_VERSION = '2026-04'

const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN
const clientId = process.env.SHOPIFY_ADMIN_CLIENT_ID
const clientSecret = process.env.SHOPIFY_ADMIN_CLIENT_SECRET

export function isShopifyAdminConfigured(): boolean {
  return Boolean(domain && clientId && clientSecret)
}

export class ShopifyAdminError extends Error {}

// Module-level cache: reused across requests within the same warm
// server instance. If a cold start or a different instance handles the
// next request, it just fetches a fresh token — an occasional extra
// round trip, never a correctness problem.
let cachedToken: string | null = null
let cachedTokenExpiresAt = 0

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedTokenExpiresAt - 60_000) {
    return cachedToken
  }

  const res = await fetch(`https://${domain}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId!,
      client_secret: clientSecret!,
    }),
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new ShopifyAdminError(`Shopify Admin token exchange failed: ${res.status}`)
  }

  const json = (await res.json()) as { access_token: string; expires_in: number }
  cachedToken = json.access_token
  cachedTokenExpiresAt = Date.now() + json.expires_in * 1000
  return cachedToken
}

export async function shopifyAdminFetch<T>(params: {
  query: string
  variables?: Record<string, unknown>
}): Promise<T> {
  if (!isShopifyAdminConfigured()) {
    throw new ShopifyAdminError('Shopify Admin API is not configured')
  }

  const token = await getAccessToken()

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
