import type { Metadata } from 'next'
import Link from 'next/link'
import { DraftNotice } from '@/components/legal/draft-notice'

export const metadata: Metadata = {
  title: 'Shipping and Delivery Policy',
  description: 'Shipping and delivery policy for Gert Lush Honey orders — UK delivery, tracking, damaged or missing parcels, and delivery charges.',
}

export default function DeliveryPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <p className="text-honey-amber text-sm font-semibold tracking-wide uppercase">Delivery</p>
      <h1 className="text-porcelain mt-3 text-4xl font-bold tracking-tight text-balance">
        Shipping and delivery policy.
      </h1>

      <div className="mt-8">
        <DraftNotice />
      </div>

      <p className="text-porcelain/70 text-base">
        At Gert Lush Honey, we take great care when packing your order. Our honey is packed in
        glass jars, so every parcel is carefully prepared to help make sure it reaches you safely
        and in the same gert lush condition it left us.
      </p>

      <div className="text-porcelain/80 mt-8 space-y-6 text-base">
        <section>
          <h2 className="text-porcelain text-lg font-semibold">UK delivery</h2>
          <p className="mt-2">
            We currently deliver to addresses within the United Kingdom using Royal Mail Tracked
            48. All orders are normally dispatched within 3–5 working days of your order being
            placed. Working days are Monday to Friday, excluding Bank Holidays.
          </p>
          <p className="mt-2">
            Once your order has been dispatched, you&apos;ll receive tracking information so you
            can follow your parcel on its journey. Please remember that the dispatch time is the
            time it takes us to prepare and pack your order, and is separate from the time Royal
            Mail takes to deliver it.
          </p>
        </section>

        <section>
          <h2 className="text-porcelain text-lg font-semibold">Delivery charges</h2>
          <p className="mt-2">
            Delivery charges are clearly displayed during checkout before you complete your order.
            Where we offer free delivery, promotional delivery rates or other postage offers,
            these will be clearly shown on our website or at checkout.
          </p>
        </section>

        <section>
          <h2 className="text-porcelain text-lg font-semibold">Tracking your order</h2>
          <p className="mt-2">
            All of our parcels are sent using Royal Mail Tracked 48. Once your order has been
            dispatched, tracking details will be sent to the email address provided when you
            placed your order. Please make sure your email address and delivery address are
            correct before completing your purchase.
          </p>
        </section>

        <section>
          <h2 className="text-porcelain text-lg font-semibold">Delayed deliveries</h2>
          <p className="mt-2">
            Although we do everything we can to dispatch orders within our stated timescale,
            occasionally deliveries may be delayed once they&apos;ve been handed over to Royal
            Mail. Unfortunately, delays caused by Royal Mail, severe weather, Bank Holidays,
            industrial action or other circumstances outside our control can happen. If your
            parcel appears to be significantly delayed, please{' '}
            <Link href="/contact" className="text-comb-gold underline underline-offset-2">
              contact us
            </Link>{' '}
            and we&apos;ll do our best to help track it down.
          </p>
        </section>

        <section>
          <h2 className="text-porcelain text-lg font-semibold">Damaged orders</h2>
          <p className="mt-2">
            Honey and glass don&apos;t always make the easiest travelling companions, which is why
            we take particular care when packing our jars. If your order arrives damaged, please
            contact us as soon as possible after delivery. Where possible, please include:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Your order number</li>
            <li>A photograph of the damaged item</li>
            <li>A photograph of the packaging it arrived in</li>
          </ul>
          <p className="mt-2">
            This helps us investigate what happened and improve our packaging where necessary. If
            an item has been damaged in transit, we&apos;ll offer you a replacement or a refund.
            Please don&apos;t consume any product where the jar, lid or seal has been damaged
            during delivery.
          </p>
        </section>

        <section>
          <h2 className="text-porcelain text-lg font-semibold">Missing parcels</h2>
          <p className="mt-2">
            If your tracking information shows that your parcel has been delivered but you
            can&apos;t find it, please first check:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Around your property or nominated safe place</li>
            <li>With other members of your household</li>
            <li>With immediate neighbours</li>
            <li>Any delivery information provided by Royal Mail</li>
          </ul>
          <p className="mt-2">
            If you still can&apos;t locate your parcel, please contact us and we&apos;ll help
            investigate the delivery.
          </p>
        </section>

        <section>
          <h2 className="text-porcelain text-lg font-semibold">Incorrect delivery addresses</h2>
          <p className="mt-2">
            Please check your delivery details carefully when placing your order. Gert Lush Honey
            can&apos;t accept responsibility for orders delayed, returned or delivered incorrectly
            because an incorrect or incomplete address was provided when the order was placed. If
            you notice an error in your delivery address, please contact us as soon as possible —
            if your order hasn&apos;t yet been dispatched, we&apos;ll do our best to amend it.
          </p>
        </section>

        <section>
          <h2 className="text-porcelain text-lg font-semibold">Busy periods</h2>
          <p className="mt-2">
            During particularly busy periods, including Christmas, Bank Holidays and promotional
            events, preparing and delivering orders may take a little longer than usual. If we
            know that dispatch times are significantly longer than our normal 3–5 working days,
            we&apos;ll try to make this clear on our website.
          </p>
        </section>

        <section>
          <h2 className="text-porcelain text-lg font-semibold">Questions about your delivery?</h2>
          <p className="mt-2">
            If you have any questions about an order or delivery, please{' '}
            <Link href="/contact" className="text-comb-gold underline underline-offset-2">
              get in touch
            </Link>{' '}
            and we&apos;ll be happy to help. Email:{' '}
            <a
              href="mailto:complaints@gertlushhoney.co.uk"
              className="text-comb-gold underline underline-offset-2"
            >
              complaints@gertlushhoney.co.uk
            </a>
            . Please include your order number when contacting us about an existing order.
          </p>
        </section>

        <p className="text-porcelain/40 text-sm">Last updated: August 2026</p>
      </div>
    </div>
  )
}
