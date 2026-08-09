import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'FAQs',
  description:
    'Answers to common questions about Gert Lush Honey — sourcing, ordering, delivery, storage and more.',
}

type Faq = { q: string; a: ReactNode }
type FaqSection = { title: string; items: Faq[] }

const sections: FaqSection[] = [
  {
    title: 'Bee S3 & where it comes from',
    items: [
      {
        q: 'What is Bee S3?',
        a: (
          <>
            Bee S3 is Gert Lush Honey&apos;s first postcode honey — pure honey from hives on
            Bristol&apos;s Northern Slopes, in the BS3 postcode. It comes in a 12oz / 280ml jar.
            See the{' '}
            <Link href="/shop/bee-s3" className="text-comb-gold underline underline-offset-2">
              product page
            </Link>{' '}
            for full details.
          </>
        ),
      },
      {
        q: 'Is Gert Lush Honey a beekeeper, or do you buy the honey in?',
        a: (
          <>
            Both, in a sense. We don&apos;t keep hives ourselves for every jar — we buy suitable
            bulk honey from independent beekeepers we trust, check and quality-control it, then
            jar, label and sell it under one Gert Lush standard. The beekeeper behind each batch
            stays visibly credited on the jar; nothing is sold anonymously. See{' '}
            <Link href="/beekeepers" className="text-comb-gold underline underline-offset-2">
              Our Beekeepers
            </Link>
            .
          </>
        ),
      },
      {
        q: 'Who is the beekeeper behind Bee S3?',
        a: (
          <>
            Adam, who&apos;s kept bees since 2015 and has been based at Bramble Farm on the
            Northern Slopes since 2019. His full story is on{' '}
            <Link href="/beekeepers" className="text-comb-gold underline underline-offset-2">
              Our Beekeepers
            </Link>
            .
          </>
        ),
      },
      {
        q: 'Will there be more postcode honeys?',
        a: (
          <>
            That&apos;s the plan — Bee S3 is the first, not the last. As more independent
            beekeepers join, their postcodes will appear on the{' '}
            <Link href="/postcode-honey" className="text-comb-gold underline underline-offset-2">
              postcode map
            </Link>
            . Only Bristol (BS3) has real stock right now; every other postcode shows an honest
            waiting-list option.
          </>
        ),
      },
    ],
  },
  {
    title: 'Ordering, pricing & delivery',
    items: [
      {
        q: 'How much is a jar, and can I subscribe?',
        a: 'Bee S3 is £8.00 for a one-off jar, or £7.00 a jar on a monthly subscription with a 6-month minimum term — plus £4.99 delivery either way.',
      },
      {
        q: 'How is it delivered, and how much does delivery cost?',
        a: (
          <>
            Royal Mail Tracked 48 — tracked, typically 2–3 working days — at a flat £4.99 per
            order, however many jars you buy. UK delivery only, for now. Full details on the{' '}
            <Link href="/delivery" className="text-comb-gold underline underline-offset-2">
              Delivery page
            </Link>
            .
          </>
        ),
      },
      {
        q: 'How do I actually place an order right now?',
        a: (
          <>
            One-off Bee S3 orders go through a real, secure Shopify checkout — hit &quot;Buy
            now&quot; on the{' '}
            <Link href="/shop/bee-s3" className="text-comb-gold underline underline-offset-2">
              product page
            </Link>
            . Subscriptions are still set up by hand for now: choose &quot;Subscribe monthly&quot;
            and it&apos;ll open an email to us to confirm the details before anything&apos;s
            charged.
          </>
        ),
      },
      {
        q: 'Can I buy Gert Lush Honey in a shop, or as a business?',
        a: (
          <>
            Not yet — we&apos;re direct-to-customer only for now. If you run a shop, deli or café
            and would like to stock it once trade accounts open, or want to place a corporate/gift
            order, see{' '}
            <Link href="/stockists" className="text-comb-gold underline underline-offset-2">
              Stockists
            </Link>{' '}
            or{' '}
            <Link href="/gifts" className="text-comb-gold underline underline-offset-2">
              Gifts
            </Link>
            .
          </>
        ),
      },
    ],
  },
  {
    title: 'Storage, crystallisation & safety',
    items: [
      {
        q: 'Why has my honey gone solid or cloudy?',
        a: 'Honey crystallises naturally over time — it depends on the honey and how it\'s stored, and it\'s not a fault or a sign anything\'s wrong.',
      },
      {
        q: 'How do I turn it back to liquid?',
        a: 'Stand the jar (lid on) in a bowl of warm water for a few minutes and it\'ll return to liquid.',
      },
      {
        q: 'How should I store my jar?',
        a: 'Somewhere cool and dry, away from direct sunlight.',
      },
      {
        q: 'Is honey safe for babies and young children?',
        a: 'No — like all honey, Bee S3 isn\'t suitable for children under 12 months old.',
      },
    ],
  },
  {
    title: 'Selling to us, and what else we sell',
    items: [
      {
        q: "I'm a beekeeper — can I sell my honey to Gert Lush?",
        a: (
          <>
            We&apos;d like to hear from you, wherever you&apos;re based in Britain. You keep
            managing your bees and harvesting; we handle intake, quality checks, jarring, branding
            and sale, and you stay credited as the beekeeper behind the batch. Details and how to
            apply are on{' '}
            <Link
              href="/become-a-supplier"
              className="text-comb-gold underline underline-offset-2"
            >
              Become a Supplier
            </Link>
            .
          </>
        ),
      },
      {
        q: 'Do you sell candles, soap or other beeswax products?',
        a: (
          <>
            They&apos;re on the list, but not real products yet — we&apos;d rather say that
            honestly than list something before it exists. See what&apos;s{' '}
            <Link href="/shop" className="text-comb-gold underline underline-offset-2">
              coming soon
            </Link>
            , and register your interest if you&apos;d like to know when they launch.
          </>
        ),
      },
      {
        q: "What's the Asian hornet page about?",
        a: (
          <>
            The yellow-legged (Asian) hornet is the biggest current threat to honeybee colonies in
            Britain, so we built a page on how to identify one and report a sighting — it matters
            to every beekeeper, not just ours. See{' '}
            <Link href="/asian-hornets" className="text-comb-gold underline underline-offset-2">
              Asian Hornets
            </Link>
            .
          </>
        ),
      },
    ],
  },
]

export default function FaqsPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <p className="text-honey-amber text-sm font-semibold tracking-wide uppercase">FAQs</p>
      <h1 className="text-porcelain mt-3 text-4xl font-bold tracking-tight text-balance">
        Questions, answered honestly.
      </h1>
      <p className="text-porcelain/70 mt-4 text-base">
        If something&apos;s not covered here, just{' '}
        <Link href="/contact" className="text-comb-gold underline underline-offset-2">
          get in touch
        </Link>
        .
      </p>

      <div className="mt-10 space-y-10">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-porcelain text-xl font-bold tracking-tight">{section.title}</h2>
            <div className="border-ink-line divide-ink-line mt-4 divide-y rounded-2xl border">
              {section.items.map((item) => (
                <details key={item.q} className="group p-5">
                  <summary className="text-porcelain marker:content-none flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold">
                    {item.q}
                    <span
                      aria-hidden="true"
                      className="text-porcelain/50 shrink-0 transition-transform group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <div className="text-porcelain/70 mt-3 text-sm">{item.a}</div>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
