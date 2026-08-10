import type { Metadata } from 'next'
import Link from 'next/link'
import { getHoneyProducts } from '@/lib/sanity/products'
import { getMerchProductsByCategory, MERCH_CATEGORY_LABELS, type MerchCategory } from '@/lib/sanity/merch'

export const metadata: Metadata = {
  title: 'Shop',
  description: 'Gert Lush Honey — postcode honey, candles, soap, lip balm and gift hampers.',
}

const MERCH_CATEGORIES: MerchCategory[] = ['candles', 'hamper', 'soap', 'lip-balm']

// One tile per category (honey included, not given special treatment) so
// every category behaves the same way: a tile here, a listing page with
// however many real products exist, then each product's own page. Product
// pages link back to their category listing — see BackToCategoryLink.
export default async function ShopPage() {
  const honeyProducts = await getHoneyProducts()
  const merchTiles = await Promise.all(
    MERCH_CATEGORIES.map(async (category) => ({
      category,
      label: MERCH_CATEGORY_LABELS[category],
      products: await getMerchProductsByCategory(category),
    }))
  )

  const tiles = [
    {
      href: '/shop/honey',
      label: 'Honey',
      subtitle:
        honeyProducts.length === 1
          ? (honeyProducts[0].tagline ?? honeyProducts[0].name)
          : honeyProducts.length > 1
            ? `${honeyProducts.length} available`
            : 'Coming soon',
    },
    ...merchTiles.map(({ category, label, products }) => {
      const single = products.length === 1 ? products[0] : null
      return {
        href: `/shop/${category}`,
        label,
        subtitle: single
          ? (single.tagline ?? single.name)
          : products.length > 1
            ? `${products.length} available`
            : 'Coming soon',
      }
    }),
  ]

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-porcelain text-3xl font-bold tracking-tight">Shop</h1>
      <p className="text-porcelain/60 mt-2 max-w-lg text-sm">
        Small-batch honey, and more from Gert Lush as it becomes real.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((tile) => (
          <Link
            key={tile.href}
            href={tile.href}
            className="border-ink-line bg-honeycomb-surface hover:border-honey-amber focus-visible:outline-honey-amber rounded-xl border p-6 text-sm font-semibold transition focus-visible:outline focus-visible:outline-offset-2"
          >
            <span className="text-porcelain text-lg">{tile.label}</span>
            <span className="text-porcelain/50 mt-1 block text-xs font-normal">{tile.subtitle}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
