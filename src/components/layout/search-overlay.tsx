'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import Link from 'next/link'
import type { SearchItem } from '@/lib/search'

// Same accessible-dialog shape as the basket drawer (focus-trapped,
// Escape/backdrop/close-button dismissal, focus restored to the trigger on
// close) — replaces the old header "Search" button, which had no
// onClick handler at all and did nothing when clicked.
//
// Portaled to document.body for the same reason as MobileNav's overlay:
// SiteHeader's backdrop-blur-md creates a containing block for `position:
// fixed` descendants, which would otherwise squash this into the header bar.
export function SearchOverlay({ items }: { items: SearchItem[] }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const panelRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return

    const trigger = triggerRef.current
    inputRef.current?.focus()

    function handleKeydown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        close()
        return
      }
      if (e.key !== 'Tab' || !panelRef.current) return

      const focusable = panelRef.current.querySelectorAll<HTMLElement>('a[href], input, button')
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeydown)
    return () => {
      document.removeEventListener('keydown', handleKeydown)
      trigger?.focus()
    }
  }, [open])

  function close() {
    setOpen(false)
    setQuery('')
  }

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    const matches = q
      ? items.filter(
          (item) =>
            item.name.toLowerCase().includes(q) ||
            item.tagline.toLowerCase().includes(q) ||
            item.category.toLowerCase().includes(q)
        )
      : items
    return matches.slice(0, 8)
  }, [items, query])

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search"
        className="hover:text-porcelain focus-visible:outline-honey-amber rounded-full focus-visible:outline focus-visible:outline-offset-2"
      >
        Search
      </button>

      {open &&
        createPortal(
          <div className="fixed inset-0 z-50">
            <button
              type="button"
              aria-label="Close search"
              onClick={close}
              className="absolute inset-0 bg-black/60"
            />
            <div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-label="Search"
              className="border-ink-line bg-ink relative mx-auto mt-24 w-[calc(100vw-2rem)] max-w-lg rounded-2xl border shadow-2xl"
            >
              <div className="border-ink-line flex items-center gap-3 border-b px-5 py-4">
                <span aria-hidden="true" className="text-porcelain/40">
                  &#8981;
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search honey, candles, soap…"
                  className="text-porcelain placeholder:text-porcelain/40 flex-1 bg-transparent text-sm focus:outline-none"
                />
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close search"
                  className="text-porcelain/60 hover:text-porcelain focus-visible:outline-honey-amber rounded-full p-1 focus-visible:outline focus-visible:outline-offset-2"
                >
                  ✕
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto p-2">
                {results.length === 0 ? (
                  <p className="text-porcelain/50 px-3 py-6 text-center text-sm">
                    No matches for &quot;{query}&quot;.
                  </p>
                ) : (
                  <ul>
                    {results.map((item) => (
                      <li key={item.id}>
                        <Link
                          href={item.href}
                          onClick={close}
                          className="hover:bg-honeycomb-surface focus-visible:outline-honey-amber flex items-center gap-3 rounded-xl p-2.5 focus-visible:outline focus-visible:-outline-offset-2"
                        >
                          <div className="from-ink-surface to-ink relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gradient-to-b">
                            {item.imageUrl && (
                              <Image
                                src={item.imageUrl}
                                alt=""
                                fill
                                sizes="48px"
                                className="object-contain p-1"
                              />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-porcelain truncate text-sm font-semibold">
                              {item.name}
                            </p>
                            <p className="text-porcelain/50 truncate text-xs">
                              {item.category} &middot; {item.tagline}
                            </p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  )
}
