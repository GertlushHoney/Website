import type { Metadata } from 'next'
import Link from 'next/link'
import { InteractiveUkMap, type ActiveMapProduct } from '@/components/postcode-map/interactive-uk-map'
import { getUkPostcodeMapSvg } from '@/lib/uk-map-svg'
import { getHoneyProducts, getHoneyProductsWithBeekeeper } from '@/lib/sanity/products'
import { getAreaNameForCode } from '@/lib/postcode-areas'
import { urlForImage } from '@/lib/sanity/image'

export const metadata: Metadata = {
  title: 'Postcode Honey',
  description:
    'Honey with a postcode, sourced from independent beekeepers across Britain. Select your postcode area to see what honey is available.',
  alternates: { canonical: '/postcode-honey' },
}

export default async function PostcodeHoneyPage() {
  const svgMarkup = getUkPostcodeMapSvg()
  const [products, honeyList] = await Promise.all([
    getHoneyProducts(),
    getHoneyProductsWithBeekeeper(),
  ])

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

      <div className="border-ink-line bg-honeycomb-surface mt-8 max-w-xl rounded-2xl border p-5">
        <h2 className="text-comb-gold text-base font-bold tracking-tight">
          A little selection, growing with us 🍯
        </h2>
        <p className="text-porcelain/70 mt-2 text-sm">
          Gert Lush is just getting started, so you might only find a few honeys near your postcode
          for now. We’re working to bring more local beekeepers on board—thanks for supporting us
          from the beginning.
        </p>
      </div>

      <div className="mt-12">
        <InteractiveUkMap svgMarkup={svgMarkup} activeProducts={activeProducts} />
      </div>

      {/* The map is interactive, so also a plain list: the same information as
          readable text and links, for anyone (or any search engine or AI
          assistant) that can't use the map. */}
      {honeyList.length > 0 && (
        <section className="mt-16 max-w-2xl" aria-labelledby="honey-by-postcode">
          <h2 id="honey-by-postcode" className="text-porcelain text-2xl font-bold tracking-tight">
            Honey available now, by postcode
          </h2>
          <ul className="mt-5 space-y-4">
            {honeyList.map((honey) => {
              const area = getAreaNameForCode(honey.postcodeCode)
              return (
                <li key={honey._id} className="border-ink-line border-b pb-4 text-sm">
                  <p className="text-comb-gold font-semibold">
                    {honey.postcodeCode}
                    {area ? ` · ${area}` : ''}
                  </p>
                  <p className="text-porcelain mt-1 text-base">
                    <Link
                      href={`/shop/${honey.slug}`}
                      className="hover:text-comb-gold underline underline-offset-2"
                    >
                      {honey.name}
                    </Link>
                    {honey.beekeeper ? (
                      <>
                        {' '}
                        — from beekeeper{' '}
                        <Link
                          href={`/beekeepers/${honey.beekeeper.slug}`}
                          className="hover:text-comb-gold underline underline-offset-2"
                        >
                          {honey.beekeeper.name}
                        </Link>
                      </>
                    ) : null}
                  </p>
                  <p className="text-porcelain/70 mt-1">{honey.tagline.trim()}</p>
                </li>
              )
            })}
          </ul>
          <p className="text-porcelain/60 mt-4 text-sm">
            Don&apos;t see your postcode? Choose it on the map above to join the waiting list.
          </p>
        </section>
      )}
    </div>
  )
}
