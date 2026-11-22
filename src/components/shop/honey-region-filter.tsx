'use client'

import { useMemo, useState, type ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getAreaNameForCode } from '@/lib/postcode-areas'
import { Stars } from '@/components/product/reviews-section'

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
  flavour: string | null
  averageReviewRating: number | null
  reviewCount: number
}

// The region filter is one dropdown that sits in the same row as the "Choose
// a honey by postcode" and "Surprise me" buttons (passed in as `toolbar`).
// It only lists regions actually represented among real products, with a
// count of honeys beside each, so it grows on its own as beekeepers and
// postcodes come on board without a long row of pills building up. A native
// <select> on purpose: keyboard, screen-reader and phone pickers all work
// for free however many regions there end up being.
export function HoneyRegionFilter({
  cards,
  toolbar,
}: {
  cards: HoneyCard[]
  toolbar?: ReactNode
}) {
  const [region, setRegion] = useState<string | 'all'>('all')

  const regions = useMemo(() => {
    const counts = new Map<string, number>()
    for (const card of cards) {
      if (card.region) counts.set(card.region, (counts.get(card.region) ?? 0) + 1)
    }
    return Array.from(counts, ([name, count]) => ({ name, count })).sort((a, b) =>
      a.name.localeCompare(b.name)
    )
  }, [cards])

  const showFilter = regions.length >= 2
  const visibleCards = region === 'all' ? cards : cards.filter((c) => c.region === region)

  return (
    <>
      {(toolbar || showFilter) && (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          {toolbar}
          {showFilter && (
            <label className="border-porcelain/40 bg-porcelain/10 text-porcelain hover:border-porcelain focus-within:outline-honey-amber relative flex items-center gap-2 rounded-full border py-2.5 pr-3 pl-6 text-sm font-semibold transition focus-within:outline focus-within:outline-offset-4">
              <span className="text-porcelain/60 font-normal">Region</span>
              <select
                value={region}
                onChange={(event) => setRegion(event.target.value)}
                aria-label="Filter honey by UK region"
                className="text-porcelain cursor-pointer appearance-none bg-transparent pr-6 font-semibold focus:outline-none"
              >
                <option value="all" className="bg-ink text-porcelain">
                  All regions ({cards.length})
                </option>
                {regions.map((r) => (
                  <option key={r.name} value={r.name} className="bg-ink text-porcelain">
                    {r.name} ({r.count})
                  </option>
                ))}
              </select>
              <svg
                aria-hidden="true"
                viewBox="0 0 20 20"
                className="text-honey-amber pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 8l5 5 5-5" />
              </svg>
            </label>
          )}
        </div>
      )}

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
          <div className="relative p-6 sm:pr-40">
            {/* In normal flow on mobile (full card width, title/postcode/
                beekeeper/price keep all the room) — only pinned to the
                corner from sm up, where a card is wide enough to spare it.
                See "FIX MOBILE PRODUCT CARD LAYOUT" audit, 2026-09-13. */}
            {/* Never a row of empty stars for a product with no reviews yet
                — that reads as a real zero-star rating. See "Fix remaining
                copy and product-rating inconsistencies" audit,
                2026-09-15. */}
            <p className="mb-2 text-lg sm:absolute sm:top-6 sm:right-6 sm:mb-0 sm:text-2xl">
              {card.averageReviewRating !== null ? (
                <>
                  <Stars rating={Math.round(card.averageReviewRating)} />
                  <span className="text-porcelain/60 ml-2 align-middle text-sm font-semibold">
                    {card.averageReviewRating.toFixed(1)} ({card.reviewCount})
                  </span>
                </>
              ) : (
                <span className="text-porcelain/50 align-middle text-sm font-normal">
                  No reviews yet
                </span>
              )}
            </p>
            <p className="text-honey-amber text-xs font-semibold tracking-wide uppercase">
              {card.postcodeCode} — {getAreaNameForCode(card.postcodeCode) ?? card.postcodeCode}
            </p>
            <p className="font-display text-comb-gold mt-1 text-lg italic">{card.name}</p>
            <p className="text-porcelain mt-1 text-sm font-semibold">{card.tagline}</p>
            {card.beekeeper && (
              <p className="text-porcelain/70 mt-1 text-sm">Beekeeper: {card.beekeeper.name}</p>
            )}
            {card.flavour && <p className="text-porcelain/60 mt-1 text-sm">{card.flavour}</p>}
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
