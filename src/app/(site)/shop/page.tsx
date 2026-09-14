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
//
// Order follows the commercial hierarchy honey sits atop, not creation
// date: hampers (gifting, built around honey) before the standalone hive
// products (candles/soap/lip balm), which come before experiences
// (education) last. See "PRESERVE THE BRAND RULE" audit, 2026-09-13 — if
// honey disappeared, none of these should still make sense on their own,
// so none are ever removed, but they orbit honey rather than sit level
// with it.
const MERCH_CATEGORIES: MerchCategory[] = ['hamper', 'candles', 'soap', 'lip-balm', 'experiences']

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

// Each tile's subtitle names what the count actually is, rather than
// claiming "available" — this count is just how many active product
// documents exist in Sanity for the category (getHoneyProducts /
// getMerchProductsByCategory both just filter on `active == true`), never
// checked against each product's real Shopify stock/availableForSale. A
// category could show "4 soap scents" here while one of those four is
// individually sold out on its own page — that's fine, since the label
// never claims real-time purchasable availability in the first place.
// Hampers and Experiences get a fixed, category-appropriate action phrase
// instead of a count: a hamper "product" count doesn't mean much (they
// only differ by jar size), and an Experience's real availability is
// per-session places, not how many Experience products exist. See "FIX
// CATEGORY AVAILABILITY LABELS" audit, 2026-09-13.
function categorySubtitle(category: 'honey' | MerchCategory, count: number): string {
  if (count === 0) return 'Coming soon'
  switch (category) {
    case 'honey':
      return `${count} ${count === 1 ? 'honey' : 'honeys'}`
    case 'candles':
      return `${count} candle design${count === 1 ? '' : 's'}`
    case 'soap':
      return `${count} soap scent${count === 1 ? '' : 's'}`
    case 'lip-balm':
      return `${count} lip balm flavour${count === 1 ? '' : 's'}`
    case 'hamper':
      // Nudges the hamper tile toward honey rather than reading as an
      // unrelated gift category — see "REFINE SHOP HIERARCHY" audit,
      // 2026-09-15 (the commercial hierarchy in CLAUDE.md: hampers are
      // built around honey, never given equal top billing with it).
      return 'Start with your honey'
    case 'experiences':
      return 'View experiences'
  }
}

// One tile per category, all built the same way structurally (a tile
// here, a listing page with however many real products exist, then each
// product's own page — see BackToCategoryLink for the way back). Honey is
// still the natural starting point: it's placed first in `tiles` below so
// it's the carousel's default/front item, and its copy leads the intro
// paragraph — see "REFINE SHOP HIERARCHY" audit, 2026-09-15. The other
// categories aren't downgraded, just positioned as orbiting honey rather
// than competing with it, per the commercial hierarchy in CLAUDE.md.
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
          subtitle: categorySubtitle('honey', honeyProducts.length),
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
        subtitle: categorySubtitle(category, products.length),
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
        Start with the honey, then discover gifts, products from the hive and experiences
        inspired by the bees behind every jar.
      </p>

      <div className="mt-12">
        <ShopTilesView tiles={tiles} />
      </div>
    </div>
  )
}
