import createImageUrlBuilder, { type SanityImageSource } from '@sanity/image-url'
import { dataset, projectId } from '@/sanity/env'

const builder = projectId ? createImageUrlBuilder({ projectId, dataset }) : null

export function urlForImage(source: SanityImageSource | undefined) {
  if (!builder || !source) return null
  return builder.image(source)
}

// One entry from a product's optional "More photos" list (the `gallery`
// field on honeyProduct/merchProduct). The image itself is nested under
// `image` by the GROQ projection — see galleryProjection below.
export type GalleryPhoto = {
  _key: string
  alt: string | null
  image: SanityImageSource
}

export const galleryProjection = `"gallery": coalesce(gallery[defined(asset)]{ _key, alt, "image": @ }, [])`

export type ProductGallerySlide = { key: string; src: string; thumbSrc: string; alt: string }

// The main photo first, then any extra photos, as ready-to-render URLs for
// <ProductGallery>. Extra photos without their own alt text fall back to
// "<product name> — photo N", never an empty alt.
export function buildProductGallery(
  main: { image: SanityImageSource | null; alt: string },
  gallery: GalleryPhoto[],
  productName: string
): ProductGallerySlide[] {
  const photos = [
    { key: 'main', image: main.image, alt: main.alt },
    ...gallery.map((photo, i) => ({
      key: photo._key,
      image: photo.image,
      alt: photo.alt?.trim() || `${productName} — photo ${i + 2}`,
    })),
  ]
  return photos.flatMap((photo) => {
    const builder = urlForImage(photo.image ?? undefined)
    if (!builder) return []
    return [
      {
        key: photo.key,
        src: builder.width(1200).height(1200).url(),
        thumbSrc: builder.width(160).height(160).url(),
        alt: photo.alt,
      },
    ]
  })
}
