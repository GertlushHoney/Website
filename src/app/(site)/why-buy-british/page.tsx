import type { Metadata } from 'next'
import Link from 'next/link'
import { JsonLd } from '@/components/seo/json-ld'
import { BackToCategoryLink } from '@/components/shop/back-to-category-link'
import { standardCopy } from '@/lib/gert-lush-standard'

export const metadata: Metadata = {
  title: 'Why Buy British Honey?',
  description:
    'Britain eats far more honey than it makes. Why honey made here is scarce, why it is worth choosing, and how to check a jar really is British.',
  alternates: { canonical: '/why-buy-british' },
}

// The Bee Farmers' Association is the trade body for professional beekeepers
// in the UK. This is the page that states the 14% / 60% figures used below —
// the Association gives them without a year or a source, so the copy presents
// them as its estimate, not as a precise count.
const BFA_URL = 'https://beefarmers.co.uk/about-bee-farming/what-is-bee-farming'

const REASONS = [
  {
    title: 'Food made here',
    body: 'A jar of honey from British bees is a small piece of home-grown food, made from British flowers by bees that live here.',
  },
  {
    title: 'The people who keep the bees',
    body: 'Behind every jar are beekeepers who look after their colonies all year, whether or not the summer is kind. Buying British honey helps keep that skill and that work going.',
  },
  {
    title: 'A clearer trail',
    body: 'With honey from a named British beekeeper you can ask who kept the bees and roughly where. That is much harder with a blend of honeys from several countries.',
  },
  {
    title: 'A link to a real place',
    body: 'Bees can only make honey from what flowers nearby. Honey made here ties a jar to a real landscape, and gives people another reason to care about the flowers, hedges and green space around them.',
  },
]

const FAQS = [
  {
    q: 'What is British honey?',
    a: 'British honey is honey made by honey bees in Britain, from the flowers and landscape they find here. It is a seasonal farm crop, so it changes with the weather and the year.',
  },
  {
    q: 'Is UK honey the same as British honey?',
    a: 'In everyday use, yes. Both describe honey made here, as opposed to honey harvested in another country and imported.',
  },
  {
    q: 'Why can British honey cost more?',
    a: 'It is a scarce, seasonal crop, and beekeepers look after their bees all year even when the harvest is small. A low price is not proof that something is wrong and a high price is not proof of quality, but it is worth looking at the label and asking who made it.',
  },
  {
    q: 'How do I know a jar is really British?',
    a: 'Look for the country where the honey was harvested on the label. "Packed in the UK" is not the same as "produced in the UK", and "a blend of honeys from more than one country" tells you very little. A named beekeeper or place is a better sign.',
  },
  {
    q: 'Where can I buy British honey?',
    a: 'From beekeepers, local shops and markets that can tell you who kept the bees. Every Gert Lush jar comes from one named British beekeeper and one real postcode.',
  },
]

const faqPageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
}

export default function WhyBuyBritishPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <JsonLd data={faqPageJsonLd} />
      <BackToCategoryLink href="/information" label="Information" />

      <p className="text-honey-amber mt-6 text-sm font-semibold tracking-wide uppercase">
        British honey
      </p>
      <h1 className="text-porcelain mt-3 text-4xl font-bold tracking-tight text-balance">
        Why buy British?
      </h1>
      <p className="text-porcelain/70 mt-4 text-base hyphens-auto sm:text-justify">
        It is easy to assume the honey on a shop shelf was made somewhere nearby. In practice,
        Britain eats far more honey than it makes. Here is why we think honey made here is worth
        looking for, and how to tell when you have found it.
      </p>

      <div className="text-porcelain/80 mt-12 space-y-14 text-base hyphens-auto sm:text-justify">
        <section>
          <h2 className="text-porcelain text-xl font-bold tracking-tight">
            How much honey does Britain make?
          </h2>
          <p className="mt-3">
            The{' '}
            <a
              href={BFA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-comb-gold underline underline-offset-2"
            >
              Bee Farmers&apos; Association
            </a>
            , the trade body for professional beekeepers, says the UK produces around 14 per cent of
            the honey eaten here, against a European average of around 60 per cent. It gives that as
            its own estimate, without a year, so read it as a rough picture rather than an exact
            count. The rest has to come from abroad.
          </p>
          <p className="mt-3">
            That makes honey made in Britain a fairly scarce food, and it is part of why we think
            it is worth choosing when you can.
          </p>
        </section>

        <section>
          <h2 className="text-porcelain text-xl font-bold tracking-tight">
            Why is it scarce?
          </h2>
          <p className="mt-3">
            Honey is farmed, and it depends on things nobody controls: the weather, what is in
            flower and for how long, and a British summer that is short and unpredictable. A good
            year for one beekeeper can be a poor one for another, and a crop cannot simply be made
            bigger to meet demand.
          </p>
        </section>

        <section>
          <h2 className="text-porcelain text-xl font-bold tracking-tight">
            Why it is worth choosing
          </h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {REASONS.map((reason) => (
              <li
                key={reason.title}
                className="border-ink-line bg-honeycomb-surface rounded-2xl border p-5"
              >
                <p className="text-comb-gold text-sm font-semibold">{reason.title}</p>
                <p className="text-porcelain/70 mt-2 text-sm">{reason.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-porcelain text-xl font-bold tracking-tight">
            Honey that tastes of somewhere
          </h2>
          <p className="mt-3">
            Real honey is a natural crop. Its colour, flavour and texture depend on where the bees
            foraged, what was flowering, the weather and the time of year, so it does not have to
            taste the same from one harvest to the next.
          </p>
          <p className="mt-3">
            We like that. Our own Bee S3, from Bristol&apos;s Northern Slopes, has come out as a rich
            amber-copper one year and pale and light another. You can see each year&apos;s jar on its{' '}
            <Link href="/shop/bee-s3" className="text-comb-gold underline underline-offset-2">
              product page
            </Link>
            . To us the variation is part of the provenance, not a fault to be smoothed away.
          </p>
        </section>

        <section>
          <h2 className="text-porcelain text-xl font-bold tracking-tight">
            How to check a jar is British
          </h2>
          <p className="mt-3">
            Honey sold in the UK has to say which country or countries it was harvested in. Read
            that line, not just the front of the jar. &quot;Packed in the UK&quot; is not the same
            as &quot;produced in the UK&quot;, and a blend from several countries has to say so.
            Our guide{' '}
            <Link href="/fake-honey" className="text-comb-gold underline underline-offset-2">
              Is it really honey?
            </Link>{' '}
            has more on what to look for on a label.
          </p>
        </section>

        <section>
          <h2 className="text-porcelain text-xl font-bold tracking-tight">How we do it</h2>
          <p className="mt-3">
            Gert Lush Honey started with our own bees at Bramble Farm on Bristol&apos;s Northern
            Slopes. Today every jar comes from one named British beekeeper and is tied to one real
            postcode, so you can see where it came from on our{' '}
            <Link href="/postcode-honey" className="text-comb-gold underline underline-offset-2">
              postcode map
            </Link>{' '}
            and meet the people behind it on{' '}
            <Link href="/beekeepers" className="text-comb-gold underline underline-offset-2">
              Our Beekeepers
            </Link>
            .
          </p>
          <p className="mt-3">
            We are a small company building a network of independent British beekeepers, and we
            aim to pay them a fair price for their honey.{' '}
            {standardCopy(
              'We are also introducing the Gert Lush Standard, a way of reviewing every beekeeper and batch before it reaches you.',
              'Every beekeeper and batch is also reviewed against the Gert Lush Standard before it reaches you.'
            )}{' '}
            <Link
              href="/gert-lush-standard"
              className="text-comb-gold underline underline-offset-2"
            >
              Read how it works
            </Link>
            . If you keep bees and have honey to spare, we would like to{' '}
            <Link
              href="/become-a-supplier"
              className="text-comb-gold underline underline-offset-2"
            >
              hear from you
            </Link>
            .
          </p>
        </section>

        <section>
          <h2 className="text-porcelain text-xl font-bold tracking-tight">Common questions</h2>
          <dl className="mt-4 space-y-6">
            {FAQS.map((item) => (
              <div key={item.q}>
                <dt className="text-porcelain font-semibold">{item.q}</dt>
                <dd className="text-porcelain/70 mt-1">{item.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/shop/honey"
            className="bg-honey-amber text-ink focus-visible:outline-porcelain inline-block rounded-full px-6 py-2.5 text-sm font-semibold focus-visible:outline focus-visible:outline-offset-4"
          >
            Shop British honey
          </Link>
          <Link
            href="/postcode-honey"
            className="border-porcelain/40 bg-porcelain/10 text-porcelain hover:bg-porcelain/20 hover:border-porcelain focus-visible:outline-honey-amber inline-block rounded-full border px-6 py-2.5 text-sm font-semibold focus-visible:outline focus-visible:outline-offset-4"
          >
            Find honey by postcode
          </Link>
        </div>
      </div>
    </div>
  )
}
