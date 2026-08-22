import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Stockists',
  description: 'Find Gert Lush Honey in shops, or apply to become a stockist.',
}

export default function StockistsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-honey-amber text-sm font-semibold tracking-wide uppercase">Stockists</p>
      <h1 className="text-porcelain mt-3 text-4xl font-bold tracking-tight text-balance">
        Find Gert Lush Honey.
      </h1>
      <p className="text-porcelain/70 mt-4 text-base">
        We&apos;re not in any shops yet — Gert Lush Honey is still direct-to-customer only. If that
        changes, real stockists will be listed here.
      </p>

      <div className="border-ink-line bg-honeycomb-surface mt-10 rounded-2xl border p-8">
        <p className="text-comb-gold text-sm font-semibold tracking-wide uppercase">
          Become a stockist
        </p>
        <h2 className="text-porcelain mt-2 text-2xl font-bold tracking-tight">
          Independent shop, deli or café?
        </h2>
        <p className="text-porcelain/70 mt-4 text-sm">
          We&apos;re not actively supplying trade accounts yet, but we&apos;d like to hear from
          shops interested in stocking a distinctive Bristol product once we are. Tell us a bit
          about your business and we&apos;ll get in touch when it&apos;s possible.
        </p>
        <a
          href="mailto:sales@gertlushhoney.co.uk?subject=Become%20a%20stockist&body=Business%20name%3A%0ALocation%3A%0ABusiness%20type%3A%0AExpected%20quantities%3A"
          className="bg-honey-amber text-ink focus-visible:outline-porcelain mt-6 inline-block rounded-full px-6 py-2.5 text-sm font-semibold focus-visible:outline focus-visible:outline-offset-4"
        >
          Apply to become a stockist
        </a>
      </div>

      <div className="border-ink-line bg-honeycomb-surface mt-8 rounded-2xl border p-8">
        <p className="text-comb-gold text-sm font-semibold tracking-wide uppercase">
          Corporate &amp; event gifting
        </p>
        <h2 className="text-porcelain mt-2 text-2xl font-bold tracking-tight">
          Planning something bigger?
        </h2>
        <p className="text-porcelain/70 mt-4 text-sm">
          Volume orders for corporate gifts, weddings or events aren&apos;t formally set up yet,
          but get in touch and we&apos;ll work out what&apos;s possible.
        </p>
        <a
          href="mailto:sales@gertlushhoney.co.uk?subject=Corporate%20or%20event%20gifting%20enquiry"
          className="bg-honey-amber text-ink focus-visible:outline-porcelain mt-6 inline-block rounded-full px-6 py-2.5 text-sm font-semibold focus-visible:outline focus-visible:outline-offset-4"
        >
          Request a gifting proposal
        </a>
      </div>
    </div>
  )
}
