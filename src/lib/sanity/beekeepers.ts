import { groq } from 'next-sanity'
import { sanityFetch } from './client'
import type { PortableTextBlock } from '@portabletext/types'
import type { SanityImageSource } from '@sanity/image-url'
import type { TastingProfile } from './products'

export type BeekeeperSummary = {
  _id: string
  name: string
  slug: string
  portrait: SanityImageSource | null
  area: string
  honeyName: string | null
  teaser: string
  hiveScale: string | null
}

// The honey product(s) this beekeeper actually supplies — a reverse lookup
// (honeyProduct -> beekeeper, read from the beekeeper side) so the profile
// page can link straight to "their" product and surface its tasting
// profile, tying "why this harvest tastes as it does" back to a real batch
// rather than generic prose. Empty array if none yet (a beekeeper can exist
// before their first real product does).
export type BeekeeperHoneyProduct = {
  slug: string
  name: string
  tagline: string
  heroImage: SanityImageSource | null
  tastingProfile: TastingProfile
}

export type BeekeeperProfile = BeekeeperSummary & {
  bio: PortableTextBlock[]
  honeyProducts: BeekeeperHoneyProduct[]
}

const summaryFields = groq`
  _id,
  name,
  "slug": slug.current,
  portrait,
  area,
  honeyName,
  teaser,
  hiveScale
`

export async function getBeekeepers(): Promise<BeekeeperSummary[]> {
  const result = await sanityFetch<BeekeeperSummary[]>(
    groq`*[_type == "beekeeper" && active == true] | order(order asc, name asc) { ${summaryFields} }`
  )
  return result ?? []
}

export async function getBeekeeperBySlug(slug: string): Promise<BeekeeperProfile | null> {
  return sanityFetch<BeekeeperProfile>(
    groq`*[_type == "beekeeper" && slug.current == $slug][0] {
      ${summaryFields},
      bio,
      "honeyProducts": *[_type == "honeyProduct" && active == true && references(^._id)] {
        "slug": slug.current,
        name,
        tagline,
        heroImage,
        tastingProfile
      }
    }`,
    { slug }
  )
}
