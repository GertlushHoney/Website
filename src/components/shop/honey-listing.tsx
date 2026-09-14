import Link from 'next/link'
import { getHoneyProductsWithBeekeeper } from '@/lib/sanity/products'
import { getProductsByHandles } from '@/lib/shopify/product'
import { urlForImage } from '@/lib/sanity/image'
import { getRegionForCode } from '@/lib/uk-regions'
import { getApprovedReviewsForSlugs, averageRating } from '@/lib/sanity/reviews'
import { SurpriseMeButton } from '@/components/shop/surprise-me-button'
import { BackToCategoryLink } from '@/components/shop/back-to-category-link'
import { HoneyRegionFilter, type HoneyCard } from '@/components/shop/honey-region-filter'

// The Honey category page (/shop/honey) — same card-grid pattern as
// MerchCategoryListing, plus the postcode-map, region filter and
// surprise-me shortcuts that only make sense for a multi-product,
// location-tied category.
//
// Shopify price/stock and Sanity reviews are both fetched in one batched
// call each, covering every product on the page — not one call per
// product. See "REVIEW PERFORMANCE AS PRODUCT COUNT GROWS" audit,
// 2026-09-13: with N honeys, the previous Promise.all(products.map(...))
// fired 2N separate network requests (N to Shopify, N to Sanity) on every
// render — fine at 2-3 products, a real scaling concern once this range
// reaches the 20-50 honeys the site is meant to handle.
export async function HoneyListing() {
  const products = await getHoneyProductsWithBeekeeper()
  const [shopifyProducts, reviewsBySlug] = await Promise.all([
    getProductsByHandles(products.map((product) => product.shopifyHandle)),
    getApprovedReviewsForSlugs(products.map((product) => product.slug)),
  ])
  const cards: HoneyCard[] = products.map((product) => {
    const shopifyProduct = shopifyProducts[product.shopifyHandle] ?? null
    const reviews = reviewsBySlug[product.slug] ?? []
    return {
      id: product._id,
      slug: product.slug,
      name: product.name,
      tagline: product.tagline,
      weight: product.weight,
      postcodeCode: product.postcodeCode,
      region: getRegionForCode(product.postcodeCode),
      imageUrl: urlForImage(product.heroImage ?? undefined)?.width(400).height(400).url() ?? null,
      price: shopifyProduct?.price ?? null,
      beekeeper: product.beekeeper,
      flavour: product.flavour,
      averageReviewRating: averageRating(reviews),
      reviewCount: reviews.length,
    }
  })

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <BackToCategoryLink href="/shop" label="Shop" />

      <p className="text-honey-amber mt-6 text-sm font-semibold tracking-wide uppercase">
        Shop &middot; Honey
      </p>
      <h1 className="text-porcelain mt-3 text-3xl font-bold tracking-tight">Honey</h1>
      <p className="text-porcelain/60 mt-2 max-w-lg text-sm">
        {cards.length === 1
          ? 'One postcode honey so far — more will join as new beekeepers come on board.'
          : 'Postcode honey, sourced from independent beekeepers across Britain.'}
      </p>

      {cards.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            href="/postcode-honey"
            className="bg-honey-amber text-ink focus-visible:outline-porcelain rounded-full px-6 py-2.5 text-sm font-semibold focus-visible:outline focus-visible:outline-offset-4"
          >
            Choose a honey by postcode
          </Link>
          <SurpriseMeButton slugs={cards.map((card) => card.slug)} />
        </div>
      )}

      <HoneyRegionFilter cards={cards} />
    </div>
  )
}
