import { groq } from 'next-sanity'
import { sanityFetch } from './client'
import type { PortableTextBlock } from '@portabletext/types'
import type { SanityImageSource } from '@sanity/image-url'

export type BeekeeperSummary = {
  _id: string
  name: string
  slug: string
  portrait: SanityImageSource | null
  area: string
  honeyName: string | null
  teaser: string
}

export type BeekeeperProfile = BeekeeperSummary & {
  bio: PortableTextBlock[]
}

const summaryFields = groq`
  _id,
  name,
  "slug": slug.current,
  portrait,
  area,
  honeyName,
  teaser
`

export async function getBeekeepers(): Promise<BeekeeperSummary[]> {
  const result = await sanityFetch<BeekeeperSummary[]>(
    groq`*[_type == "beekeeper" && active == true] | order(order asc, name asc) { ${summaryFields} }`
  )
  return result ?? []
}

export async function getBeekeeperBySlug(slug: string): Promise<BeekeeperProfile | null> {
  return sanityFetch<BeekeeperProfile>(
    groq`*[_type == "beekeeper" && slug.current == $slug][0] { ${summaryFields}, bio }`,
    { slug }
  )
}
