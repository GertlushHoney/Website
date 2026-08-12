import { groq } from 'next-sanity'
import { sanityFetch } from './client'
import type { PortableTextBlock } from '@portabletext/types'
import type { SanityImageSource } from '@sanity/image-url'

export type MerchCategory = 'candles' | 'hamper' | 'soap' | 'lip-balm' | 'experiences'

export const MERCH_CATEGORY_LABELS: Record<MerchCategory, string> = {
  candles: 'Candles',
  hamper: 'Gift Hampers',
  soap: 'Soap',
  'lip-balm': 'Lip Balm',
  experiences: 'Experiences',
}

export type MerchProductSummary = {
  _id: string
  name: string
  slug: string
  category: MerchCategory
  tagline: string
  shopifyHandle: string
  heroImage: SanityImageSource | null
  deliveryPrice: number
}

export type MerchProduct = MerchProductSummary & {
  description: PortableTextBlock[]
}

const summaryFields = groq`
  _id,
  name,
  "slug": slug.current,
  category,
  tagline,
  shopifyHandle,
  heroImage,
  deliveryPrice
`

// For a category listing page (/shop/candles etc.) — every active product
// tagged with that category, however many there are.
export async function getMerchProductsByCategory(
  category: MerchCategory
): Promise<MerchProductSummary[]> {
  const result = await sanityFetch<MerchProductSummary[]>(
    groq`*[_type == "merchProduct" && category == $category && active == true] | order(name asc) { ${summaryFields} }`,
    { category }
  )
  return result ?? []
}

// Every active merch product regardless of category — for the search
// index (src/lib/search.ts), which needs the whole catalogue at once
// rather than one category at a time.
export async function getAllMerchProducts(): Promise<MerchProductSummary[]> {
  const result = await sanityFetch<MerchProductSummary[]>(
    groq`*[_type == "merchProduct" && active == true] | order(name asc) { ${summaryFields} }`
  )
  return result ?? []
}

// For an individual product's own page (/shop/[slug]) — tried after
// honeyProduct comes back empty for that slug.
export async function getMerchProductBySlug(slug: string): Promise<MerchProduct | null> {
  return sanityFetch<MerchProduct>(
    groq`*[_type == "merchProduct" && slug.current == $slug && active == true][0] {
      ${summaryFields},
      description
    }`,
    { slug }
  )
}
