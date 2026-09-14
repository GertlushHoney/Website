import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { BackToCategoryLink } from '@/components/shop/back-to-category-link'
import { JsonLd } from '@/components/seo/json-ld'
import { FREE_DELIVERY_THRESHOLD_GBP } from '@/lib/delivery'
import { isGertLushStandardLive } from '@/lib/gert-lush-standard'

export const metadata: Metadata = {
  title: 'FAQs',
  description:
    'Answers to common questions about Gert Lush Honey — sourcing, ordering, delivery, storage and more.',
  alternates: { canonical: '/faqs' },
}

// `plainAnswer` is a plain-text copy of `a`, kept in sync by hand — schema.org
// FAQPage JSON-LD requires plain text, and `a` is JSX (it carries real
// in-page links). Content, not just phrasing, must match: this is what
// search engines index as this page's actual answer.
type Faq = { q: string; a: ReactNode; plainAnswer: string }
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
        plainAnswer:
          "Bee S3 is Gert Lush Honey's first postcode honey — pure honey from hives on Bristol's Northern Slopes, in the BS3 postcode. It comes in a 12oz / 280ml jar.",
      },
      {
        q: 'Is Gert Lush Honey a beekeeper, or do you buy the honey in?',
        a: (
          <>
            Both, in a sense. Gert Lush began with our own bees at Bramble Farm, and today
            we&apos;re building a network of independent British beekeepers whose honey we select,
            check, jar and sell — keeping each beekeeper and place at the heart of the story. The
            beekeeper behind each batch stays visibly credited on the jar; nothing is sold
            anonymously. See{' '}
            <Link href="/beekeepers" className="text-comb-gold underline underline-offset-2">
              Our Beekeepers
            </Link>
            .
          </>
        ),
        plainAnswer:
          "Both, in a sense. Gert Lush began with our own bees at Bramble Farm, and today we're building a network of independent British beekeepers whose honey we select, check, jar and sell — keeping each beekeeper and place at the heart of the story. The beekeeper behind each batch stays visibly credited on the jar; nothing is sold anonymously.",
      },
      {
        q: 'What is the Gert Lush Standard?',
        a: (
          <>
            {isGertLushStandardLive
              ? 'It means the beekeeper has passed our supplier review and the honey has passed our batch acceptance checks.'
              : "It's our own supplier and batch-approval standard — still being finalised, so no product carries the mark yet."}{' '}
            See{' '}
            <Link
              href="/gert-lush-standard"
              className="text-comb-gold underline underline-offset-2"
            >
              The Gert Lush Standard
            </Link>{' '}
            for the full detail.
          </>
        ),
        plainAnswer: isGertLushStandardLive
          ? 'It means the beekeeper has passed our supplier review and the honey has passed our batch acceptance checks.'
          : "It's our own supplier and batch-approval standard — still being finalised, so no product carries the mark yet.",
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
        plainAnswer:
          "Adam, who's kept bees since 2015 and has been based at Bramble Farm on the Northern Slopes since 2019.",
      },
      {
        q: 'Will there be more postcode honeys?',
        a: (
          <>
            It started with Bee S3 in Bristol. We&apos;re now adding exceptional local honey
            postcode by postcode — Bee S4 followed, and more are on the way. Available postcode
            honeys are shown on our live{' '}
            <Link href="/postcode-honey" className="text-comb-gold underline underline-offset-2">
              postcode map
            </Link>
            . New areas are added as suitable beekeepers and batches are approved; any postcode
            without stock yet shows an honest waiting-list option instead.
          </>
        ),
        plainAnswer:
          "It started with Bee S3 in Bristol. We're now adding exceptional local honey postcode by postcode — Bee S4 followed, and more are on the way. Available postcode honeys are shown on our live postcode map. New areas are added as suitable beekeepers and batches are approved; any postcode without stock yet shows an honest waiting-list option instead.",
      },
    ],
  },
  {
    title: 'Ordering, pricing & delivery',
    items: [
      {
        q: 'How much is a jar, and can I subscribe?',
        a: (
          <>
            Prices vary by harvest and product — current prices are shown on each{' '}
            <Link href="/shop/honey" className="text-comb-gold underline underline-offset-2">
              honey page
            </Link>
            . Where a monthly subscription is available for a honey, it&apos;s offered right there
            on that product&apos;s page, usually at a small discount versus a one-off jar.
            Subscriptions have no minimum term; cancel any time with at least 7 days&apos; notice
            before your next charge.
          </>
        ),
        plainAnswer:
          "Prices vary by harvest and product — current prices are shown on each honey page. Where a monthly subscription is available for a honey, it's offered right there on that product's page, usually at a small discount versus a one-off jar. Subscriptions have no minimum term; cancel any time with at least 7 days' notice before your next charge.",
      },
      {
        q: 'How is it delivered, and how much does delivery cost?',
        a: (
          <>
            Royal Mail Tracked 48 — tracked, typically 2–3 working days. Delivery is calculated at
            checkout based on your actual parcel weight, and it&apos;s free on orders over £
            {FREE_DELIVERY_THRESHOLD_GBP}. UK delivery only, for now. Full details on the{' '}
            <Link href="/delivery" className="text-comb-gold underline underline-offset-2">
              Delivery page
            </Link>
            .
          </>
        ),
        plainAnswer: `Royal Mail Tracked 48 — tracked, typically 2–3 working days. Delivery is calculated at checkout based on your actual parcel weight, and it's free on orders over £${FREE_DELIVERY_THRESHOLD_GBP}. UK delivery only, for now.`,
      },
      {
        q: 'How do I actually place an order right now?',
        a: (
          <>
            Every order — one-off or subscription — goes through a real, secure Shopify checkout.
            Choose &quot;One-time purchase&quot; or &quot;Subscribe monthly&quot; on a product
            page, like{' '}
            <Link href="/shop/bee-s3" className="text-comb-gold underline underline-offset-2">
              Bee S3
            </Link>
            , and add it straight to your basket — subscriptions use a real recurring Shopify
            plan wherever one&apos;s set up for that product.
          </>
        ),
        plainAnswer:
          'Every order — one-off or subscription — goes through a real, secure Shopify checkout. Choose "One-time purchase" or "Subscribe monthly" on a product page, like Bee S3, and add it straight to your basket — subscriptions use a real recurring Shopify plan wherever one\'s set up for that product.',
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
            </Link>
            .
          </>
        ),
        plainAnswer:
          "Not yet — we're direct-to-customer only for now. If you run a shop, deli or café and would like to stock it once trade accounts open, or want to place a corporate/gift order, see Stockists.",
      },
    ],
  },
  {
    title: 'Storage, crystallisation & safety',
    items: [
      {
        q: 'Why has my honey gone solid or cloudy?',
        a: 'Honey crystallises naturally over time — it depends on the honey and how it\'s stored, and it\'s not a fault or a sign anything\'s wrong.',
        plainAnswer:
          "Honey crystallises naturally over time — it depends on the honey and how it's stored, and it's not a fault or a sign anything's wrong.",
      },
      {
        q: 'How do I turn it back to liquid?',
        a: 'Stand the jar (lid on) in a bowl of warm water for a few minutes and it\'ll return to liquid.',
        plainAnswer:
          "Stand the jar (lid on) in a bowl of warm water for a few minutes and it'll return to liquid.",
      },
      {
        q: 'How should I store my jar?',
        a: 'Somewhere cool and dry, away from direct sunlight.',
        plainAnswer: 'Somewhere cool and dry, away from direct sunlight.',
      },
      {
        q: 'Is honey safe for babies and young children?',
        a: 'No — like all honey, Bee S3 isn\'t suitable for children under 12 months old.',
        plainAnswer: "No — like all honey, Bee S3 isn't suitable for children under 12 months old.",
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
        plainAnswer:
          "We'd like to hear from you, wherever you're based in Britain. You keep managing your bees and harvesting; we handle intake, quality checks, jarring, branding and sale, and you stay credited as the beekeeper behind the batch. Details and how to apply are on Become a Supplier.",
      },
      {
        q: 'Do you sell candles, soap or other beeswax products?',
        a: (
          <>
            Yes — alongside the honey, we now sell real{' '}
            <Link href="/shop/candles" className="text-comb-gold underline underline-offset-2">
              candles
            </Link>
            ,{' '}
            <Link href="/shop/soap" className="text-comb-gold underline underline-offset-2">
              soap
            </Link>{' '}
            and{' '}
            <Link href="/shop/lip-balm" className="text-comb-gold underline underline-offset-2">
              lip balm
            </Link>
            . See the full range in the{' '}
            <Link href="/shop" className="text-comb-gold underline underline-offset-2">
              shop
            </Link>
            .
          </>
        ),
        plainAnswer:
          'Yes — alongside the honey, we now sell real candles, soap and lip balm. See the full range in the shop.',
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
        plainAnswer:
          'The yellow-legged (Asian) hornet is the biggest current threat to honeybee colonies in Britain, so we built a page on how to identify one and report a sighting — it matters to every beekeeper, not just ours.',
      },
    ],
  },
]

const faqPageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: sections.flatMap((section) =>
    section.items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.plainAnswer },
    }))
  ),
}

export default function FaqsPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <JsonLd data={faqPageJsonLd} />
      <BackToCategoryLink href="/information" label="Information" />

      <p className="text-honey-amber mt-6 text-sm font-semibold tracking-wide uppercase">FAQs</p>
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
