'use client'

import { useEffect, useState } from 'react'

const TOPICS = [
  'Website feedback or a bug',
  'Honey from a specific postcode/area',
  'An order or subscription',
  'Wholesale or stocking Gert Lush Honey',
  'Something else',
]

// Assembles the mailto: link entirely here, in the browser, at submit time
// — the address never appears as literal text anywhere in this component's
// server-rendered output, so a bot scraping the page's HTML has nothing to
// harvest. It does still exist inside the downloaded JS bundle (any client
// component's code ships to the browser), so this raises the bar against
// simple scrapers rather than making harvesting impossible outright.
const CONTACT_EMAIL = ['hello', 'gertlushhoney.co.uk'].join('@')

export function ContactForm() {
  const [name, setName] = useState('')
  const [topic, setTopic] = useState(TOPICS[0])
  const [message, setMessage] = useState('')
  const [companyWebsite, setCompanyWebsite] = useState('')
  const [humanAnswer, setHumanAnswer] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'sent'>('idle')

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

    if (companyWebsite.trim() !== '') {
      // Honeypot tripped — report success without doing anything, so a bot
      // doesn't learn its submission was rejected.
      setStatus('sent')
      return
    }
    if (!name.trim() || !message.trim()) {
      setError('Fill in your name and a message.')
      return
    }
    if (Number(humanAnswer) !== a + b) {
      setError(`That's not quite right — what's ${a} + ${b}?`)
      return
    }

    const subject = `${topic} — via gertlushhoney.co.uk`
    const body = `${message}\n\n— ${name}`
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    setStatus('sent')
  }

  if (status === 'sent') {
    return (
      <p className="border-ink-line bg-honeycomb-surface text-porcelain mt-8 rounded-xl border p-5 text-sm" role="status">
        Your email app should be opening now, addressed to us with your message already filled
        in — just hit send from there. If nothing opened, your device might not have a mail app
        set up.
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
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
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
          {TOPICS.map((t) => (
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
        className="bg-honey-amber text-ink focus-visible:outline-porcelain mt-4 rounded-full px-6 py-2.5 text-sm font-semibold focus-visible:outline focus-visible:outline-offset-4"
      >
        Send message
      </button>
    </form>
  )
}
