import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Weddings and Events',
  description:
    'Wedding and event favours from Gert Lush Honey — mini honey jars and beeswax soap, in a size that works as a favour.',
  alternates: { canonical: '/weddings-events' },
}

// Light-touch enquiry page, not a checkout flow — quantities, personalised
// labels and exact dispatch timing all need a conversation first, and we're
// not quoting a price for the honey jars until jar supply is confirmed.
// See src/app/(site)/shop/soap/page.tsx for why the soap range itself still
// says "not for sale yet" — the pricing/scents below are real and
// confirmed, but the products aren't in stock or photographed yet.
export default function WeddingsAndEventsPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <p className="text-honey-amber text-sm font-semibold tracking-wide uppercase">
        For weddings and events
      </p>
      <h1 className="text-porcelain mt-3 text-4xl font-bold tracking-tight text-balance">
        Wedding favours, done properly.
      </h1>
      <p className="text-porcelain/70 mt-4 text-base">
        Real honey and real soap, in a size that works as a favour — not mass-produced tat. We&apos;re
        still setting this up properly, so nothing below is available for instant checkout yet, but
        tell us what you need and we&apos;ll work out what&apos;s possible for your date.
      </p>

      <div className="relative mx-auto mt-10 aspect-[1122/1402] w-full max-w-sm overflow-hidden rounded-2xl">
        <Image
          src="/images/source/wedding-favour-hero.png"
          alt="A mini hexagonal honey jar favoured 'Love is Sweet, Wedding Favour, Thank You', tied with ribbon among wedding flowers and candlelight"
          fill
          sizes="(min-width: 640px) 384px, 100vw"
          className="object-cover"
        />
      </div>

      <section className="mt-10">
        <h2 className="text-porcelain text-xl font-bold tracking-tight">Mini honey jars</h2>
        <p className="text-porcelain/70 mt-3 text-sm">
          Small hexagonal honey jars — 110ml or 55ml — filled with the same honey we sell full-size,
          in a favour-friendly format. We haven&apos;t confirmed jar supply or pricing yet, so we
          can&apos;t quote a price here, but let us know your guest count and preferred size and
          we&apos;ll come back with real numbers.
        </p>
        <div className="relative mt-5 aspect-[1448/1086] w-full overflow-hidden rounded-2xl">
          <Image
            src="/images/source/wedding-favour-comparison.png"
            alt="Size comparison: a 55ml wedding favour jar next to a standard 280ml Bee S3 jar"
            fill
            sizes="(min-width: 640px) 672px, 100vw"
            className="object-cover"
          />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-porcelain text-xl font-bold tracking-tight">Soap favours</h2>
        <p className="text-porcelain/70 mt-3 text-sm">
          A half-bar (minimum 30g) version of our honey and beeswax soap, in four scents:
          Lavender &amp; Rosemary, Lemongrass, Honey &amp; Oats (Unscented) and Orange &amp; Black
          Pepper. Indicative price is £3.50 each — the same soap will also be sold as a full-size
          bar in{' '}
          <Link href="/shop/soap" className="text-comb-gold underline underline-offset-2">
            our regular soap range
          </Link>{' '}
          once it&apos;s ready, but final packaging and label design aren&apos;t finished, so
          nothing&apos;s in stock yet.
        </p>
      </section>

      <div className="border-ink-line bg-honeycomb-surface mt-10 rounded-2xl border p-8">
        <p className="text-comb-gold text-sm font-semibold tracking-wide uppercase">
          Tell us about your event
        </p>
        <p className="text-porcelain/70 mt-3 text-sm">
          It helps to know your event date, rough quantity needed, which jar size or soap scents
          you&apos;re interested in, and any personalisation ideas.
        </p>
        <a
          href="mailto:sales@gertlushhoney.co.uk?subject=Wedding%20%26%20Events%20enquiry&body=Event%20date%3A%0AEstimated%20quantity%2Fguest%20count%3A%0AHoney%20jar%20size%20(110ml%2F55ml)%3A%0ASoap%20scents%20of%20interest%3A%0APersonalisation%20ideas%3A"
          className="bg-honey-amber text-ink focus-visible:outline-porcelain mt-6 inline-block rounded-full px-6 py-2.5 text-sm font-semibold focus-visible:outline focus-visible:outline-offset-4"
        >
          Enquire about wedding favours
        </a>
      </div>
    </div>
  )
}
