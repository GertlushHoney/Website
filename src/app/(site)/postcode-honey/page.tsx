import type { Metadata } from 'next'
import { InteractiveUkMap, type ActiveMapProduct } from '@/components/postcode-map/interactive-uk-map'
import { getUkPostcodeMapSvg } from '@/lib/uk-map-svg'
import { getHoneyProducts } from '@/lib/sanity/products'
import { urlForImage } from '@/lib/sanity/image'

export const metadata: Metadata = {
  title: 'Postcode Honey',
  description:
    'Honey with a postcode, sourced from independent beekeepers across Britain. Select your postcode area to see what honey is available.',
}

export default async function PostcodeHoneyPage() {
  const svgMarkup = getUkPostcodeMapSvg()
  const products = await getHoneyProducts()

  const activeProducts: Record<string, ActiveMapProduct> = {}
  for (const product of products) {
    activeProducts[product.postcodeCode] = {
      slug: product.slug,
      name: product.name,
      tagline: product.tagline,
      imageUrl: urlForImage(product.heroImage ?? undefined)?.width(320).height(320).url() ?? null,
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <p className="text-honey-amber text-sm font-semibold tracking-wide uppercase">
        Postcode Honey
      </p>
      <h1 className="text-porcelain mt-3 max-w-2xl text-4xl font-bold tracking-tight text-balance">
        Honey with a postcode.
      </h1>
      <p className="text-porcelain/70 mt-4 max-w-xl text-base">
        Gert Lush Honey is based in Bristol, but every jar is sourced from an independent beekeeper
        somewhere specific. Select a postcode area to see what&apos;s available.
      </p>

      <div className="mt-12">
        <InteractiveUkMap svgMarkup={svgMarkup} activeProducts={activeProducts} />
      </div>
    </div>
  )
}
