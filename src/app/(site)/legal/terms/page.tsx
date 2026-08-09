import type { Metadata } from 'next'
import { DraftNotice } from '@/components/legal/draft-notice'

export const metadata: Metadata = {
  title: 'Terms and Conditions',
  description: 'Terms and conditions for buying from Gert Lush Honey.',
}

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <p className="text-honey-amber text-sm font-semibold tracking-wide uppercase">
        Terms and Conditions
      </p>
      <h1 className="text-porcelain mt-3 text-4xl font-bold tracking-tight text-balance">
        The small print.
      </h1>

      <div className="mt-8">
        <DraftNotice />
      </div>

      <div className="text-porcelain/80 space-y-6 text-base">
        <section>
          <h2 className="text-porcelain text-lg font-semibold">Who we are</h2>
          <p className="mt-2">
            Gert Lush Honey, 14 Beckington Road, Bristol, BS3 5EB (&quot;we&quot;, &quot;us&quot;).
            Contact:{' '}
            <a
              href="mailto:gertlushhoney@outlook.com"
              className="text-comb-gold underline underline-offset-2"
            >
              gertlushhoney@outlook.com
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-porcelain text-lg font-semibold">How ordering works right now</h2>
          <p className="mt-2">
            Online checkout isn&apos;t live yet. Choosing a purchase option on a product page opens
            an email to us with your order details — an order isn&apos;t confirmed until we reply
            confirming price, availability and delivery.
          </p>
        </section>

        <section>
          <h2 className="text-porcelain text-lg font-semibold">Pricing</h2>
          <p className="mt-2">
            Prices are shown in GBP and include VAT where applicable. Delivery is charged separately
            — see our{' '}
            <a href="/delivery" className="text-comb-gold underline underline-offset-2">
              Delivery page
            </a>
            . Prices may change, but you&apos;ll always be told the price before an order is
            confirmed.
          </p>
        </section>

        <section>
          <h2 className="text-porcelain text-lg font-semibold">Subscriptions</h2>
          <p className="mt-2">
            Monthly subscriptions run for a minimum term of 6 months from your first jar, and are
            arranged and invoiced by emailing us directly for now — there&apos;s no automated
            billing yet. After the minimum term, you can cancel any time by telling us.
          </p>
        </section>

        <section>
          <h2 className="text-porcelain text-lg font-semibold">Your right to cancel</h2>
          <p className="mt-2">
            As a consumer buying at a distance, you generally have rights to cancel and return an
            order under the Consumer Contracts Regulations. Exactly how this applies to a perishable
            food product like honey needs confirming properly — get in touch if you&apos;re unhappy
            with an order and we&apos;ll sort it fairly in the meantime.
          </p>
        </section>

        <section>
          <h2 className="text-porcelain text-lg font-semibold">Food information</h2>
          <p className="mt-2">
            Product-specific information (ingredients, allergens, storage, origin) is on each
            product page. Honey is not suitable for children under 12 months.
          </p>
        </section>

        <section>
          <h2 className="text-porcelain text-lg font-semibold">Governing law</h2>
          <p className="mt-2">These terms are governed by the law of England and Wales.</p>
        </section>
      </div>
    </div>
  )
}
