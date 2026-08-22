'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { postcodeAreaCodes, postcodeAreaNames } from '@/lib/postcode-areas'
import { bristolDistricts } from '@/lib/bristol-districts'
import { bathDistricts } from '@/lib/bath-districts'

export type ActiveMapProduct = {
  slug: string
  name: string
  tagline: string
  imageUrl: string | null
}

// Matches "BS_areapath" -> "BS", "BRlondon_insetareapath" -> "BR",
// "BB_manchester_insetareatext" -> "BB", and duplicate-label ids for
// exclaves/scattered islands like "KW.1_areatext" -> "KW" (the source SVG
// draws some area codes' labels twice — main position plus a satellite
// island — with a ".N" suffix before the underscore).
function extractCode(id: string): string | null {
  const match = id.match(
    /^([A-Za-z]+?)(\.\d+)?(_)?(london_inset|manchester_inset)?area(path|text)$/i
  )
  return match ? match[1].toUpperCase() : null
}

// Areas with a real district-level breakdown to drill into on click. This
// is just real geography (which areas have a real district list at all) —
// which specific district has a live product comes from the activeProducts
// prop (Sanity-driven), not from this table. Add further areas here only
// once real district data exists for them — see docs/third-party-assets.md.
const districtDataByArea: Record<
  string,
  { districts: { code: string; coverage: string }[]; areaLabel: string }
> = {
  BS: { districts: bristolDistricts, areaLabel: 'Bristol' },
  BA: { districts: bathDistricts, areaLabel: 'Bath' },
}

type View = 'uk' | 'district'

export function InteractiveUkMap({
  svgMarkup,
  activeProducts,
}: {
  svgMarkup: string
  // Keyed by exact postcode code — either a UK area ("M") or, for
  // Bristol/Bath, a district ("BS3"). Comes from Sanity honeyProduct
  // documents (see src/lib/sanity/products.ts) — this component has no
  // hardcoded knowledge of which postcodes have real stock.
  activeProducts: Record<string, ActiveMapProduct>
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [view, setView] = useState<View>('uk')
  const [drilledArea, setDrilledArea] = useState<string | null>(null)
  const [selectedCode, setSelectedCode] = useState<string | null>(null)
  const [hoveredCode, setHoveredCode] = useState<string | null>(null)

  // The zoom transform moves the map under a stationary cursor, which fires
  // a genuine mouseenter on whatever's now underneath — a ref (not state)
  // so the event listeners set up once below always see the latest view
  // without needing to be re-attached.
  const viewRef = useRef<View>('uk')
  useEffect(() => {
    viewRef.current = view
  }, [view])

  // An area is "active" for the resting-state highlight either directly
  // (an area-level product) or because one of its districts has a product.
  function isAreaActive(code: string): boolean {
    if (code in activeProducts) return true
    return districtDataByArea[code]?.districts.some((d) => d.code in activeProducts) ?? false
  }

  // One-time setup: wrap the injected SVG's content in a single group so it
  // can be zoomed as one unit, and wire up every real postcode-area path as
  // a keyboard-accessible, clickable control.
  useEffect(() => {
    const container = containerRef.current
    const svg = container?.querySelector('svg')
    if (!container || !svg) return

    const wrapper = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    wrapper.setAttribute('id', 'pc-zoom-wrapper')
    while (svg.firstChild) wrapper.appendChild(svg.firstChild)
    svg.appendChild(wrapper)

    const areaPaths = Array.from(container.querySelectorAll<SVGPathElement>('[id$="areapath"]'))

    for (const el of areaPaths) {
      const code = extractCode(el.id)
      if (!code) continue
      const name = postcodeAreaNames[code]
      const isActive = isAreaActive(code)

      el.setAttribute('tabindex', '0')
      el.setAttribute('role', 'button')
      el.setAttribute(
        'aria-label',
        `${name ?? code} postcode area${isActive ? ' — honey available' : ''}`
      )
      el.classList.add('pc-area')
      if (isActive) el.classList.add('pc-area--active')

      const activate = () => {
        setHoveredCode(null)
        // The zoom padding lets slivers of neighbouring areas peek in at the
        // edges of a drilled-in view — clicking one of those must back out
        // of the current drill-down first, otherwise its district grid (e.g.
        // Bristol's) stays on screen under the newly selected area.
        if (viewRef.current === 'district') {
          containerRef.current
            ?.querySelector<SVGGElement>('#pc-zoom-wrapper')
            ?.removeAttribute('transform')
        }
        if (code in districtDataByArea) {
          zoomToArea(code)
          setDrilledArea(code)
          setView('district')
          setSelectedCode(null)
        } else {
          setView('uk')
          setDrilledArea(null)
          setSelectedCode(code)
        }
      }
      el.addEventListener('click', activate)
      el.addEventListener('mouseenter', () => {
        if (viewRef.current === 'uk') setHoveredCode(code)
      })
      el.addEventListener('mouseleave', () => setHoveredCode(null))
      el.addEventListener('focus', () => {
        if (viewRef.current === 'uk') setHoveredCode(code)
      })
      el.addEventListener('blur', () => setHoveredCode(null))
      el.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          activate()
        }
      })
    }

    for (const el of container.querySelectorAll<SVGTextElement>('[id$="areatext"]')) {
      el.classList.add('pc-label')
    }
    // activeProducts intentionally not a dependency — this effect wires up
    // the SVG once; isAreaActive reads the prop's current closure value at
    // wiring time, which is fine since the map re-renders as a fresh
    // Server Component fetch when the underlying content actually changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function zoomToArea(code: string) {
    const container = containerRef.current
    const svg = container?.querySelector('svg')
    const wrapper = container?.querySelector<SVGGElement>('#pc-zoom-wrapper')
    const path = container?.querySelector<SVGPathElement>(`#${code}_areapath`)
    if (!svg || !wrapper || !path) return

    const bbox = path.getBBox()
    const vb = svg.viewBox.baseVal
    const padding = 1.7
    const scale = Math.min(vb.width / (bbox.width * padding), vb.height / (bbox.height * padding))
    const cx = bbox.x + bbox.width / 2
    const cy = bbox.y + bbox.height / 2
    const tx = (vb.x + vb.width / 2) / scale - cx
    const ty = (vb.y + vb.height / 2) / scale - cy
    wrapper.setAttribute('transform', `scale(${scale}) translate(${tx} ${ty})`)
  }

  function backToUk() {
    const wrapper = containerRef.current?.querySelector<SVGGElement>('#pc-zoom-wrapper')
    wrapper?.removeAttribute('transform')
    setView('uk')
    setDrilledArea(null)
    setSelectedCode(null)
    setHoveredCode(null)
  }

  // Keep visual state (selection outline, label visibility) in sync with
  // React state, since the SVG content is raw injected DOM, not React-owned.
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    for (const el of container.querySelectorAll<SVGPathElement>('[id$="areapath"]')) {
      const code = extractCode(el.id)
      el.classList.toggle(
        'pc-area--selected',
        code !== null && code === selectedCode && view === 'uk'
      )
    }
    for (const el of container.querySelectorAll<SVGTextElement>('[id$="areatext"]')) {
      const code = extractCode(el.id)
      const visible =
        code !== null && (code === hoveredCode || (view === 'uk' && code === selectedCode))
      el.classList.toggle('pc-label--visible', visible)
    }
  }, [selectedCode, hoveredCode, view])

  const currentAreaData = drilledArea ? districtDataByArea[drilledArea] : undefined
  const isDistrictSelection = view === 'district' && selectedCode !== null
  const activeProduct = selectedCode ? activeProducts[selectedCode] : undefined
  const areaName = selectedCode
    ? isDistrictSelection
      ? currentAreaData?.districts.find((d) => d.code === selectedCode)?.coverage
      : postcodeAreaNames[selectedCode]
    : undefined

  return (
    <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-start">
      <div>
        <p className="text-porcelain/50 mb-3 text-sm">
          Select a postcode area on the map, or{' '}
          <a href="#postcode-select" className="text-comb-gold underline underline-offset-2">
            skip to the list
          </a>
          .
        </p>
        <div
          ref={containerRef}
          role="group"
          aria-label="Interactive map of UK postcode areas"
          className="pc-map mx-auto max-w-[460px] lg:mx-0 [&_svg]:h-auto [&_svg]:w-full"
          dangerouslySetInnerHTML={{ __html: svgMarkup }}
        />
        {view === 'district' && (
          <button
            type="button"
            onClick={backToUk}
            className="border-porcelain/40 text-porcelain hover:border-porcelain focus-visible:outline-honey-amber mt-4 inline-block rounded-full border px-5 py-2 text-sm font-semibold focus-visible:outline focus-visible:outline-offset-2"
          >
            ← Back to UK map
          </button>
        )}
        <p className="text-porcelain/50 mt-3 text-xs">
          Map: British postcode areas by Richardguk, CC BY-SA 3.0. Contains Ordnance Survey and
          Royal Mail data © Crown copyright and database right, and National Statistics data © Crown
          copyright and database right.
        </p>
      </div>

      <div>
        {view === 'uk' ? (
          <>
            <label htmlFor="postcode-select" className="text-porcelain/60 text-sm">
              Or find your postcode area
            </label>
            <select
              id="postcode-select"
              value={selectedCode ?? ''}
              onChange={(e) => {
                const code = e.target.value
                setHoveredCode(null)
                if (code in districtDataByArea) {
                  zoomToArea(code)
                  setDrilledArea(code)
                  setView('district')
                  setSelectedCode(null)
                } else {
                  setSelectedCode(code)
                }
              }}
              className="border-ink-line bg-ink-surface text-porcelain focus-visible:outline-honey-amber mt-2 w-full rounded-lg border px-4 py-2.5 text-sm focus-visible:outline focus-visible:outline-offset-2"
            >
              <option value="" disabled>
                Choose a postcode area…
              </option>
              {postcodeAreaCodes.map((code) => (
                <option key={code} value={code}>
                  {code} — {postcodeAreaNames[code]}
                  {isAreaActive(code) ? ' (honey available)' : ''}
                </option>
              ))}
            </select>
          </>
        ) : (
          <>
            <p className="text-porcelain/60 text-sm">
              {currentAreaData?.areaLabel} ({drilledArea}) postcode districts
            </p>
            <div className="mt-2 grid max-h-64 grid-cols-3 gap-2 overflow-y-auto pr-1 sm:grid-cols-4">
              {currentAreaData?.districts.map((d) => {
                const isActive = d.code in activeProducts
                const isSelected = d.code === selectedCode
                return (
                  <button
                    key={d.code}
                    type="button"
                    onClick={() => setSelectedCode(d.code)}
                    aria-current={isSelected || undefined}
                    className={`focus-visible:outline-honey-amber rounded-lg border px-3 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-offset-2 ${
                      isSelected
                        ? 'border-comb-gold text-porcelain bg-ink-surface'
                        : isActive
                          ? 'border-honey-amber text-honey-amber hover:bg-ink-surface'
                          : 'border-ink-line text-porcelain/70 hover:bg-ink-surface hover:text-porcelain'
                    }`}
                  >
                    {d.code}
                  </button>
                )
              })}
            </div>
          </>
        )}

        <div className="border-ink-line bg-honeycomb-surface mt-6 rounded-2xl border p-6">
          {!selectedCode ? (
            <>
              <p className="text-porcelain/60 text-sm">
                {view === 'district'
                  ? `Select a ${currentAreaData?.areaLabel} district to see what’s available.`
                  : 'Select a postcode area to see what’s available.'}
              </p>
              <p className="text-porcelain/50 mt-4 text-sm">
                Keep bees yourself?{' '}
                <Link
                  href="/become-a-supplier"
                  className="text-comb-gold underline underline-offset-2"
                >
                  Become a supplier
                </Link>
                .
              </p>
            </>
          ) : activeProduct ? (
            <>
              <p className="text-honey-amber text-sm font-semibold tracking-wide uppercase">
                {selectedCode} &middot; {areaName}
              </p>
              {activeProduct.imageUrl && (
                <div className="from-ink-surface to-ink relative mt-4 aspect-square rounded-xl bg-gradient-to-b">
                  <Image
                    src={activeProduct.imageUrl}
                    alt={`A jar of ${activeProduct.name} honey`}
                    fill
                    sizes="320px"
                    className="object-contain p-8"
                  />
                </div>
              )}
              <p className="text-porcelain mt-4 text-lg font-semibold">{activeProduct.name}</p>
              <p className="text-porcelain/60 mt-1 text-sm">{activeProduct.tagline}</p>
              <Link
                href={`/shop/${activeProduct.slug}`}
                className="bg-honey-amber text-ink focus-visible:outline-porcelain mt-5 inline-block rounded-full px-6 py-2.5 text-sm font-semibold focus-visible:outline focus-visible:outline-offset-4"
              >
                View {activeProduct.name}
              </Link>
            </>
          ) : (
            <>
              <p className="text-comb-gold text-sm font-semibold tracking-wide uppercase">
                {selectedCode} &middot; {areaName}
              </p>
              <p className="text-porcelain mt-3 text-lg font-semibold">
                No honey from {selectedCode} yet.
              </p>
              <p className="text-porcelain/60 mt-2 text-sm">
                Let us know you&apos;d like honey from here and we&apos;ll get in touch when a
                beekeeper joins from your area — or if that&apos;s you, get in touch directly.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <a
                  href={`mailto:sales@gertlushhoney.co.uk?subject=Postcode%20honey%20interest%20-%20${selectedCode}&body=I'd like to hear about honey from ${encodeURIComponent(areaName ?? selectedCode)} (${selectedCode}) when it's available.`}
                  className="border-porcelain/40 text-porcelain hover:border-porcelain focus-visible:outline-honey-amber inline-block rounded-full border px-6 py-2.5 text-sm font-semibold focus-visible:outline focus-visible:outline-offset-4"
                >
                  Join the waiting list
                </a>
                <Link
                  href="/become-a-supplier"
                  className="bg-honey-amber text-ink focus-visible:outline-porcelain inline-block rounded-full px-6 py-2.5 text-sm font-semibold focus-visible:outline focus-visible:outline-offset-4"
                >
                  Become a supplier
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
