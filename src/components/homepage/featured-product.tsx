'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export type FeaturedProductData = {
  slug: string
  name: string
  tagline: string
  weight: string
  origin: string
  postcodeCode: string
  imageUrl: string | null
  price: number | null
  // null for any product with no beekeeper linked in Sanity yet.
  beekeeper: { name: string; slug: string } | null
  // null until a product has at least one season entry in Sanity.
  latestSeasonYear: string | null
  flavour: string | null
}

// Picks one real honey product at random on every visit, instead of always
// showing the same jar — starts honest even with a single product (it'll
// just land on that one) and starts actually surprising once there's more
// than one. Renders the first product (alphabetical, so always the same
// one) for the initial server-rendered paint, then re-rolls in an effect
// once mounted — same "can't be random during SSR without a hydration
// mismatch" reasoning as the splash screen's session check.
export function FeaturedProduct({ products }: { products: FeaturedProductData[] }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (products.length > 1) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIndex(Math.floor(Math.random() * products.length))
    }
  }, [products.length])

  if (products.length === 0) return null

  const product = products[index]
  const facts = [
    {
      label: 'Price',
      value:
        product.price != null
          ? new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(
              product.price
            )
          : 'Price on request',
    },
    { label: 'Weight', value: product.weight },
  ]

  return (
    <section className="border-ink-line grid items-stretch border-b lg:grid-cols-2">
      <div className="relative order-2 min-h-[420px] lg:order-1 lg:min-h-[560px]">
        {product.imageUrl && (
          <Image
            src={product.imageUrl}
            alt={`Jar of ${product.name} honey`}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        )}
        <div className="from-ink/70 absolute inset-0 bg-gradient-to-t via-transparent to-transparent" />
      </div>

      <div className="bg-honeycomb-surface order-1 flex flex-col justify-center px-6 py-16 lg:order-2 lg:px-16">
        <p className="text-honey-amber text-sm font-semibold tracking-wide uppercase">
          {product.postcodeCode} — {product.origin}
        </p>
        <p className="font-display text-comb-gold mt-2 text-2xl italic">{product.name}</p>
        <h2 className="text-porcelain mt-3 text-4xl font-bold tracking-tight text-balance">
          {product.tagline.trim()}
        </h2>
        <div className="text-porcelain/80 mt-4 space-y-1 text-sm">
          {product.beekeeper && (
            <p>
              Beekeeper:{' '}
              <span className="text-porcelain font-semibold">{product.beekeeper.name}</span>
            </p>
          )}
          {product.latestSeasonYear && <p>{product.latestSeasonYear} Harvest</p>}
          {product.flavour && <p>{product.flavour}</p>}
        </div>
        <dl className="mt-8 space-y-4">
          {facts.map((fact) => (
            <div key={fact.label} className="border-ink-line flex gap-4 border-t pt-4">
              <dt className="text-porcelain/50 w-24 shrink-0 text-sm font-medium">{fact.label}</dt>
              <dd className="text-porcelain/90 text-sm">{fact.value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Link
            href={`/shop/${product.slug}`}
            className="bg-honey-amber text-ink focus-visible:outline-porcelain rounded-full px-6 py-2.5 text-sm font-semibold focus-visible:outline focus-visible:outline-offset-4"
          >
            Buy {product.name}
          </Link>
          {product.beekeeper ? (
            <Link
              href={`/beekeepers/${product.beekeeper.slug}`}
              className="border-porcelain/40 text-porcelain hover:border-porcelain focus-visible:outline-honey-amber rounded-full border px-6 py-2.5 text-sm font-semibold focus-visible:outline focus-visible:outline-offset-4"
            >
              Meet {product.beekeeper.name}
            </Link>
          ) : (
            <Link
              href={`/shop/${product.slug}`}
              className="border-porcelain/40 text-porcelain hover:border-porcelain focus-visible:outline-honey-amber rounded-full border px-6 py-2.5 text-sm font-semibold focus-visible:outline focus-visible:outline-offset-4"
            >
              See origin
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}
