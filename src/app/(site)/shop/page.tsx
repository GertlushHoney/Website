import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getHoneyProducts } from '@/lib/sanity/products'
import { getMerchProductBySlug } from '@/lib/sanity/merch'
import { urlForImage } from '@/lib/sanity/image'
import { getProductByHandle } from '@/lib/shopify/product'
import { getAreaNameForCode } from '@/lib/postcode-areas'

export const metadata: Metadata = {
  title: 'Shop',
  description: 'Gert Lush Honey postcode honey, and what else is coming.',
}

const MERCH_SLUGS = ['candles', 'hamper', 'soap', 'lip-balm'] as const
const MERCH_LABELS: Record<(typeof MERCH_SLUGS)[number], string> = {
  candles: 'Candles',
  hamper: 'Gift Hampers',
  soap: 'Soap',
  'lip-balm': 'Lip Balm',
}

export default async function ShopPage() {
  const products = await getHoneyProducts()
  const cards = await Promise.all(
    products.map(async (product) => ({
      product,
      shopifyProduct: await getProductByHandle(product.shopifyHandle),
      imageUrl: urlForImage(product.heroImage ?? undefined)?.width(400).height(400).url() ?? null,
    }))
  )

  const merchTiles = await Promise.all(
    MERCH_SLUGS.map(async (slug) => ({
      slug,
      label: MERCH_LABELS[slug],
      product: await getMerchProductBySlug(slug),
    }))
  )

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-porcelain text-3xl font-bold tracking-tight">Shop</h1>
      <p className="text-porcelain/60 mt-2 max-w-lg text-sm">
        {cards.length === 1
          ? 'One postcode honey so far — more will join as new beekeepers come on board.'
          : 'Postcode honey, sourced from independent beekeepers across Britain.'}
      </p>

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

      {merchTiles.some((tile) => tile.product) && (
        <p className="text-porcelain/50 mt-16 text-xs">More from Gert Lush:</p>
      )}
      {merchTiles.every((tile) => !tile.product) && (
        <>
          <h2 className="text-porcelain mt-16 text-xl font-bold tracking-tight">Coming soon</h2>
          <p className="text-porcelain/60 mt-1 max-w-lg text-sm">
            More than honey, eventually — nothing here is for sale until it&apos;s real.
          </p>
        </>
      )}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {merchTiles.map(({ slug, label, product }) => (
          <Link
            key={slug}
            href={`/shop/${slug}`}
            className="border-ink-line bg-honeycomb-surface hover:border-honey-amber focus-visible:outline-honey-amber rounded-xl border p-5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-offset-2"
          >
            <span className="text-porcelain">{product ? product.name : label}</span>
            <span className="text-porcelain/50 mt-1 block text-xs font-normal">
              {product ? product.tagline : 'Coming soon'}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
