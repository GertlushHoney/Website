import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getHoneyProducts } from '@/lib/sanity/products'
import { getMerchProductsByCategory, MERCH_CATEGORY_LABELS, type MerchCategory } from '@/lib/sanity/merch'
import { urlForImage } from '@/lib/sanity/image'

export const metadata: Metadata = {
  title: 'Shop',
  description: 'Gert Lush Honey — postcode honey, candles, soap, lip balm and gift hampers.',
}

const MERCH_CATEGORIES: MerchCategory[] = ['candles', 'hamper', 'soap', 'lip-balm']

// Categories with no real product yet have no real photo either — rather
// than invent a "finished product" shot, these are abstract ingredient/
// material flat-lays (Higgsfield, 2026-08-10), deliberately showing no
// soap bar, lip balm tube or wrapped hamper. Deliberately no entry for
// candles — it already has a real product photo; if that ever changes, the
// tile should show no image rather than a wrong placeholder.
const PLACEHOLDER_IMAGE: Partial<Record<MerchCategory, string>> = {
  hamper: '/images/shop-tiles/gift-hamper-materials.png',
  soap: '/images/shop-tiles/soap-ingredients.png',
  'lip-balm': '/images/shop-tiles/lip-balm-ingredients.png',
}

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

  const honeyImageUrl = honeyProducts[0]
    ? (urlForImage(honeyProducts[0].heroImage ?? undefined)?.width(600).height(600).url() ?? null)
    : null

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
      imageUrl: honeyImageUrl,
      objectFit: 'contain' as const,
    },
    ...merchTiles.map(({ category, label, products }) => {
      const single = products.length === 1 ? products[0] : null
      const realImageUrl = single
        ? (urlForImage(single.heroImage ?? undefined)?.width(600).height(600).url() ?? null)
        : null
      return {
        href: `/shop/${category}`,
        label,
        subtitle: single
          ? (single.tagline ?? single.name)
          : products.length > 1
            ? `${products.length} available`
            : 'Coming soon',
        imageUrl: realImageUrl ?? PLACEHOLDER_IMAGE[category] ?? null,
        objectFit: realImageUrl ? ('contain' as const) : ('cover' as const),
      }
    }),
  ]

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-porcelain text-3xl font-bold tracking-tight">Shop</h1>
      <p className="text-porcelain/60 mt-2 max-w-lg text-sm">
        Small-batch honey, and more from Gert Lush as it becomes real.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((tile) => (
          <Link
            key={tile.href}
            href={tile.href}
            className="border-ink-line bg-honeycomb-surface hover:border-honey-amber focus-visible:outline-honey-amber group grid overflow-hidden rounded-2xl border transition focus-visible:outline focus-visible:outline-offset-2"
          >
            <div className="from-ink-surface to-ink relative aspect-square bg-gradient-to-b">
              {tile.imageUrl && (
                <Image
                  src={tile.imageUrl}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className={
                    tile.objectFit === 'contain'
                      ? 'object-contain p-10 transition group-hover:scale-105'
                      : 'object-cover transition group-hover:scale-105'
                  }
                />
              )}
            </div>
            <div className="p-5">
              <span className="text-porcelain text-lg font-semibold">{tile.label}</span>
              <span className="text-porcelain/50 mt-1 block text-xs">{tile.subtitle}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
