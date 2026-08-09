import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with Gert Lush Honey.',
}

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <p className="text-honey-amber text-sm font-semibold tracking-wide uppercase">Contact</p>
      <h1 className="text-porcelain mt-3 text-4xl font-bold tracking-tight text-balance">
        Get in touch.
      </h1>
      <p className="text-porcelain/70 mt-4 text-base">
        Orders, subscriptions, wholesale, supplier enquiries, or just a question about the honey —
        email is the quickest way to reach us right now.
      </p>

      <a
        href="mailto:gertlushhoney@outlook.com"
        className="bg-honey-amber text-ink focus-visible:outline-porcelain mt-8 inline-block rounded-full px-6 py-2.5 text-sm font-semibold focus-visible:outline focus-visible:outline-offset-4"
      >
        gertlushhoney@outlook.com
      </a>

      <p className="text-porcelain/50 mt-10 text-sm">
        We&apos;re a small, independent operation, so replies are by a real person rather than an
        automated system — please bear with us if it takes a day or two.
      </p>
    </div>
  )
}
