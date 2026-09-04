'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from './cart-context'

function formatGBP(amount: number) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount)
}

// Focus-trapped, keyboard-accessible slide-over — matches the
// "accessible (focus-trapped drawer)" acceptance criterion in
// docs/requirements-matrix.md. Opens automatically after adding an item
// (see cart-context.tsx); otherwise triggered from the header's basket
// button.
export function BasketDrawer() {
  const { cart, isOpen, isPending, error, close, updateItem, removeItem } = useCart()
  const panelRef = useRef<HTMLDivElement>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!isOpen) return

    previouslyFocused.current = document.activeElement as HTMLElement
    panelRef.current?.focus()

    function handleKeydown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        close()
        return
      }
      if (e.key !== 'Tab' || !panelRef.current) return

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled])'
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
  }, [isOpen, close])

  if (!isOpen) return null

  const lines = cart?.lines ?? []

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Close basket"
        onClick={close}
        className="absolute inset-0 bg-black/60"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Basket"
        tabIndex={-1}
        className="bg-ink border-ink-line relative flex h-full w-full max-w-md flex-col border-l shadow-2xl focus:outline-none"
      >
        <div className="border-ink-line flex items-center justify-between border-b p-5">
          <p className="text-porcelain text-lg font-semibold">Your basket</p>
          <button
            type="button"
            onClick={close}
            aria-label="Close basket"
            className="text-porcelain/60 hover:text-porcelain focus-visible:outline-honey-amber rounded-full p-1 focus-visible:outline focus-visible:outline-offset-2"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {error && (
            <p className="text-honey-amber mb-4 text-sm" role="alert">
              {error}
            </p>
          )}

          {lines.length === 0 ? (
            <p className="text-porcelain/60 text-sm">
              Your basket is empty.{' '}
              <Link
                href="/shop"
                onClick={close}
                className="text-comb-gold underline underline-offset-2"
              >
                Browse the shop
              </Link>
              .
            </p>
          ) : (
            <ul className="space-y-5">
              {lines.map((line) => (
                <li key={line.id} className="flex gap-4">
                  <div className="from-ink-surface to-ink relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gradient-to-b">
                    {line.imageUrl && (
                      <Image
                        src={line.imageUrl}
                        alt={line.productTitle}
                        fill
                        sizes="80px"
                        className="object-contain p-2"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-porcelain text-sm font-semibold">
                      {line.productTitle}
                      {line.sellingPlanName && (
                        <span className="text-comb-gold font-normal"> &middot; monthly</span>
                      )}
                    </p>
                    {line.attributes.map((attr) => (
                      <p key={attr.key} className="text-porcelain/60 text-xs">
                        {attr.key}: {attr.value}
                      </p>
                    ))}
                    <p className="text-porcelain/60 mt-0.5 text-sm">
                      {formatGBP(line.price)}
                      {line.sellingPlanName && '/month'}
                    </p>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="border-ink-line flex items-center rounded-full border">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          disabled={isPending}
                          onClick={() => updateItem(line.id, line.quantity - 1)}
                          className="text-porcelain hover:text-honey-amber focus-visible:outline-honey-amber px-2.5 py-1 text-sm leading-none focus-visible:outline focus-visible:outline-offset-2 disabled:opacity-50"
                        >
                          −
                        </button>
                        <span className="text-porcelain w-5 text-center text-xs" aria-live="polite">
                          {line.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          disabled={isPending}
                          onClick={() => updateItem(line.id, line.quantity + 1)}
                          className="text-porcelain hover:text-honey-amber focus-visible:outline-honey-amber px-2.5 py-1 text-sm leading-none focus-visible:outline focus-visible:outline-offset-2 disabled:opacity-50"
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => removeItem(line.id)}
                        className="text-porcelain/50 hover:text-porcelain focus-visible:outline-honey-amber text-xs underline underline-offset-2 focus-visible:outline focus-visible:outline-offset-2 disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {lines.length > 0 && cart && (
          <div className="border-ink-line border-t p-5">
            <p className="text-porcelain flex justify-between text-base font-semibold">
              <span>Subtotal</span>
              <span>{formatGBP(cart.subtotal)}</span>
            </p>
            <p className="text-porcelain/50 mt-1 text-xs">Delivery calculated at checkout.</p>
            <a
              href={cart.checkoutUrl}
              className="bg-honey-amber text-ink focus-visible:outline-porcelain mt-4 block rounded-full px-6 py-3 text-center text-sm font-semibold focus-visible:outline focus-visible:outline-offset-4"
            >
              Checkout
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
