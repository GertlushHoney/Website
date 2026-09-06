'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { TileCarousel, CAROUSEL_DESKTOP_TILE_WIDTH, type ShopTile } from '@/components/shop/tile-carousel'

// Carousel is the default, but taste varies — this toggle lets anyone drop
// back to the plain grid (the original /shop layout) with one click,
// rather than forcing everyone into the new view.
export function ShopTilesView({ tiles }: { tiles: ShopTile[] }) {
  const [view, setView] = useState<'carousel' | 'grid'>('carousel')

  return (
    <div>
      <div className="flex justify-end">
        <div
          role="group"
          aria-label="Shop layout"
          className="border-ink-line bg-ink-surface inline-flex gap-1 rounded-full border p-1"
        >
          <button
            type="button"
            aria-pressed={view === 'carousel'}
            onClick={() => setView('carousel')}
            className={`focus-visible:outline-honey-amber flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline focus-visible:outline-offset-2 ${
              view === 'carousel' ? 'bg-honey-amber text-ink' : 'text-porcelain/60 hover:text-porcelain'
            }`}
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="8" y="5" width="8" height="14" rx="1.5" />
              <path d="M3 8v8" />
              <path d="M21 8v8" />
            </svg>
            Carousel
          </button>
          <button
            type="button"
            aria-pressed={view === 'grid'}
            onClick={() => setView('grid')}
            className={`focus-visible:outline-honey-amber flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline focus-visible:outline-offset-2 ${
              view === 'grid' ? 'bg-honey-amber text-ink' : 'text-porcelain/60 hover:text-porcelain'
            }`}
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            Grid
          </button>
        </div>
      </div>

      <div className="mt-6">
        {view === 'carousel' ? (
          <TileCarousel tiles={tiles} />
        ) : (
          <div className="flex flex-wrap justify-center gap-6">
            {tiles.map((tile) => (
              <Link
                key={tile.href}
                href={tile.href}
                className="border-ink-line bg-honeycomb-surface hover:border-honey-amber focus-visible:outline-honey-amber group grid overflow-hidden rounded-2xl border transition focus-visible:outline focus-visible:outline-offset-2"
                style={{ width: CAROUSEL_DESKTOP_TILE_WIDTH }}
              >
                <div className="from-ink-surface to-ink relative aspect-square bg-gradient-to-b">
                  {tile.imageUrl && (
                    <Image
                      src={tile.imageUrl}
                      alt=""
                      fill
                      sizes={`${CAROUSEL_DESKTOP_TILE_WIDTH}px`}
                      className={
                        tile.objectFit === 'contain'
                          ? 'object-contain p-10 transition group-hover:scale-105'
                          : 'object-cover transition group-hover:scale-105'
                      }
                    />
                  )}
                </div>
                <div className="p-5">
                  <span className="text-porcelain text-lg font-semibold">{tile.label}</span>
                  <span className="text-porcelain/50 mt-1 block text-xs">{tile.subtitle}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
