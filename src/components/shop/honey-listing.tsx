import Image from 'next/image'
import Link from 'next/link'
import { getHoneyProducts } from '@/lib/sanity/products'
import { getProductByHandle } from '@/lib/shopify/product'
import { urlForImage } from '@/lib/sanity/image'
import { getAreaNameForCode } from '@/lib/postcode-areas'
import { SurpriseMeButton } from '@/components/shop/surprise-me-button'
import { BackToCategoryLink } from '@/components/shop/back-to-category-link'

// The Honey category page (/shop/honey) — same card-grid pattern as
// MerchCategoryListing, plus the postcode-map and surprise-me shortcuts
// that only make sense for a multi-product, location-tied category.
export async function HoneyListing() {
  const products = await getHoneyProducts()
  const cards = await Promise.all(
    products.map(async (product) => ({
      product,
      shopifyProduct: await getProductByHandle(product.shopifyHandle),
      imageUrl: urlForImage(product.heroImage ?? undefined)?.width(400).height(400).url() ?? null,
    }))
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
          <SurpriseMeButton slugs={cards.map(({ product }) => product.slug)} />
        </div>
      )}

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {cards.map(({ product, shopifyProduct, imageUrl }) => (
          <Link
            key={product._id}
            href={`/shop/${product.slug}`}
            className="border-ink-line bg-honeycomb-surface focus-visible:outline-honey-amber group grid gap-0 overflow-hidden rounded-2xl border transition focus-visible:outline focus-visible:outline-offset-4"
          >
            <div className="from-ink-surface to-ink relative aspect-square bg-gradient-to-b">
              {imageUrl && (
                <Image
                  src={imageUrl}
                  alt={`A jar of ${product.name} honey`}
                  fill
                  sizes="400px"
                  className="object-contain p-10 transition group-hover:scale-105"
                />
              )}
            </div>
            <div className="p-6">
              <p className="font-display text-comb-gold text-lg italic">{product.name}</p>
              <p className="text-porcelain mt-1 text-sm font-semibold">{product.tagline}</p>
              <p className="text-porcelain/50 mt-1 text-sm">
                {product.weight} &middot; {getAreaNameForCode(product.postcodeCode) ?? product.postcodeCode}, UK
              </p>
              {shopifyProduct && (
                <p className="text-porcelain mt-3 text-base font-semibold">
                  {new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(
                    shopifyProduct.price
                  )}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
