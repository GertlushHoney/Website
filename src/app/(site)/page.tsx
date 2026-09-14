import type { Metadata } from 'next'
import { Hero } from '@/components/homepage/hero'
import { FeaturedProduct, type FeaturedProductData } from '@/components/homepage/featured-product'
import { PostcodeHoney } from '@/components/homepage/postcode-honey'
import { WhatIsGertLush } from '@/components/homepage/what-is-gert-lush'
import { GertLushStandardStrip } from '@/components/homepage/gert-lush-standard-strip'
import { TrustRow } from '@/components/homepage/trust-row'
import { SupplierCtaBanner } from '@/components/homepage/supplier-cta-banner'
import { getHoneyProductsWithBeekeeper } from '@/lib/sanity/products'
import { getProductsByHandles } from '@/lib/shopify/product'
import { urlForImage } from '@/lib/sanity/image'
import { getAreaNameForCode } from '@/lib/postcode-areas'

export const metadata: Metadata = {
  alternates: { canonical: '/' },
}

// Dark/moody theme, brand-generic narrative (2026-08-07 direction change) —
// not the full 12-section homepage in Development Plan Phase 4 yet.
// See /docs/implementation-roadmap.md.
//
// Homepage restructure (2026-08-27), agreed step-by-step in response to
// independent review feedback (John Hutchinson): hero copy names the
// beekeeper up front, WhatIsGertLush ("How Gert Lush works") resolves the
// single-farm/umbrella-brand/marketplace ambiguity, and FeaturedProduct now
// leads with postcode+beekeeper rather than postcode alone. TrustRow and
// SupplierCtaBanner were the two model-agnostic wins from the earlier
// preview pass, kept as part of the same homepage.
export default async function Home() {
  const honeyProducts = await getHoneyProductsWithBeekeeper()
  // One batched Shopify request for every honey's price, not one request
  // per honey — the homepage only ever displays a single random pick
  // (FeaturedProduct re-rolls client-side), but until this fix it fetched
  // live Shopify data for *all* of them on every single homepage visit.
  // See "REVIEW PERFORMANCE AS PRODUCT COUNT GROWS" audit, 2026-09-13.
  const shopifyProducts = await getProductsByHandles(
    honeyProducts.map((product) => product.shopifyHandle)
  )
  const featuredProducts: FeaturedProductData[] = honeyProducts.map((product) => {
    const shopifyProduct = shopifyProducts[product.shopifyHandle] ?? null
    return {
      slug: product.slug,
      name: product.name,
      tagline: product.tagline,
      weight: product.weight,
      origin: getAreaNameForCode(product.postcodeCode) ?? product.postcodeCode,
      postcodeCode: product.postcodeCode,
      imageUrl: urlForImage(product.heroImage ?? undefined)?.width(900).height(1200).url() ?? null,
      price: shopifyProduct?.price ?? null,
      beekeeper: product.beekeeper,
      latestSeasonYear: product.latestSeasonYear,
      flavour: product.flavour,
    }
  })

  return (
    <>
      <Hero />
      <WhatIsGertLush />
      <FeaturedProduct products={featuredProducts} />
      <GertLushStandardStrip />
      <PostcodeHoney />
      <TrustRow />
      <SupplierCtaBanner />
    </>
  )
}
