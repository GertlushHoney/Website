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
              href="mailto:hello@gertlushhoney.co.uk"
              className="text-comb-gold underline underline-offset-2"
            >
              hello@gertlushhoney.co.uk
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-porcelain text-lg font-semibold">How ordering works right now</h2>
          <p className="mt-2">
            One-off jars go through a real basket and checkout, handled securely by Shopify — add
            to basket, then pay by card on Shopify&apos;s own checkout page. We never see or store
            your card details ourselves. The same applies to monthly subscriptions where a live
            subscription plan exists for that product. If a product&apos;s basket or subscription
            isn&apos;t set up yet, ordering it instead opens an email to us with your order details —
            that order isn&apos;t confirmed until we reply confirming price, availability and
            delivery.
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
            Monthly subscriptions have no minimum term — you can cancel any time, provided you tell
            us at least 7 days before your next charge. Each subscription bills on the same date
            each month as you signed up, not a shared fixed date, so joining partway through a month
            doesn&apos;t mean an almost-immediate second charge. Subscriptions are billed
            automatically by Shopify, and you can manage or cancel yours yourself from the account
            link in your order confirmation email, or by emailing us.
          </p>
        </section>

        <section>
          <h2 className="text-porcelain text-lg font-semibold">Your right to cancel</h2>
          <p className="mt-2">
            As a consumer buying at a distance, you generally have rights to cancel and return an
            order under the Consumer Contracts Regulations — see our{' '}
            <a href="/legal/refund-policy" className="text-comb-gold underline underline-offset-2">
              Refund Policy
            </a>{' '}
            for the detail, including how this applies to a food product like honey.
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
