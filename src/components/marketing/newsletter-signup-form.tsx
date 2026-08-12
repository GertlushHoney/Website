'use client'

import { useState, useTransition } from 'react'
import { subscribeToNewsletter } from '@/lib/shopify/customer'

// Subscribes to Shopify's own marketing list (see
// src/lib/shopify/customer.ts) — no third-party email service involved.
// Same try/catch-around-a-server-action pattern as the basket
// (cart-context.tsx): the action never throws, so this only needs to
// handle its own ok:false result, not exceptions.
export function NewsletterSignupForm({ defaultEmail }: { defaultEmail?: string }) {
  const [email, setEmail] = useState(defaultEmail ?? '')
  const [status, setStatus] = useState<'idle' | 'success'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

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

  if (status === 'success') {
    return (
      <p className="text-porcelain text-sm font-medium" role="status">
        You&apos;re on the list — we&apos;ll email you when new honey arrives.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm">
      <div className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
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
          {isPending ? 'Signing up…' : 'Sign up'}
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
