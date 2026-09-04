import Image from 'next/image'
import Link from 'next/link'
import { getProductByHandle } from '@/lib/shopify/product'
import { urlForImage } from '@/lib/sanity/image'
import type { MerchProductSummary } from '@/lib/sanity/merch'
import { BackToCategoryLink } from '@/components/shop/back-to-category-link'

// A category page (e.g. /shop/candles) once it has one or more real,
// active products — each links to its own page at /shop/[slug].
export async function MerchCategoryListing({
  categoryLabel,
  products,
  notice,
}: {
  categoryLabel: string
  products: MerchProductSummary[]
  // Optional category-specific callout (e.g. a bundle offer) — shown below
  // the heading, above the product grid.
  notice?: React.ReactNode
}) {
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
        Shop &middot; {categoryLabel}
      </p>
      <h1 className="text-porcelain mt-3 text-3xl font-bold tracking-tight">{categoryLabel}</h1>
      {notice}

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
                  alt={product.name}
                  fill
                  sizes="400px"
                  className="object-contain p-10 transition group-hover:scale-105"
                />
              )}
            </div>
            <div className="p-6">
              <p className="font-display text-comb-gold text-lg italic">{product.name}</p>
              <p className="text-porcelain mt-1 text-sm font-semibold">{product.tagline}</p>
              {product.weight && <p className="text-porcelain/50 mt-1 text-sm">{product.weight}</p>}
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
