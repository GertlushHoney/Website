import { getHoneyProducts } from './sanity/products'
import { getAllMerchProducts, MERCH_CATEGORY_LABELS } from './sanity/merch'
import { urlForImage } from './sanity/image'

export type SearchItem = {
  id: string
  name: string
  tagline: string
  category: string
  href: string
  imageUrl: string | null
}

// The whole real catalogue, flattened into one simple list — small enough
// at this catalogue size to fetch once server-side and filter client-side
// as the customer types, rather than a real search index/API round-trip
// per keystroke. Revisit once the catalogue is large enough that this
// stops being trivially cheap.
export async function getSearchIndex(): Promise<SearchItem[]> {
  const [honeyProducts, merchProducts] = await Promise.all([
    getHoneyProducts(),
    getAllMerchProducts(),
  ])

  const honeyItems: SearchItem[] = honeyProducts.map((p) => ({
    id: p._id,
    name: p.name,
    tagline: p.tagline,
    category: 'Honey',
    href: `/shop/${p.slug}`,
    imageUrl: urlForImage(p.heroImage ?? undefined)?.width(160).height(160).url() ?? null,
  }))

  const merchItems: SearchItem[] = merchProducts.map((p) => ({
    id: p._id,
    name: p.name,
    tagline: p.tagline,
    category: MERCH_CATEGORY_LABELS[p.category],
    href: `/shop/${p.slug}`,
    imageUrl: urlForImage(p.heroImage ?? undefined)?.width(160).height(160).url() ?? null,
  }))

  return [...honeyItems, ...merchItems]
}
