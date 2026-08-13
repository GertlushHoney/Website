'use client'

import { useState, useTransition } from 'react'
import { subscribeToRestockAlert } from '@/lib/shopify/restock'

// Tags the customer in Shopify with restock:<handle> (see
// src/lib/shopify/restock.ts) rather than a generic "new honey" signup —
// lets a store owner build a Shopify Email segment for just this product
// when it comes back, instead of emailing everyone on the list.
export function RestockAlertForm({
  productName,
  productHandle,
}: {
  productName: string
  productHandle: string
}) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'success'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await subscribeToRestockAlert(email, productHandle, productName)
      if (result.ok) {
        setStatus('success')
      } else {
        setError(result.error)
      }
    })
  }

  if (status === 'success') {
    return (
      <p className="text-porcelain mt-4 text-sm font-medium" role="status">
        We&apos;ll email you when {productName} is back in stock.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <p className="text-porcelain/60 text-sm">Want to know when it&apos;s back?</p>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <label htmlFor="restock-email" className="sr-only">
          Email address
        </label>
        <input
          id="restock-email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-ink border-ink-line text-porcelain placeholder:text-porcelain/40 focus-visible:outline-honey-amber flex-1 rounded-full border px-4 py-2.5 text-sm focus-visible:outline focus-visible:outline-offset-2"
        />
        <button
          type="submit"
          disabled={isPending}
          className="bg-honey-amber text-ink focus-visible:outline-porcelain shrink-0 rounded-full px-6 py-2.5 text-sm font-semibold focus-visible:outline focus-visible:outline-offset-4 disabled:opacity-50"
        >
          {isPending ? 'Signing up…' : 'Notify me'}
        </button>
      </div>
      {error && (
        <p className="text-honey-amber mt-2 text-sm" role="alert">
          {error}
        </p>
      )}
    </form>
  )
}
