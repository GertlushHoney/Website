'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { subscribeToNewsletter } from '@/lib/shopify/customer'
import type { NewsletterPopupContent } from '@/lib/sanity/newsletter-popup'

const SESSION_KEY = 'gert-lush-newsletter-popup-seen'

// Once-per-session popup, content editable in Sanity Studio (see
// src/sanity/schemaTypes/newsletterPopup.ts) so wording, the discount
// offer, and the delay can all change without a redeploy. Same
// accessible-dialog shape as the basket drawer and search overlay
// (focus-trapped, Escape/backdrop/close-button dismissal, focus restored
// on close) and the same "mark as seen in sessionStorage" pattern as the
// splash screen, so it never shows twice in one browsing session.
export function NewsletterPopup({ content }: { content: NewsletterPopupContent }) {
  const [visible, setVisible] = useState(false)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'success'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!content.enabled) return
    if (sessionStorage.getItem(SESSION_KEY)) return

    const timer = setTimeout(() => {
      setVisible(true)
      sessionStorage.setItem(SESSION_KEY, '1')
    }, content.delaySeconds * 1000)

    return () => clearTimeout(timer)
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
