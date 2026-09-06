import type { Metadata } from 'next'
import { getHoneyProducts } from '@/lib/sanity/products'
import { getMerchProductsByCategory, MERCH_CATEGORY_LABELS, type MerchCategory } from '@/lib/sanity/merch'
import { getShopTiles } from '@/lib/sanity/shop-tiles'
import { urlForImage } from '@/lib/sanity/image'
import { ShopTilesView } from '@/components/shop/shop-tiles-view'

export const metadata: Metadata = {
  title: 'Shop',
  description:
    'Gert Lush Honey — postcode honey, candles, soap, lip balm, gift hampers and experiences.',
  alternates: { canonical: '/shop' },
}

// Six categories, six tiles — a deliberate even number for the grid (was
// five before Experiences existed, which left an unbalanced last row).
const MERCH_CATEGORIES: MerchCategory[] = ['candles', 'hamper', 'soap', 'lip-balm', 'experiences']

// Fallback tile photography, used until an editor creates a matching
// Sanity "Shop Tile" document (getShopTiles(), which always wins when
// present) — so the grid never goes blank while nobody's set one up yet.
// All five (2026-08-10/11, from Media/{Candles,Soap,Lip Balm,Experiences}/
// gift-hamper-materials, feathered via scripts/feather-product-image.mjs)
// are isolated product-style cutouts, shown with padding rather than a
// full-bleed crop. Hamper has no real product yet, so it's deliberately
// an abstract ingredient/material flat-lay rather than a "finished
// product" shot.
const DEFAULT_TILE_IMAGE: Partial<Record<MerchCategory, { src: string; fit: 'contain' | 'cover' }>> = {
  candles: { src: '/images/shop-tiles/candles-home-tile.png', fit: 'contain' },
  hamper: { src: '/images/shop-tiles/hamper-home-tile.png', fit: 'contain' },
  soap: { src: '/images/shop-tiles/soap-home-tile.png', fit: 'contain' },
  'lip-balm': { src: '/images/shop-tiles/lip-balm-home-tile.png', fit: 'contain' },
  experiences: { src: '/images/shop-tiles/experiences-home-tile.png', fit: 'contain' },
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
  const [honeyProducts, shopTiles, merchTiles] = await Promise.all([
    getHoneyProducts(),
    getShopTiles(),
    Promise.all(
      MERCH_CATEGORIES.map(async (category) => ({
        category,
        label: MERCH_CATEGORY_LABELS[category],
        products: await getMerchProductsByCategory(category),
      }))
    ),
  ])

  const honeyOverride = shopTiles.honey ?? null
  const honeyImageUrl =
    honeyOverride?.imageUrl ??
    (honeyProducts[0]
      ? (urlForImage(honeyProducts[0].heroImage ?? undefined)?.width(600).height(600).url() ?? null)
      : null)

  const tiles = [
    honeyOverride?.active === false
      ? null
      : {
          href: '/shop/honey',
          label: honeyOverride?.label ?? 'Honey',
          subtitle: availabilitySubtitle(honeyProducts.length),
          imageUrl: honeyImageUrl,
          objectFit: honeyOverride?.fit ?? 'contain',
        },
    ...merchTiles.map(({ category, label, products }) => {
      const override = shopTiles[category] ?? null
      if (override?.active === false) return null
      const single = products.length === 1 ? products[0] : null
      const realImageUrl = single
        ? (urlForImage(single.heroImage ?? undefined)?.width(600).height(600).url() ?? null)
        : null
      const defaultTile = DEFAULT_TILE_IMAGE[category] ?? null
      return {
        href: `/shop/${category}`,
        label: override?.label ?? label,
        subtitle: availabilitySubtitle(products.length),
        imageUrl: override?.imageUrl ?? defaultTile?.src ?? realImageUrl ?? null,
        objectFit:
          override?.imageUrl != null
            ? override.fit
            : defaultTile
              ? defaultTile.fit
              : realImageUrl
                ? ('contain' as const)
                : ('cover' as const),
      }
    }),
  ].filter((tile) => tile !== null)

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-porcelain text-3xl font-bold tracking-tight">Shop</h1>
      <p className="text-porcelain/60 mt-2 max-w-lg text-sm">
        Small-batch honey, and more from Gert Lush as it becomes real.
      </p>

      <div className="mt-12">
        <ShopTilesView tiles={tiles} />
      </div>
    </div>
  )
}
