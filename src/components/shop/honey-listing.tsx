import Link from 'next/link'
import { getHoneyProductsWithBeekeeper } from '@/lib/sanity/products'
import { getProductByHandle } from '@/lib/shopify/product'
import { urlForImage } from '@/lib/sanity/image'
import { getRegionForCode } from '@/lib/uk-regions'
import { SurpriseMeButton } from '@/components/shop/surprise-me-button'
import { BackToCategoryLink } from '@/components/shop/back-to-category-link'
import { HoneyRegionFilter, type HoneyCard } from '@/components/shop/honey-region-filter'

// The Honey category page (/shop/honey) — same card-grid pattern as
// MerchCategoryListing, plus the postcode-map, region filter and
// surprise-me shortcuts that only make sense for a multi-product,
// location-tied category.
export async function HoneyListing() {
  const products = await getHoneyProductsWithBeekeeper()
  const cards: HoneyCard[] = await Promise.all(
    products.map(async (product) => {
      const shopifyProduct = await getProductByHandle(product.shopifyHandle)
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
      }
    })
  )

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
