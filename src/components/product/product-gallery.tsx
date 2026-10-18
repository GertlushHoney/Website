'use client'

import Image from 'next/image'
import { useRef, useState } from 'react'
import type { ProductGallerySlide } from '@/lib/sanity/image'

const ARROW_CLASS =
  'border-honey-amber/40 bg-ink-surface/85 text-comb-gold hover:border-comb-gold focus-visible:outline-comb-gold absolute top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border backdrop-blur-sm transition-colors focus-visible:outline focus-visible:outline-offset-2'

// A product page's photos: the main photo first, then any "More photos"
// from Studio. With a single photo it renders exactly like the old static
// hero image — no arrows, thumbnails or carousel semantics. With more,
// visitors can swipe (touch), use the arrow buttons or ←/→ keys, or tap a
// thumbnail. Same accessibility approach as TileCarousel: off-screen
// slides are `inert`, buttons are 44px, the thumbnail row is a labelled
// group of plain buttons with aria-current rather than a tablist.
export function ProductGallery({
  slides,
  productName,
  imageClassName,
  glow = false,
}: {
  slides: ProductGallerySlide[]
  productName: string
  imageClassName: string
  // The soft honey-amber radial glow behind honey jar photos.
  glow?: boolean
}) {
  const total = slides.length
  const [current, setCurrent] = useState(0)
  const touchStartX = useRef<number | null>(null)
  const hasMany = total > 1

  const goTo = (index: number) => setCurrent(((index % total) + total) % total)

  return (
    <div
      role={hasMany ? 'region' : undefined}
      aria-roledescription={hasMany ? 'carousel' : undefined}
      aria-label={hasMany ? `${productName} photos` : undefined}
      className="flex flex-col gap-3"
      onKeyDown={(event) => {
        if (!hasMany) return
        if (event.key === 'ArrowLeft') goTo(current - 1)
        if (event.key === 'ArrowRight') goTo(current + 1)
      }}
    >
      <div
        className="from-ink-surface to-ink relative min-h-[420px] overflow-hidden rounded-2xl bg-gradient-to-b"
        onTouchStart={(event) => {
          touchStartX.current = event.touches[0]?.clientX ?? null
        }}
        onTouchEnd={(event) => {
          if (!hasMany || touchStartX.current == null) return
          const deltaX = (event.changedTouches[0]?.clientX ?? 0) - touchStartX.current
          if (deltaX > 40) goTo(current - 1)
          else if (deltaX < -40) goTo(current + 1)
          touchStartX.current = null
        }}
      >
        {glow && (
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl"
            style={{
              backgroundImage:
                'radial-gradient(circle at 50% 45%, rgba(217,150,20,0.16), transparent 60%)',
            }}
          />
        )}

        <div
          className="absolute inset-0 flex transition-transform duration-500 ease-out motion-reduce:transition-none"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <div
              key={slide.key}
              className="relative h-full w-full shrink-0"
              role={hasMany ? 'group' : undefined}
              aria-roledescription={hasMany ? 'slide' : undefined}
              aria-label={hasMany ? `${index + 1} of ${total}` : undefined}
              aria-hidden={index !== current}
              inert={index !== current}
            >
              <Image
                src={slide.src}
                alt={slide.alt}
                fill
                priority={index === 0}
                sizes="(min-width: 1024px) 50vw, 100vw"
                className={imageClassName}
              />
            </div>
          ))}
        </div>

        {hasMany && (
          <>
            <button
              type="button"
              onClick={() => goTo(current - 1)}
              aria-label="Previous photo"
              className={`${ARROW_CLASS} left-3`}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="15 6 9 12 15 18" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => goTo(current + 1)}
              aria-label="Next photo"
              className={`${ARROW_CLASS} right-3`}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="9 6 15 12 9 18" />
              </svg>
            </button>
            <p
              aria-live="polite"
              className="bg-ink/70 text-porcelain/80 absolute right-3 bottom-3 z-10 rounded-full px-2.5 py-1 text-xs"
            >
              {current + 1} / {total}
            </p>
          </>
        )}
      </div>

      {hasMany && (
        <div role="group" aria-label="Choose a photo" className="flex flex-wrap justify-center gap-2">
          {slides.map((slide, index) => {
            const isActive = index === current
            return (
              <button
                key={slide.key}
                type="button"
                onClick={() => goTo(index)}
                aria-label={`Show photo ${index + 1}: ${slide.alt}`}
                aria-current={isActive ? 'true' : undefined}
                className={`focus-visible:outline-comb-gold relative h-16 w-16 overflow-hidden rounded-lg border-2 transition focus-visible:outline focus-visible:outline-offset-2 ${
                  isActive ? 'border-comb-gold' : 'border-ink-line opacity-60 hover:opacity-100'
                }`}
              >
                <Image src={slide.thumbSrc} alt="" fill sizes="64px" className="object-cover" />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
