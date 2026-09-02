import { groq } from 'next-sanity'
import { sanityFetch } from './client'
import { urlForImage } from './image'
import type { SanityImageSource } from '@sanity/image-url'

export type InformationCardPageKey =
  | '/becoming-a-beekeeper'
  | '/become-a-supplier'
  | '/gert-lush-standard'
  | '/asian-hornets'
  | '/faqs'

type RawInformationCard = {
  pageKey: InformationCardPageKey
  eyebrow: string | null
  title: string | null
  description: string | null
  image: SanityImageSource | null
}

export type InformationCardOverride = {
  eyebrow: string | null
  title: string | null
  description: string | null
  imageUrl: string | null
}

// Editor-controlled overrides for the /information hub tiles — a page
// without a document just falls back to the page's own default copy/image
// (see information/page.tsx). Returns a lookup by page key rather than a
// raw list so the page doesn't need to search it.
export async function getInformationCards(): Promise<
  Partial<Record<InformationCardPageKey, InformationCardOverride>>
> {
  const result = await sanityFetch<RawInformationCard[]>(
    groq`*[_type == "informationCard"]{ pageKey, eyebrow, title, description, image }`
  )

  const map: Partial<Record<InformationCardPageKey, InformationCardOverride>> = {}
  for (const card of result ?? []) {
    map[card.pageKey] = {
      eyebrow: card.eyebrow || null,
      title: card.title || null,
      description: card.description || null,
      imageUrl: urlForImage(card.image ?? undefined)?.width(800).height(450).url() ?? null,
    }
  }
  return map
}
