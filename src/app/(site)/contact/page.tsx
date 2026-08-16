import type { Metadata } from 'next'
import { ContactForm } from '@/components/contact/contact-form'

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
        Orders, subscriptions, wholesale and supplier enquiries — but also anything else: spotted
        something on the website that could be better, want to suggest a postcode or area we
        should try to source honey from next, or just have a question. Fill in the form below and
        it&apos;ll open in your own email app, addressed to us and ready to send.
      </p>

      <ContactForm />

      <p className="text-porcelain/50 mt-6 text-sm">
        We&apos;re a small, independent operation, so replies are by a real person rather than an
        automated system — please bear with us if it takes a day or two.
      </p>
    </div>
  )
}
