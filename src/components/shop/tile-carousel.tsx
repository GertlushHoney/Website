'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'

export type ShopTile = {
  href: string
  label: string
  subtitle: string
  imageUrl: string | null
  objectFit: 'contain' | 'cover'
}

type Tier = 'mobile' | 'tablet' | 'desktop'

// Front-tile width and how far apart (in px) neighbouring tiles sit, per
// breakpoint — the front tile is always shown at its full, normal size
// (never shrunk to "fit" the carousel); only the side tiles scale down.
// stageHeight is derived below from the tile's own real dimensions
// (aspect-square image + text block), not a separately guessed number —
// a mismatched guess is what left a large empty gap before the dots.
const TIER_CONFIG: Record<Tier, { width: number; offset: number }> = {
  mobile: { width: 260, offset: 150 },
  tablet: { width: 320, offset: 200 },
  desktop: { width: 400, offset: 250 },
}

// Exposed so the grid view (ShopTilesView) can size its own tiles to match
// the carousel's front tile exactly, rather than guessing a number that
// might drift out of sync with this one.
export const CAROUSEL_DESKTOP_TILE_WIDTH = TIER_CONFIG.desktop.width

// Tile height = image (aspect-square, so equal to width) + the text block
// below it (p-5 = 20px top/bottom padding, the name line, and the smaller
// subtitle line) — matches the real rendered card exactly instead of
// guessing a round number.
const TILE_TEXT_BLOCK_HEIGHT = 88

const AUTO_ROTATE_MS = 6000
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'

function shortestOffset(index: number, current: number, total: number) {
  let offset = index - current
  if (offset > total / 2) offset -= total
  if (offset < -total / 2) offset += total
  return offset
}

// useSyncExternalStore (not useState+useEffect) so the server always
// renders a fixed "desktop" snapshot and the client swaps to the real
// tier right after hydration, without a hydration-mismatch warning on
// real visitors whose first load isn't desktop-sized.
function subscribeToViewportChanges(callback: () => void) {
  const tabletQuery = window.matchMedia('(min-width: 480px)')
  const desktopQuery = window.matchMedia('(min-width: 768px)')
  tabletQuery.addEventListener('change', callback)
  desktopQuery.addEventListener('change', callback)
  return () => {
    tabletQuery.removeEventListener('change', callback)
    desktopQuery.removeEventListener('change', callback)
  }
}

function getTierSnapshot(): Tier {
  if (window.matchMedia('(min-width: 768px)').matches) return 'desktop'
  if (window.matchMedia('(min-width: 480px)').matches) return 'tablet'
  return 'mobile'
}

function getTierServerSnapshot(): Tier {
  return 'desktop'
}

function useTier(): Tier {
  return useSyncExternalStore(subscribeToViewportChanges, getTierSnapshot, getTierServerSnapshot)
}

function subscribeToReducedMotionChanges(callback: () => void) {
  const query = window.matchMedia('(prefers-reduced-motion: reduce)')
  query.addEventListener('change', callback)
  return () => query.removeEventListener('change', callback)
}

function getReducedMotionSnapshot(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function getReducedMotionServerSnapshot(): boolean {
  return false
}

function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeToReducedMotionChanges,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  )
}

// The exact same tile design the shop grid has always used (image, label,
// subtitle in a bordered card) — the carousel only changes how many are
// visible at once and how you move between them, not what a tile is.
function Tile({ tile, width }: { tile: ShopTile; width: number }) {
  return (
    <Link
      href={tile.href}
      className="border-ink-line bg-honeycomb-surface hover:border-honey-amber focus-visible:outline-honey-amber group grid overflow-hidden rounded-2xl border transition focus-visible:outline focus-visible:outline-offset-2"
      style={{ width }}
    >
      <div className="from-ink-surface to-ink relative aspect-square bg-gradient-to-b">
        {tile.imageUrl && (
          <Image
            src={tile.imageUrl}
            alt=""
            fill
            sizes="400px"
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
  )
}

// The shop's category tiles, shown one at a time — front tile at full size
// and in focus, neighbours smaller, angled and dimmed behind it, like the
// reference "phone carousel" interaction adapted to the site's own tiles
// rather than a new visual design.
export function TileCarousel({ tiles }: { tiles: ShopTile[] }) {
  const total = tiles.length
  const tier = useTier()
  const prefersReducedMotion = usePrefersReducedMotion()

  const [current, setCurrent] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [resetKey, setResetKey] = useState(0)
  const touchStartX = useRef<number | null>(null)

  const goTo = useCallback(
    (index: number) => {
      setCurrent(((index % total) + total) % total)
      setResetKey((key) => key + 1)
    },
    [total]
  )

  useEffect(() => {
    if (total <= 1 || isHovered || isFocused || prefersReducedMotion) return
    const id = setInterval(() => {
      setCurrent((index) => (index + 1) % total)
    }, AUTO_ROTATE_MS)
    return () => clearInterval(id)
  }, [total, isHovered, isFocused, prefersReducedMotion, resetKey])

  if (total === 0) return null

  const { width, offset: stepOffset } = TIER_CONFIG[tier]
  const stageHeight = width + TILE_TEXT_BLOCK_HEIGHT + 20
  // Sized to the actual content spread (front tile + how far the side tiles
  // sit off-centre), not an arbitrary fixed width — otherwise the arrows
  // and dots, which are centred within this container, end up sitting far
  // away from the tile itself whenever this width doesn't happen to match.
  const stageMaxWidth = width + stepOffset * 2 + 120
  // Distance from centre to each arrow: half the front tile's width, plus
  // a small gap — anchored to the tile itself rather than the container
  // edge, so the arrows always hug the tile regardless of container width.
  const arrowInset = `calc(50% - ${width / 2}px - 48px)`

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Shop categories"
      className="mx-auto overflow-x-clip px-2"
      style={{ maxWidth: stageMaxWidth }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft') goTo(current - 1)
        if (event.key === 'ArrowRight') goTo(current + 1)
      }}
      onTouchStart={(event) => {
        touchStartX.current = event.touches[0]?.clientX ?? null
      }}
      onTouchEnd={(event) => {
        if (touchStartX.current == null) return
        const deltaX = (event.changedTouches[0]?.clientX ?? 0) - touchStartX.current
        if (deltaX > 40) goTo(current - 1)
        else if (deltaX < -40) goTo(current + 1)
        touchStartX.current = null
      }}
    >
      <div className="relative" style={{ height: stageHeight, perspective: '1400px' }}>
        {tiles.map((tile, index) => {
          const offset = shortestOffset(index, current, total)
          const abs = Math.abs(offset)
          const isFront = abs === 0
          const scale = isFront ? 1 : abs === 1 ? 0.8 : 0.62

          return (
            <div
              key={tile.href}
              aria-hidden={!isFront}
              className="motion-reduce:!transition-none absolute transition-[transform,opacity,filter] duration-700"
              style={{
                top: '50%',
                left: '50%',
                transitionTimingFunction: EASE,
                transform: `translate(-50%, -50%) translateX(${offset * stepOffset}px) rotateY(${offset * -14}deg) scale(${scale})`,
                opacity: isFront ? 1 : abs === 1 ? 0.6 : 0.22,
                filter: isFront ? 'none' : `blur(${abs}px) brightness(${1 - abs * 0.14})`,
                zIndex: 100 - abs,
                pointerEvents: isFront ? 'auto' : 'none',
              }}
            >
              <Tile tile={tile} width={width} />
            </div>
          )
        })}

        <button
          type="button"
          onClick={() => goTo(current - 1)}
          aria-label="Previous category"
          className="border-honey-amber/40 bg-ink-surface text-comb-gold hover:border-comb-gold focus-visible:outline-comb-gold absolute z-[200] flex h-9 w-9 items-center justify-center rounded-full border transition-colors focus-visible:outline focus-visible:outline-offset-2"
          style={{ top: '50%', left: arrowInset, transform: 'translateY(-50%)' }}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 6 9 12 15 18" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => goTo(current + 1)}
          aria-label="Next category"
          className="border-honey-amber/40 bg-ink-surface text-comb-gold hover:border-comb-gold focus-visible:outline-comb-gold absolute z-[200] flex h-9 w-9 items-center justify-center rounded-full border transition-colors focus-visible:outline focus-visible:outline-offset-2"
          style={{ top: '50%', right: arrowInset, transform: 'translateY(-50%)' }}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 6 15 12 9 18" />
          </svg>
        </button>
      </div>

      <div role="tablist" aria-label="Choose a category" className="mt-6 flex justify-center gap-2">
        {tiles.map((tile, index) => (
          <button
            key={tile.href}
            type="button"
            role="tab"
            aria-selected={index === current}
            aria-label={tile.label}
            onClick={() => goTo(index)}
            className={`focus-visible:outline-comb-gold h-[7px] rounded-full border transition-all focus-visible:outline focus-visible:outline-offset-2 ${
              index === current
                ? 'bg-comb-gold border-comb-gold w-4'
                : 'border-porcelain/35 hover:border-comb-gold w-[7px] bg-transparent'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
