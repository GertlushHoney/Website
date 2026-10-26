'use client'

import { useEffect, useState, useTransition } from 'react'
import { sendContactMessage } from '@/lib/email/contact'
import { CONTACT_TOPICS } from '@/lib/email/contact-topics'

// Sends through a Server Action (src/lib/email/contact.ts) — the visitor
// needs no email app, and our address never reaches the browser at all.
export function ContactForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [topic, setTopic] = useState<string>(CONTACT_TOPICS[0])
  const [message, setMessage] = useState('')
  const [companyWebsite, setCompanyWebsite] = useState('')
  const [humanAnswer, setHumanAnswer] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Math.random can't run during render (impure), so this starts fixed and
  // re-rolls once in an effect after mount — same reasoning as the random
  // featured-product pick in featured-product.tsx. Stays put across
  // re-renders since the effect only runs once.
  const [[a, b], setSum] = useState([1, 1])
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSum([1 + Math.floor(Math.random() * 8), 1 + Math.floor(Math.random() * 8)])
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!name.trim() || !message.trim()) {
      setError('Fill in your name and a message.')
      return
    }
    if (Number(humanAnswer) !== a + b) {
      setError(`That's not quite right — what's ${a} + ${b}?`)
      return
    }

    startTransition(async () => {
      // A filled honeypot is reported as success by the server without
      // sending anything, so a bot doesn't learn it was rejected.
      const result = await sendContactMessage({
        name,
        email,
        topic,
        message,
        honeypot: companyWebsite,
      })
      if (result.ok) {
        setSentTo(email.trim())
      } else {
        setError(result.error)
      }
    })
  }

  if (sentTo) {
    return (
      <p
        className="border-ink-line bg-honeycomb-surface text-porcelain mt-8 rounded-xl border p-5 text-sm"
        role="status"
      >
        Thanks — your message is on its way. We&apos;ll reply to {sentTo}, usually within a day or
        two. If you don&apos;t hear back, check your junk folder.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="border-ink-line bg-honeycomb-surface mt-8 rounded-xl border p-5">
      <div>
        <label htmlFor="contact-name" className="text-porcelain/60 block text-sm">
          Your name
        </label>
        <input
          id="contact-name"
          type="text"
          required
          maxLength={100}
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-ink border-ink-line text-porcelain placeholder:text-porcelain/40 focus-visible:outline-honey-amber mt-1 w-full rounded-lg border px-3 py-2 text-sm focus-visible:outline focus-visible:outline-offset-2"
        />
      </div>

      <div className="mt-4">
        <label htmlFor="contact-email" className="text-porcelain/60 block text-sm">
          Your email (so we can reply)
        </label>
        <input
          id="contact-email"
          type="email"
          required
          maxLength={254}
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-ink border-ink-line text-porcelain placeholder:text-porcelain/40 focus-visible:outline-honey-amber mt-1 w-full rounded-lg border px-3 py-2 text-sm focus-visible:outline focus-visible:outline-offset-2"
        />
      </div>

      <div className="mt-4">
        <label htmlFor="contact-topic" className="text-porcelain/60 block text-sm">
          What&apos;s it about
        </label>
        <select
          id="contact-topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="bg-ink border-ink-line text-porcelain focus-visible:outline-honey-amber mt-1 w-full rounded-lg border px-3 py-2 text-sm focus-visible:outline focus-visible:outline-offset-2"
        >
          {CONTACT_TOPICS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4">
        <label htmlFor="contact-message" className="text-porcelain/60 block text-sm">
          Your message
        </label>
        <textarea
          id="contact-message"
          required
          rows={5}
          maxLength={5000}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="bg-ink border-ink-line text-porcelain placeholder:text-porcelain/40 focus-visible:outline-honey-amber mt-1 w-full rounded-lg border px-3 py-2 text-sm focus-visible:outline focus-visible:outline-offset-2"
        />
      </div>

      <div className="mt-4">
        <label htmlFor="contact-human-check" className="text-porcelain/60 block text-sm">
          Quick check you&apos;re human: what&apos;s {a} + {b}?
        </label>
        <input
          id="contact-human-check"
          type="text"
          inputMode="numeric"
          required
          value={humanAnswer}
          onChange={(e) => setHumanAnswer(e.target.value)}
          className="bg-ink border-ink-line text-porcelain placeholder:text-porcelain/40 focus-visible:outline-honey-amber mt-1 w-24 rounded-lg border px-3 py-2 text-sm focus-visible:outline focus-visible:outline-offset-2"
        />
      </div>

      {/* Honeypot — hidden from real visitors via CSS + tabIndex, but a
          form-filling bot fills every field it finds. */}
      <div className="h-0 w-0 overflow-hidden opacity-0" aria-hidden="true">
        <label htmlFor="contact-company-website">Company website</label>
        <input
          id="contact-company-website"
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
        disabled={isPending}
        className="bg-honey-amber text-ink focus-visible:outline-porcelain mt-4 rounded-full px-6 py-2.5 text-sm font-semibold focus-visible:outline focus-visible:outline-offset-4 disabled:opacity-50"
      >
        {isPending ? 'Sending…' : 'Send message'}
      </button>
    </form>
  )
}
