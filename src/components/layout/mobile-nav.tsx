'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { primaryNav } from '@/lib/navigation'

// Same accessible-dialog shape as the basket drawer and search overlay
// (focus-trapped, Escape/backdrop/close-button dismissal, focus restored to
// the trigger on close). Only rendered below the `md` breakpoint — the
// header's own <nav> already shows these links inline at `md` and up.
export function MobileNav() {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return

    previouslyFocused.current = document.activeElement as HTMLElement
    panelRef.current?.focus()

    function handleKeydown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false)
        return
      }
      if (e.key !== 'Tab' || !panelRef.current) return

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])'
      )
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
      previouslyFocused.current?.focus()
    }
  }, [open])

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        className="hover:text-porcelain focus-visible:outline-honey-amber flex flex-col gap-[5px] rounded-full p-1 focus-visible:outline focus-visible:outline-offset-2"
      >
        <span className="bg-porcelain block h-0.5 w-5" />
        <span className="bg-porcelain block h-0.5 w-5" />
        <span className="bg-porcelain block h-0.5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-start">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/60"
          />
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Primary"
            tabIndex={-1}
            className="bg-ink border-ink-line relative flex h-full w-full max-w-xs flex-col border-r shadow-2xl focus:outline-none"
          >
            <div className="border-ink-line flex items-center justify-between border-b p-5">
              <span className="font-display text-comb-gold text-lg tracking-wide uppercase">
                Menu
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="text-porcelain/60 hover:text-porcelain focus-visible:outline-honey-amber rounded-full p-1 focus-visible:outline focus-visible:outline-offset-2"
              >
                ✕
              </button>
            </div>

            <ul className="flex-1 overflow-y-auto p-5">
              {primaryNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="text-porcelain focus-visible:outline-honey-amber block rounded-lg px-2 py-3 text-base font-medium focus-visible:outline focus-visible:-outline-offset-2"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
