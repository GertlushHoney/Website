'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { subscribeToNewsletter } from '@/lib/shopify/customer'
import type { NewsletterPopupContent } from '@/lib/sanity/newsletter-popup'

// localStorage, not sessionStorage — once a visitor has been shown this
// (dismissed or subscribed, doesn't matter which), it should stay gone on
// every future visit too, not just for the rest of this one tab session.
// See "REDUCE NEWSLETTER POPUP AGGRESSION" audit, 2026-09-13 — the
// previous ~6-second sessionStorage-only version could interrupt someone
// before they'd finished reading the splash screen, and would show again
// on every new browser session even for someone who'd already dismissed
// it days earlier.
const STORAGE_KEY = 'gert-lush-newsletter-popup-seen'

// Exit-intent only makes sense with a real pointer that can move "toward"
// the browser chrome and be read as about-to-leave — a touch screen has no
// equivalent gesture, so this is desktop-only. `(pointer: fine)` is a
// reasonable proxy for "has a mouse/trackpad" without user-agent sniffing.
function hasFinePointer(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches
}

// Content editable in Sanity Studio (see
// src/sanity/schemaTypes/newsletterPopup.ts) so wording, the discount
// offer, and the delay can all change without a redeploy. Same
// accessible-dialog shape as the basket drawer and search overlay
// (focus-trapped, Escape/backdrop/close-button dismissal, focus restored
// on close).
//
// Shows on whichever of these happens first:
//  - content.delaySeconds of genuine dwell time on the site (now a
//    20-30s-range default, not the old ~6s — see newsletterPopup.ts);
//  - on desktop only, exit-intent — the cursor leaving via the top of the
//    viewport, as if reaching for the tab bar/address bar to leave. This
//    is the one moment showing a popup is low-cost rather than intrusive:
//    the visitor was about to go anyway, so it can't interrupt browsing
//    that would otherwise have continued.
// Never shown at all if localStorage already has the "seen" flag, so it
// can only ever appear once per browser, full stop.
export function NewsletterPopup({ content }: { content: NewsletterPopupContent }) {
  const [visible, setVisible] = useState(false)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'success'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!content.enabled) return
    let alreadySeen = false
    try {
      alreadySeen = Boolean(localStorage.getItem(STORAGE_KEY))
    } catch {
      // Private browsing / storage blocked — fall back to showing once per
      // tab session further down is not worth the complexity here; simplest
      // safe behaviour is to just not show it rather than risk showing it
      // repeatedly with no way to remember dismissal at all.
      return
    }
    if (alreadySeen) return

    const usingExitIntent = hasFinePointer()

    // Whichever trigger fires first tears down the other — no point
    // leaving a timer or listener running for a popup that's already
    // showing (or about to).
    function show() {
      clearTimeout(timer)
      if (usingExitIntent) {
        document.removeEventListener('mouseout', handleExitIntent)
      }
      setVisible(true)
      try {
        localStorage.setItem(STORAGE_KEY, '1')
      } catch {
        // Nothing more to do — worst case it can show again next visit.
      }
    }

    const timer = setTimeout(show, content.delaySeconds * 1000)

    function handleExitIntent(event: MouseEvent) {
      // clientY <= 0 means the cursor has crossed the top edge of the
      // viewport, heading toward the browser's own tab/address bar.
      if (event.clientY <= 0) show()
    }

    if (usingExitIntent) {
      document.addEventListener('mouseout', handleExitIntent)
    }

    return () => {
      clearTimeout(timer)
      if (usingExitIntent) {
        document.removeEventListener('mouseout', handleExitIntent)
      }
    }
  }, [content.enabled, content.delaySeconds])

  useEffect(() => {
    if (!visible) return
    panelRef.current?.focus()

    function handleKeydown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setVisible(false)
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
    return () => document.removeEventListener('keydown', handleKeydown)
  }, [visible])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await subscribeToNewsletter(email)
      if (result.ok) {
        setStatus('success')
      } else {
        setError(result.error)
      }
    })
  }

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close"
        onClick={() => setVisible(false)}
        className="absolute inset-0 bg-black/60"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={content.heading}
        tabIndex={-1}
        className="border-ink-line bg-ink absolute top-1/2 left-1/2 w-[calc(100vw-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border p-6 text-center shadow-2xl focus:outline-none sm:p-8"
      >
        <button
          type="button"
          onClick={() => setVisible(false)}
          aria-label="Close"
          className="text-porcelain/60 hover:text-porcelain focus-visible:outline-honey-amber absolute top-4 right-4 rounded-full p-1 focus-visible:outline focus-visible:outline-offset-2"
        >
          ✕
        </button>

        {status === 'success' ? (
          <div role="status">
            <p className="text-porcelain text-lg font-semibold text-balance">You&apos;re in!</p>
            <p className="text-porcelain/70 mt-2 text-sm">
              We&apos;ll email you when new postcode honey arrives.
            </p>
            {content.discountCode && (
              <p className="border-honey-amber/40 bg-honeycomb-surface mt-4 rounded-xl border p-3 text-sm">
                <span className="text-porcelain/70">Use code </span>
                <span className="text-comb-gold font-semibold">{content.discountCode}</span>
                <span className="text-porcelain/70"> at checkout.</span>
              </p>
            )}
          </div>
        ) : (
          <>
            <p className="text-porcelain text-lg font-semibold text-balance">{content.heading}</p>
            <p className="text-porcelain/70 mt-2 text-sm">{content.body}</p>
            {content.discountCode && content.discountLabel && (
              <p className="text-comb-gold mt-2 text-sm font-semibold">{content.discountLabel}</p>
            )}

            <form onSubmit={handleSubmit} className="mt-5">
              <label htmlFor="newsletter-popup-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-popup-email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-ink-surface border-ink-line text-porcelain placeholder:text-porcelain/40 focus-visible:outline-honey-amber w-full rounded-full border px-4 py-2.5 text-center text-sm focus-visible:outline focus-visible:outline-offset-2"
              />
              <button
                type="submit"
                disabled={isPending}
                className="bg-honey-amber text-ink focus-visible:outline-porcelain mt-3 w-full rounded-full px-6 py-2.5 text-sm font-semibold focus-visible:outline focus-visible:outline-offset-4 disabled:opacity-50"
              >
                {isPending ? 'Joining…' : content.buttonLabel}
              </button>
              {error && (
                <p className="text-honey-amber mt-2 text-sm" role="alert">
                  {error}
                </p>
              )}
            </form>
          </>
        )}
      </div>
    </div>
  )
}
