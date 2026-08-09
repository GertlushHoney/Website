import { groq } from 'next-sanity'
import { sanityFetch } from './client'
import type { PortableTextBlock } from '@portabletext/types'
import type { SanityImageSource } from '@sanity/image-url'

export type MerchProduct = {
  _id: string
  name: string
  slug: string
  category: string
  tagline: string
  shopifyHandle: string
  heroImage: SanityImageSource | null
  description: PortableTextBlock[]
  deliveryPrice: number
}

// Returns null both when nothing's been published yet AND when a document
// exists but isn't marked active — either way, the calling page falls back
// to the honest "coming soon" content rather than showing something
// half-finished.
export async function getMerchProductBySlug(slug: string): Promise<MerchProduct | null> {
  return sanityFetch<MerchProduct>(
    groq`*[_type == "merchProduct" && slug.current == $slug && active == true][0] {
      _id,
      name,
      "slug": slug.current,
      category,
      tagline,
      shopifyHandle,
      heroImage,
      description,
      deliveryPrice
    }`,
    { slug }
  )
}
