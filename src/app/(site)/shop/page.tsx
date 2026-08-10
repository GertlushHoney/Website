import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getHoneyProducts } from '@/lib/sanity/products'
import { getMerchProductsByCategory, MERCH_CATEGORY_LABELS, type MerchCategory } from '@/lib/sanity/merch'
import { urlForImage } from '@/lib/sanity/image'

export const metadata: Metadata = {
  title: 'Shop',
  description:
    'Gert Lush Honey — postcode honey, candles, soap, lip balm, gift hampers and experiences.',
}

// Six categories, six tiles — a deliberate even number for the grid (was
// five before Experiences existed, which left an unbalanced last row).
const MERCH_CATEGORIES: MerchCategory[] = ['candles', 'hamper', 'soap', 'lip-balm', 'experiences']

// Real, purpose-made tile photography — takes priority over a real
// product's own hero photo, since these are composed specifically for the
// shop tile rather than being a single product's listing image. See
// docs/brand-alignment-board.md. The Candles/Soap/Lip Balm images
// (2026-08-10, from Media/{Candles,Soap,Lip Balm}, already feathered) are
// isolated product-style cutouts, shown with padding like a jar photo;
// Experiences uses the existing real Bramble Farm landscape photo (already
// on the Experiences page itself), which needs a full-bleed crop instead —
// hence the separate `fit` per entry rather than one blanket rule.
const HOME_TILE_IMAGE: Partial<Record<MerchCategory, { src: string; fit: 'contain' | 'cover' }>> = {
  candles: { src: '/images/shop-tiles/candles-home-tile.png', fit: 'contain' },
  soap: { src: '/images/shop-tiles/soap-home-tile.png', fit: 'contain' },
  'lip-balm': { src: '/images/shop-tiles/lip-balm-home-tile.png', fit: 'contain' },
  experiences: { src: '/images/source/bramble-farm-view.jpg', fit: 'cover' },
}

// Gift Hampers has no real product or curated tile photo yet — rather than
// invent a "finished product" shot, this is an abstract ingredient/material
// flat-lay (Higgsfield, 2026-08-10), deliberately showing no wrapped
// hamper. Replace with a real photo the moment one exists.
const PLACEHOLDER_IMAGE: Partial<Record<MerchCategory, string>> = {
  hamper: '/images/shop-tiles/gift-hamper-materials.png',
}

// Every tile shows the same kind of subtitle — a plain count, never a
// specific product's tagline (even when there's only one) — so all six
// read consistently at a glance.
function availabilitySubtitle(count: number) {
  return count > 0 ? `${count} available` : 'Coming soon'
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
      subtitle: availabilitySubtitle(honeyProducts.length),
      imageUrl: honeyImageUrl,
      objectFit: 'contain' as const,
    },
    ...merchTiles.map(({ category, label, products }) => {
      const single = products.length === 1 ? products[0] : null
      const realImageUrl = single
        ? (urlForImage(single.heroImage ?? undefined)?.width(600).height(600).url() ?? null)
        : null
      const homeTile = HOME_TILE_IMAGE[category] ?? null
      return {
        href: `/shop/${category}`,
        label,
        subtitle: availabilitySubtitle(products.length),
        imageUrl: homeTile?.src ?? realImageUrl ?? PLACEHOLDER_IMAGE[category] ?? null,
        objectFit: homeTile ? homeTile.fit : realImageUrl ? ('contain' as const) : ('cover' as const),
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
