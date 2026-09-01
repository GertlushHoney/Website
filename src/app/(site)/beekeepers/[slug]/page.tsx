import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PortableText } from 'next-sanity'
import { getBeekeeperBySlug } from '@/lib/sanity/beekeepers'
import { urlForImage } from '@/lib/sanity/image'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const beekeeper = await getBeekeeperBySlug(slug)
  if (!beekeeper) return { title: 'Beekeeper' }
  return {
    title: beekeeper.name,
    description: beekeeper.teaser,
    alternates: { canonical: `/beekeepers/${slug}` },
  }
}

export default async function BeekeeperProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const beekeeper = await getBeekeeperBySlug(slug)
  if (!beekeeper) notFound()

  const portraitUrl = urlForImage(beekeeper.portrait ?? undefined)?.width(800).height(800).url()

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/beekeepers" className="text-comb-gold text-sm underline underline-offset-2">
        ← Our Beekeepers
      </Link>

      <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start">
        {portraitUrl && (
          <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-2xl">
            <Image
              src={portraitUrl}
              alt={beekeeper.name}
              fill
              sizes="128px"
              className="object-cover"
            />
          </div>
        )}
        <div>
          {beekeeper.honeyName && (
            <p className="text-honey-amber text-sm font-semibold tracking-wide uppercase">
              {beekeeper.honeyName}
            </p>
          )}
          <h1 className="text-porcelain mt-1 text-3xl font-bold tracking-tight text-balance">
            {beekeeper.name}
          </h1>
          <p className="text-porcelain/50 mt-1 text-sm">{beekeeper.area}</p>
          {beekeeper.hiveScale && (
            <p className="text-porcelain/50 mt-1 text-sm">{beekeeper.hiveScale}</p>
          )}
        </div>
      </div>

      <div className="text-porcelain/80 [&_p]:mt-4 [&_p]:text-base mt-8">
        <PortableText value={beekeeper.bio} />
      </div>

      {beekeeper.honeyProducts.map((product) => {
        const flavour = product.tastingProfile?.flavour
        return (
          <Link
            key={product.slug}
            href={`/shop/${product.slug}`}
            className="border-ink-line bg-honeycomb-surface hover:border-honey-amber focus-visible:outline-honey-amber group mt-10 flex items-center gap-5 rounded-2xl border p-5 transition focus-visible:outline focus-visible:outline-offset-2"
          >
            <div className="from-ink-surface to-ink relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gradient-to-b">
              {(() => {
                const productImageUrl = urlForImage(product.heroImage ?? undefined)
                  ?.width(160)
                  .height(160)
                  .url()
                return productImageUrl ? (
                  <Image
                    src={productImageUrl}
                    alt={`A jar of ${product.name} honey`}
                    fill
                    sizes="80px"
                    className="object-contain p-2"
                  />
                ) : null
              })()}
            </div>
            <div className="flex-1">
              <p className="text-porcelain/50 text-xs tracking-wide uppercase">
                Why {product.name} tastes as it does
              </p>
              <p className="text-comb-gold mt-1 font-semibold">{product.name}</p>
              <p className="text-porcelain/70 mt-0.5 text-sm">
                {flavour ?? product.tagline}
              </p>
            </div>
            <span
              aria-hidden="true"
              className="text-comb-gold shrink-0 text-sm font-semibold transition group-hover:translate-x-0.5"
            >
              →
            </span>
          </Link>
        )
      })}
    </div>
  )
}
