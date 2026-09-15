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
