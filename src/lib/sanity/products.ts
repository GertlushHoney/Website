import { groq } from 'next-sanity'
import { sanityFetch } from './client'
import type { PortableTextBlock } from '@portabletext/types'
import type { SanityImageSource } from '@sanity/image-url'

export type HoneySeason = {
  year: string
  photo: SanityImageSource | null
  note: string | null
}

// Every field is independently optional — Studio guidance is explicit that
// none of these should be filled in unless it's true of the actual batch
// (see honeyProduct.ts schema description). Never fall back to a guess when
// a field is null; just don't render that line.
export type TastingProfile = {
  flavour: string | null
  colour: string | null
  texture: string | null
  harvestSeason: string | null
  landscape: string | null
  greatWith: string | null
} | null

export type HoneyProductSummary = {
  _id: string
  name: string
  slug: string
  tagline: string
  shopifyHandle: string
  postcodeCode: string
  heroImage: SanityImageSource | null
  weight: string
  shippingWeightGrams: number | null
  subscriptionPrice: number | null
}

export type HoneyProductFull = HoneyProductSummary & {
  originStory: PortableTextBlock[]
  seasons: HoneySeason[]
  tastingProfile: TastingProfile
  meetsGertLushStandard: boolean
  batchCode: string | null
  traceabilityFormat: string | null
  beekeeper: {
    _id: string
    name: string
    slug: string
    area: string
    bio: PortableTextBlock[]
  } | null
}

const summaryFields = groq`
  _id,
  name,
  "slug": slug.current,
  tagline,
  shopifyHandle,
  postcodeCode,
  heroImage,
  weight,
  shippingWeightGrams,
  subscriptionPrice
`

export async function getHoneyProducts(): Promise<HoneyProductSummary[]> {
  const result = await sanityFetch<HoneyProductSummary[]>(
    groq`*[_type == "honeyProduct" && active == true] | order(name asc) { ${summaryFields} }`
  )
  return result ?? []
}

// Homepage-spotlight and honey-listing-card variant that also projects the
// beekeeper's name/slug and the most recent season's year — added
// 2026-08-27 so beekeeper and harvest year can be shown prominently on
// every honey card, per independent review feedback (John Hutchinson).
// Kept separate from getHoneyProducts/summaryFields rather than changing
// them, since those are also used by the search index and postcode map,
// which have no use for this extra data.
export type HoneyProductSummaryWithBeekeeper = HoneyProductSummary & {
  beekeeper: { name: string; slug: string } | null
  latestSeasonYear: string | null
  // Only the flavour line — the single most decision-relevant field for a
  // card comparing several honeys at a glance. The full tastingProfile
  // (colour/texture/harvest/landscape/greatWith) is on the product page.
  flavour: string | null
}

export async function getHoneyProductsWithBeekeeper(): Promise<
  HoneyProductSummaryWithBeekeeper[]
> {
  const result = await sanityFetch<HoneyProductSummaryWithBeekeeper[]>(
    groq`*[_type == "honeyProduct" && active == true] | order(name asc) {
      ${summaryFields},
      beekeeper -> { name, "slug": slug.current },
      "latestSeasonYear": seasons[-1].year,
      "flavour": tastingProfile.flavour
    }`
  )
  return result ?? []
}

// Used by the postcode map — every active product's code, so the map never
// needs its own hardcoded list of which postcodes have real stock.
export async function getActivePostcodeCodes(): Promise<
  { postcodeCode: string; slug: string; name: string }[]
> {
  const result = await sanityFetch<{ postcodeCode: string; slug: string; name: string }[]>(
    groq`*[_type == "honeyProduct" && active == true] { postcodeCode, "slug": slug.current, name }`
  )
  return result ?? []
}

export async function getHoneyProductBySlug(slug: string): Promise<HoneyProductFull | null> {
  return sanityFetch<HoneyProductFull>(
    groq`*[_type == "honeyProduct" && slug.current == $slug][0] {
      ${summaryFields},
      originStory,
      "seasons": coalesce(seasons, []),
      tastingProfile,
      "meetsGertLushStandard": meetsGertLushStandard == true,
      batchCode,
      traceabilityFormat,
      beekeeper -> {
        _id,
        name,
        "slug": slug.current,
        area,
        bio
      }
    }`,
    { slug }
  )
}
