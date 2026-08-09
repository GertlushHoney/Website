import createImageUrlBuilder, { type SanityImageSource } from '@sanity/image-url'
import { dataset, projectId } from '@/sanity/env'

const builder = projectId ? createImageUrlBuilder({ projectId, dataset }) : null

export function urlForImage(source: SanityImageSource | undefined) {
  if (!builder || !source) return null
  return builder.image(source)
}
