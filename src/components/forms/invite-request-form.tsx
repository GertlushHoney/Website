'use client'

import Link from 'next/link'
import { useId, useState, useTransition } from 'react'
import { requestInviteEmail, type InviteKind } from '@/lib/email/invite-requests'

// "Pop your email in and we'll send you the form" — emails the visitor the
// Become a Supplier or Meet the Beekeeper invite through the business's own
// Microsoft 365 (see src/lib/email/invite-requests.ts). Same shape as the
// newsletter and restock forms: native validation, a server action that
// never throws, and the review form's honeypot.
export function InviteRequestForm({
  kind,
  buttonLabel,
}: {
  kind: InviteKind
  buttonLabel: string
}) {
  const id = useId()
  const [email, setEmail] = useState('')
  const [companyWebsite, setCompanyWebsite] = useState('')
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await requestInviteEmail(kind, email, companyWebsite)
      if (result.ok) {
        setSentTo(email.trim())
      } else {
        setError(result.error)
      }
    })
  }

  if (sentTo) {
    return (
      <p className="text-porcelain mt-6 text-sm font-medium" role="status">
        Thanks — we&apos;ve emailed {sentTo}. If it hasn&apos;t arrived in a few minutes, check
        your junk folder.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 max-w-md">
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
          className="bg-ink border-ink-line text-porcelain placeholder:text-porcelain/40 focus-visible:outline-honey-amber flex-1 rounded-full border px-4 py-2.5 text-sm focus-visible:outline focus-visible:outline-offset-2"
        />
        <button
          type="submit"
          disabled={isPending}
          className="bg-honey-amber text-ink focus-visible:outline-porcelain shrink-0 rounded-full px-6 py-2.5 text-sm font-semibold focus-visible:outline focus-visible:outline-offset-4 disabled:opacity-50"
        >
          {isPending ? 'Sending…' : buttonLabel}
        </button>
      </div>

      {/* Honeypot — hidden from real visitors via CSS + tabIndex, but a
          form-filling bot fills every field it finds. */}
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
      <p className="text-porcelain/50 mt-3 text-xs">
        We&apos;ll only use your email to send you this and talk to you about it — see our{' '}
        <Link href="/legal/privacy" className="text-comb-gold underline underline-offset-2">
          privacy notice
        </Link>
        .
      </p>
    </form>
  )
}
