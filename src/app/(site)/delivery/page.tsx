import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Delivery',
  description: 'Delivery information for Gert Lush Honey orders.',
}

export default function DeliveryPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <p className="text-honey-amber text-sm font-semibold tracking-wide uppercase">Delivery</p>
      <h1 className="text-porcelain mt-3 text-4xl font-bold tracking-tight text-balance">
        Getting your honey to you.
      </h1>

      <dl className="mt-10 space-y-4">
        <div className="border-ink-line flex flex-col gap-1 border-t pt-4 sm:flex-row sm:gap-4">
          <dt className="text-porcelain/50 w-36 shrink-0 text-sm">Service</dt>
          <dd className="text-porcelain/90 text-sm">
            Royal Mail Tracked 48 — tracked, typically arrives in 2–3 working days.
          </dd>
        </div>
        <div className="border-ink-line flex flex-col gap-1 border-t pt-4 sm:flex-row sm:gap-4">
          <dt className="text-porcelain/50 w-36 shrink-0 text-sm">Cost</dt>
          <dd className="text-porcelain/90 text-sm">
            £4.99 flat rate per order, however many jars you order.
          </dd>
        </div>
        <div className="border-ink-line flex flex-col gap-1 border-t pt-4 sm:flex-row sm:gap-4">
          <dt className="text-porcelain/50 w-36 shrink-0 text-sm">Coverage</dt>
          <dd className="text-porcelain/90 text-sm">UK delivery only, for now.</dd>
        </div>
        <div className="border-ink-line flex flex-col gap-1 border-t pt-4 sm:flex-row sm:gap-4">
          <dt className="text-porcelain/50 w-36 shrink-0 text-sm">Subscriptions</dt>
          <dd className="text-porcelain/90 text-sm">
            Monthly subscription jars are sent the same way, with delivery charged each month.
          </dd>
        </div>
      </dl>

      <p className="text-porcelain/50 mt-10 text-sm">
        Returns and packaging-damage handling aren&apos;t formally published yet — if anything
        arrives damaged or wrong, please{' '}
        <Link href="/contact" className="text-comb-gold underline underline-offset-2">
          get in touch
        </Link>{' '}
        and we&apos;ll sort it.
      </p>
    </div>
  )
}
