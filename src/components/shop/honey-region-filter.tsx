'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getAreaNameForCode } from '@/lib/postcode-areas'

export type HoneyCard = {
  id: string
  slug: string
  name: string
  tagline: string
  weight: string
  postcodeCode: string
  region: string | undefined
  imageUrl: string | null
  price: number | null
  beekeeper: { name: string; slug: string } | null
}

// Filter pills only list regions actually represented among real products —
// with one or two postcodes live so far, that's honest today (probably just
// "South West") and grows on its own as more beekeepers/postcodes come on
// board, without needing to hardcode the full UK region list as options.
export function HoneyRegionFilter({ cards }: { cards: HoneyCard[] }) {
  const [region, setRegion] = useState<string | 'all'>('all')

  const regions = useMemo(
    () => Array.from(new Set(cards.map((c) => c.region).filter((r): r is string => Boolean(r)))).sort(),
    [cards]
  )

  const visibleCards = region === 'all' ? cards : cards.filter((c) => c.region === region)

  if (regions.length < 2) {
    return <HoneyCardGrid cards={cards} />
  }

  return (
    <>
      <div className="mt-8 flex flex-wrap items-center gap-2" role="group" aria-label="Filter by UK region">
        <button
          type="button"
          onClick={() => setRegion('all')}
          aria-pressed={region === 'all'}
          className={`focus-visible:outline-honey-amber rounded-full border px-4 py-1.5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-offset-2 ${
            region === 'all'
              ? 'bg-honey-amber text-ink border-honey-amber'
              : 'border-porcelain/40 text-porcelain hover:border-porcelain'
          }`}
        >
          All regions
        </button>
        {regions.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRegion(r)}
            aria-pressed={region === r}
            className={`focus-visible:outline-honey-amber rounded-full border px-4 py-1.5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-offset-2 ${
              region === r
                ? 'bg-honey-amber text-ink border-honey-amber'
                : 'border-porcelain/40 text-porcelain hover:border-porcelain'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {visibleCards.length === 0 ? (
        <p className="text-porcelain/60 mt-10 text-sm">No postcode honey from {region} yet — check back soon.</p>
      ) : (
        <HoneyCardGrid cards={visibleCards} />
      )}
    </>
  )
}

function HoneyCardGrid({ cards }: { cards: HoneyCard[] }) {
  return (
    <div className="mt-10 grid gap-6 sm:grid-cols-2">
      {cards.map((card) => (
        <Link
          key={card.id}
          href={`/shop/${card.slug}`}
          className="border-ink-line bg-honeycomb-surface focus-visible:outline-honey-amber group grid gap-0 overflow-hidden rounded-2xl border transition focus-visible:outline focus-visible:outline-offset-4"
        >
          <div className="from-ink-surface to-ink relative aspect-square bg-gradient-to-b">
            {card.imageUrl && (
              <Image
                src={card.imageUrl}
                alt={`A jar of ${card.name} honey`}
                fill
                sizes="400px"
                className="object-contain p-10 transition group-hover:scale-105"
              />
            )}
          </div>
          <div className="p-6">
            <p className="text-honey-amber text-xs font-semibold tracking-wide uppercase">
              {card.postcodeCode} — {getAreaNameForCode(card.postcodeCode) ?? card.postcodeCode}
            </p>
            <p className="font-display text-comb-gold mt-1 text-lg italic">{card.name}</p>
            <p className="text-porcelain mt-1 text-sm font-semibold">{card.tagline}</p>
            {card.beekeeper && (
              <p className="text-porcelain/70 mt-1 text-sm">Beekeeper: {card.beekeeper.name}</p>
            )}
            <p className="text-porcelain/50 mt-1 text-sm">{card.weight}</p>
            {card.price != null && (
              <p className="text-porcelain mt-3 text-base font-semibold">
                {new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(card.price)}
              </p>
            )}
          </div>
        </Link>
      ))}
    </div>
  )
}
