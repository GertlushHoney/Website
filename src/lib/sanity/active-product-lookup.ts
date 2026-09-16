import { groq } from 'next-sanity'
import { sanityFetch } from './client'

// The server's own proof that a Shopify product handle belongs to a real,
// active Gert Lush product — never the client's say-so. Same "try honey
// first, then merch" order as /shop/[slug]/page.tsx and
// getActiveProductName in reviews.ts (which does the equivalent lookup by
// slug, for review submissions) — a separate function rather than a
// shared one because the two callers key on genuinely different fields
// (a product's own slug vs. its Shopify handle), not because the intent
// differs. Used by restock.ts so a restock:<handle> tag can't be created
// for a handle that doesn't correspond to anything Gert Lush actually
// sells. See "SECURE RESTOCK ALERT SUBMISSION" audit, 2026-09-15.
export async function getActiveProductNameByShopifyHandle(
  shopifyHandle: string
): Promise<string | null> {
  const honeyName = await sanityFetch<string>(
    groq`*[_type == "honeyProduct" && shopifyHandle == $shopifyHandle && active == true][0].name`,
    { shopifyHandle }
  )
  if (honeyName) return honeyName

  const merchName = await sanityFetch<string>(
    groq`*[_type == "merchProduct" && shopifyHandle == $shopifyHandle && active == true][0].name`,
    { shopifyHandle }
  )
  return merchName ?? null
}

export type ReviewableProduct = { name: string; slug: string }

// A real order is never anywhere near this many distinct products —
// caps an arbitrarily long list from a hand-crafted /thank-you URL
// (see route usage) rather than trusting the query param's length.
const MAX_REVIEW_NUDGE_HANDLES = 5

// Resolves the handful of Shopify handles from an order-confirmation
// email link into real, active, reviewable products — used by the
// post-checkout "leave a review" nudge on /thank-you. Same trust
// boundary as getActiveProductNameByShopifyHandle above (never assume a
// URL query param names a real product), batched into one query per
// document type instead of one round trip per handle.
export async function getActiveProductsByShopifyHandles(
  shopifyHandles: string[]
): Promise<ReviewableProduct[]> {
  const handles = [...new Set(shopifyHandles)].filter(Boolean).slice(0, MAX_REVIEW_NUDGE_HANDLES)
  if (handles.length === 0) return []

  const [honeyMatches, merchMatches] = await Promise.all([
    sanityFetch<ReviewableProduct[]>(
      groq`*[_type == "honeyProduct" && shopifyHandle in $handles && active == true]{ name, "slug": slug.current }`,
      { handles }
    ),
    sanityFetch<ReviewableProduct[]>(
      groq`*[_type == "merchProduct" && shopifyHandle in $handles && active == true]{ name, "slug": slug.current }`,
      { handles }
    ),
  ])
  return [...(honeyMatches ?? []), ...(merchMatches ?? [])]
}
