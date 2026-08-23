import type { Metadata } from 'next'
import Link from 'next/link'
import { DraftNotice } from '@/components/legal/draft-notice'

export const metadata: Metadata = {
  title: 'Refund Policy',
  description: 'Refund and cancellation policy for Gert Lush Honey orders.',
  alternates: { canonical: '/legal/refund-policy' },
}

export default function RefundPolicyPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <p className="text-honey-amber text-sm font-semibold tracking-wide uppercase">
        Refund Policy
      </p>
      <h1 className="text-porcelain mt-3 text-4xl font-bold tracking-tight text-balance">
        Cancellations, returns and refunds.
      </h1>

      <div className="mt-8">
        <DraftNotice />
      </div>

      <div className="text-porcelain/80 space-y-6 text-base">
        <section>
          <h2 className="text-porcelain text-lg font-semibold">Who we are</h2>
          <p className="mt-2">
            Gert Lush Honey, 14 Beckington Road, Bristol, BS3 5EB. This policy covers orders placed
            directly with us through this website.
          </p>
        </section>

        <section>
          <h2 className="text-porcelain text-lg font-semibold">Your right to cancel</h2>
          <p className="mt-2">
            As a UK consumer buying at a distance, you generally have the right to cancel your
            order within 14 days of receiving it, without giving a reason, under the Consumer
            Contracts Regulations 2013. The Regulations also carry exemptions for certain goods
            (for example items that deteriorate quickly, or are sealed for hygiene reasons and
            unsealed after delivery) — exactly which of those, if any, apply to a food product like
            honey hasn&apos;t been confirmed by a qualified adviser yet, so please don&apos;t rely on
            this section alone. If in doubt, get in touch and we&apos;ll sort it fairly.
          </p>
          <p className="mt-2">
            Where the right to cancel does apply, you have a further 14 days from telling us you
            want to cancel to send the goods back. We&apos;ll refund the product price and standard
            delivery cost (not any faster/premium delivery you chose over our standard option) once
            we&apos;ve received the item back, or evidence you&apos;ve sent it. Unless an item
            arrived damaged or faulty, the cost of returning it is your own responsibility.
          </p>
        </section>

        <section>
          <h2 className="text-porcelain text-lg font-semibold">Damaged, faulty or incorrect orders</h2>
          <p className="mt-2">
            If your order arrives damaged, faulty, or isn&apos;t what you ordered, we&apos;ll offer
            you a replacement or a full refund, including any delivery charge — this is separate
            from, and in addition to, your 14-day cancellation right above. See our{' '}
            <Link href="/delivery" className="text-comb-gold underline underline-offset-2">
              Delivery page
            </Link>{' '}
            for what to include when reporting a damaged or missing parcel.
          </p>
          <p className="mt-2">
            Please don&apos;t consume any product where the jar, lid or seal has been damaged
            during delivery — tell us instead so we can sort a replacement or refund.
          </p>
        </section>

        <section>
          <h2 className="text-porcelain text-lg font-semibold">Subscriptions</h2>
          <p className="mt-2">
            Monthly honey subscriptions have no minimum term — cancel any time, provided you give us
            at least 7 days&apos; notice before your next monthly charge (billed on the same date
            each month as you signed up). Manage or cancel your subscription yourself using the
            account link in your order confirmation email, or email us and we&apos;ll sort it. See
            our{' '}
            <Link href="/legal/terms" className="text-comb-gold underline underline-offset-2">
              Terms and Conditions
            </Link>{' '}
            for the full detail.
          </p>
        </section>

        <section>
          <h2 className="text-porcelain text-lg font-semibold">How to request a refund or cancellation</h2>
          <p className="mt-2">
            Email{' '}
            <a
              href="mailto:complaints@gertlushhoney.co.uk"
              className="text-comb-gold underline underline-offset-2"
            >
              complaints@gertlushhoney.co.uk
            </a>{' '}
            with your order number and what&apos;s happened, and we&apos;ll take it from there.
          </p>
        </section>

        <section>
          <h2 className="text-porcelain text-lg font-semibold">How refunds are paid</h2>
          <p className="mt-2">
            Card payments are processed securely by Shopify, and any refund is returned to your
            original payment method the same way — we don&apos;t handle or store your card details
            ourselves. Your bank or card provider may take a few days to show the refund once
            it&apos;s issued.
          </p>
        </section>

        <section>
          <h2 className="text-porcelain text-lg font-semibold">Governing law</h2>
          <p className="mt-2">These terms are governed by the law of England and Wales.</p>
        </section>

        <p className="text-porcelain/40 text-sm">Last updated: August 2026</p>
      </div>
    </div>
  )
}
