'use client'

import { useState, useTransition } from 'react'
import { submitReview } from '@/lib/sanity/submit-review'

export function ReviewForm({ productSlug, productName }: { productSlug: string; productName: string }) {
  const [reviewerName, setReviewerName] = useState('')
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [body, setBody] = useState('')
  const [companyWebsite, setCompanyWebsite] = useState('')
  const [status, setStatus] = useState<'idle' | 'success'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await submitReview({
        productSlug,
        productName,
        reviewerName,
        rating,
        body,
        companyWebsite,
      })
      if (result.ok) {
        setStatus('success')
      } else {
        setError(result.error)
      }
    })
  }

  if (status === 'success') {
    return (
      <p className="border-ink-line bg-honeycomb-surface text-porcelain mt-6 rounded-xl border p-5 text-sm" role="status">
        Thanks — your review is in and will show once it&apos;s been checked.
      </p>
    )
  }

  const displayRating = hoverRating || rating

  return (
    <form onSubmit={handleSubmit} className="border-ink-line bg-honeycomb-surface mt-6 rounded-xl border p-5">
      <h3 className="text-porcelain text-sm font-semibold">Write a review</h3>

      <div className="mt-4">
        <span className="text-porcelain/60 block text-sm">Your rating</span>
        <div className="mt-1 flex gap-1" role="radiogroup" aria-label="Rating out of 5">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={rating === value}
              aria-label={`${value} star${value === 1 ? '' : 's'}`}
              onClick={() => setRating(value)}
              onMouseEnter={() => setHoverRating(value)}
              onMouseLeave={() => setHoverRating(0)}
              className="focus-visible:outline-honey-amber text-2xl leading-none focus-visible:outline focus-visible:outline-offset-2"
            >
              <span className={value <= displayRating ? 'text-honey-amber' : 'text-porcelain/25'}>★</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor="reviewer-name" className="text-porcelain/60 block text-sm">
          Your name
        </label>
        <input
          id="reviewer-name"
          type="text"
          required
          autoComplete="name"
          value={reviewerName}
          onChange={(e) => setReviewerName(e.target.value)}
          className="bg-ink border-ink-line text-porcelain placeholder:text-porcelain/40 focus-visible:outline-honey-amber mt-1 w-full rounded-lg border px-3 py-2 text-sm focus-visible:outline focus-visible:outline-offset-2"
        />
      </div>

      <div className="mt-4">
        <label htmlFor="review-body" className="text-porcelain/60 block text-sm">
          Your review
        </label>
        <textarea
          id="review-body"
          required
          minLength={10}
          maxLength={2000}
          rows={4}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="bg-ink border-ink-line text-porcelain placeholder:text-porcelain/40 focus-visible:outline-honey-amber mt-1 w-full rounded-lg border px-3 py-2 text-sm focus-visible:outline focus-visible:outline-offset-2"
        />
      </div>

      {/* Honeypot — hidden from real visitors via CSS + tabIndex, but a
          form-filling bot fills every field it finds. */}
      <div className="h-0 w-0 overflow-hidden opacity-0" aria-hidden="true">
        <label htmlFor="company-website">Company website</label>
        <input
          id="company-website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={companyWebsite}
          onChange={(e) => setCompanyWebsite(e.target.value)}
        />
      </div>

      {error && (
        <p className="text-honey-amber mt-3 text-sm" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending || rating === 0}
        className="bg-honey-amber text-ink focus-visible:outline-porcelain mt-4 rounded-full px-6 py-2.5 text-sm font-semibold focus-visible:outline focus-visible:outline-offset-4 disabled:opacity-50"
      >
        {isPending ? 'Submitting…' : 'Submit review'}
      </button>
    </form>
  )
}
