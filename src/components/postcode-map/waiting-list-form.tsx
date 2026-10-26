'use client'

import { useId, useState, useTransition } from 'react'
import { joinPostcodeWaitingList } from '@/lib/email/waiting-list'

// "Pop your email in and we'll let you know" — the postcode map's waiting
// list for an area with no honey yet. Same shape as the invite, newsletter
// and restock forms: native validation, a server action that never throws,
// and the review form's honeypot.
export function WaitingListForm({ areaCode }: { areaCode: string }) {
  const id = useId()
  const [email, setEmail] = useState('')
  const [companyWebsite, setCompanyWebsite] = useState('')
  const [news, setNews] = useState(false)
  const [joined, setJoined] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await joinPostcodeWaitingList(areaCode, email, companyWebsite, news)
      if (result.ok) {
        setJoined(true)
      } else {
        setError(result.error)
      }
    })
  }

  if (joined) {
    return (
      <p className="text-porcelain mt-5 text-sm font-medium" role="status">
        Thanks — you&apos;re on the list for {areaCode}. We&apos;ll be in touch when a beekeeper
        joins from your area.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-5">
      <div className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor={`${id}-email`} className="sr-only">
          Email address
        </label>
        <input
          id={`${id}-email`}
          type="email"
          required
          maxLength={254}
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-ink border-ink-line text-porcelain placeholder:text-porcelain/40 focus-visible:outline-honey-amber min-w-0 flex-1 rounded-full border px-4 py-2.5 text-sm focus-visible:outline focus-visible:outline-offset-2"
        />
        <button
          type="submit"
          disabled={isPending}
          className="border-porcelain/40 bg-porcelain/10 text-porcelain hover:bg-porcelain/20 hover:border-porcelain focus-visible:outline-honey-amber shrink-0 rounded-full border px-6 py-2.5 text-sm font-semibold focus-visible:outline focus-visible:outline-offset-4 disabled:opacity-50"
        >
          {isPending ? 'Joining…' : 'Join the waiting list'}
        </button>
      </div>

      <label className="text-porcelain/70 mt-3 flex cursor-pointer items-start gap-2 text-sm">
        <input
          type="checkbox"
          checked={news}
          onChange={(e) => setNews(e.target.checked)}
          className="accent-honey-amber focus-visible:outline-honey-amber mt-0.5 h-4 w-4 shrink-0 focus-visible:outline focus-visible:outline-offset-2"
        />
        <span>Also send me news of new honeys (optional)</span>
      </label>

      <div className="h-0 w-0 overflow-hidden opacity-0" aria-hidden="true">
        <label htmlFor={`${id}-company-website`}>Company website</label>
        <input
          id={`${id}-company-website`}
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={companyWebsite}
          onChange={(e) => setCompanyWebsite(e.target.value)}
        />
      </div>

      {error && (
        <p className="text-honey-amber mt-2 text-sm" role="alert">
          {error}
        </p>
      )}
    </form>
  )
}
