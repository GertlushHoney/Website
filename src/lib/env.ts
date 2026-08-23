import { z } from 'zod'

/**
 * Every credential here is optional at the schema level. Shopify and Sanity
 * projects do not exist yet (see /docs/launch-checklist.md), so the app must
 * boot and render with mocked data until real values are supplied in
 * .env.local. hasShopifyCredentials / hasSanityCredentials tell callers
 * which mode they're in.
 */
const envSchema = z.object({
  NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN: z.string().min(1).optional(),
  SHOPIFY_STOREFRONT_ACCESS_TOKEN: z.string().min(1).optional(),
  NEXT_PUBLIC_SANITY_PROJECT_ID: z.string().min(1).optional(),
  NEXT_PUBLIC_SANITY_DATASET: z.string().min(1).default('production'),
  SANITY_API_READ_TOKEN: z.string().min(1).optional(),
  // Deliberately not z.string().url() — a malformed value here (e.g. missing
  // the https:// scheme, a typo made directly in Vercel's env var settings)
  // must not throw at module load and take down every page on the site over
  // what's only ever used for canonical URLs/sitemap/JSON-LD. site-config.ts
  // validates and falls back safely instead.
  NEXT_PUBLIC_SITE_URL: z.string().min(1).optional(),
})

const parsed = envSchema.safeParse({
  NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN: process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN,
  SHOPIFY_STOREFRONT_ACCESS_TOKEN: process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN,
  NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET,
  SANITY_API_READ_TOKEN: process.env.SANITY_API_READ_TOKEN,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
})

if (!parsed.success) {
  throw new Error(`Invalid environment variables: ${parsed.error.message}`)
}

export const env = parsed.data

export const hasShopifyCredentials = Boolean(
  env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN && env.SHOPIFY_STOREFRONT_ACCESS_TOKEN
)

export const hasSanityCredentials = Boolean(
  env.NEXT_PUBLIC_SANITY_PROJECT_ID && env.SANITY_API_READ_TOKEN
)
