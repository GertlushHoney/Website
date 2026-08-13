import { groq } from 'next-sanity'
import { sanityFetch } from './client'
import { urlForImage } from './image'
import type { MerchCategory } from './merch'
import type { SanityImageSource } from '@sanity/image-url'

export type ShopTileCategory = 'honey' | MerchCategory

type RawShopTile = {
  category: ShopTileCategory
  label: string | null
  image: SanityImageSource | null
  fit: 'contain' | 'cover' | null
}

export type ShopTileOverride = {
  label: string | null
  imageUrl: string | null
  fit: 'contain' | 'cover'
}

// Editor-controlled overrides for the /shop grid tiles — never all six at
// once necessarily, since a category without a document just falls back
// to the page's own default (see shop/page.tsx). Returns a lookup by
// category rather than a raw list so the page doesn't need to search it.
export async function getShopTiles(): Promise<Partial<Record<ShopTileCategory, ShopTileOverride>>> {
  const result = await sanityFetch<RawShopTile[]>(
    groq`*[_type == "shopTile"]{ category, label, image, fit }`
  )

  const map: Partial<Record<ShopTileCategory, ShopTileOverride>> = {}
  for (const tile of result ?? []) {
    map[tile.category] = {
      label: tile.label || null,
      imageUrl: urlForImage(tile.image ?? undefined)?.width(600).height(600).url() ?? null,
      fit: tile.fit ?? 'contain',
    }
  }
  return map
}
