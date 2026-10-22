import type { Metadata } from 'next'
import Link from 'next/link'
import { BackToCategoryLink } from '@/components/shop/back-to-category-link'
import { standardCopy } from '@/lib/gert-lush-standard'

export const metadata: Metadata = {
  title: 'Is It Really Honey?',
  description:
    'Honey is hard to test and easy to dilute. What the law says honey is, what EU testing found, why kitchen tests do not work, and what to look for on a label.',
  alternates: { canonical: '/fake-honey' },
}

const EC_ACTION_URL =
  'https://food.ec.europa.eu/food-safety/eu-agri-food-fraud-network/eu-coordinated-actions/honey-2021-2022_en'
const LABELLING_GUIDE_URL =
  'https://www.businesscompanion.info/en/quick-guides/food-and-drink/labelling-of-honey'

const LABEL_CHECKS = [
  {
    title: 'Where was it harvested?',
    body: 'Honey sold in the UK must name the country or countries where it was harvested. "Blend of honeys from more than one country" tells you very little — and "packed in the UK" is not the same as "produced in the UK".',
  },
  {
    title: 'Who made it?',
    body: 'A named beekeeper, an apiary or a place you could actually look up is a better sign than a brand with no producer anywhere on the jar.',
  },
  {
    title: 'Does it say when?',
    body: 'Real honey is a seasonal harvest. A harvest year or season shows someone is keeping track of where each batch came from.',
  },
  {
    title: 'Does the price make sense?',
    body: 'Cheap honey is not automatically fake, and expensive honey is not automatically real — but a very low price for honey is a reason to look at the label more closely.',
  },
  {
    title: 'Can the seller tell you more?',
    body: 'A small producer or shop should be able to tell you who kept the bees and roughly where. If nobody can, treat that as information.',
  },
]

export default function FakeHoneyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <BackToCategoryLink href="/information" label="Information" />

      <p className="text-honey-amber mt-6 text-sm font-semibold tracking-wide uppercase">
        Honey fraud
      </p>
      <h1 className="text-porcelain mt-3 text-4xl font-bold tracking-tight text-balance">
        Is it really honey?
      </h1>
      <p className="text-porcelain/70 mt-4 text-base hyphens-auto sm:text-justify">
        Honey is cheap to dilute with sugar syrup and hard for anyone to prove. That is why it keeps
        turning up in food-fraud investigations. Most honey on a shelf is honest — but it is fair to
        ask how you would know, and here is what we can tell you.
      </p>

      <div className="text-porcelain/80 mt-12 space-y-14 text-base hyphens-auto sm:text-justify">
        <section>
          <h2 className="text-porcelain text-xl font-bold tracking-tight">What honey is, legally</h2>
          <p className="mt-3">
            In the UK, &quot;honey&quot; is a protected description. Under the Honey (England)
            Regulations 2015 (with matching rules in the rest of the UK), a product sold as honey
            has to be honey — nothing else can be added to it to bulk it out. Sugar syrup mixed
            into honey does not make a sweeter honey, it makes something that should not be sold
            as honey at all.
          </p>
          <p className="mt-3">
            The rules also cover the label: the country or countries where the honey was harvested
            must be shown, and a blend from several countries has to say so. Trading Standards
            guidance on this is{' '}
            <a
              href={LABELLING_GUIDE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-comb-gold underline underline-offset-2"
            >
              published by Business Companion
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-porcelain text-xl font-bold tracking-tight">
            What testing has found
          </h2>
          <p className="mt-3">
            Between 2021 and 2022 the European Commission ran a coordinated action called
            &quot;From the Hives&quot;. Of 320 honey samples it screened, 147 — 46% — were{' '}
            <span className="text-porcelain font-medium">suspected</span> of not complying with the
            rules, including for suspected added sugar. A similar earlier check in 2015–17 had found
            14%, though the Commission notes the newer laboratory methods were better at detecting
            it.
          </p>
          <p className="mt-3">
            Two things are worth keeping in mind. These were suspicion rates from laboratory
            screening, not confirmed prosecutions. And the Commission itself says the tests for
            honey authenticity are still lagging behind and cannot reliably detect low or
            intermediate levels of added sugar. The full results are on the{' '}
            <a
              href={EC_ACTION_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-comb-gold underline underline-offset-2"
            >
              European Commission&apos;s website
            </a>
            . It was an EU exercise, so it does not tell you what share of UK-sold honey is
            affected.
          </p>
        </section>

        <section>
          <h2 className="text-porcelain text-xl font-bold tracking-tight">
            Why kitchen tests don&apos;t work
          </h2>
          <p className="mt-3">
            You will see tricks online: dropping honey in water, the thumb test, holding a flame to
            it. They are not reliable. If specialist laboratories struggle to spot small amounts of
            added sugar, a glass of water will not do it — and some of those tests can fail genuine
            honey, which is naturally variable in moisture and thickness.
          </p>
          <p className="mt-3">
            Crystallising is the same. Genuine honey usually turns solid over time, and a clear
            runny jar is not proof of anything either way. Because you cannot test it yourself, the
            more useful question is who you are trusting, and why.
          </p>
        </section>

        <section>
          <h2 className="text-porcelain text-xl font-bold tracking-tight">
            What to look for instead
          </h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {LABEL_CHECKS.map((check) => (
              <li
                key={check.title}
                className="border-ink-line bg-honeycomb-surface rounded-2xl border p-5"
              >
                <p className="text-comb-gold text-sm font-semibold">{check.title}</p>
                <p className="text-porcelain/70 mt-2 text-sm">{check.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-porcelain text-xl font-bold tracking-tight">
            How we approach it
          </h2>
          <p className="mt-3">
            We cannot test your honey in your kitchen either, so we try to make it checkable by a
            person instead. Every jar is from one named beekeeper and tied to one real postcode,
            and the beekeeper is named on the product page. You can see where it
            came from on our{' '}
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
            .
          </p>
          <p className="text-porcelain/70 mt-3 text-sm">
            To be straight about it: knowing the beekeeper is not the same as a laboratory
            certificate. It means there is a person and a place behind each jar that you can ask
            about — and if you do, we will answer.
          </p>
        </section>

        <p className="text-porcelain/50 text-sm">
          Have a question about where a jar came from?{' '}
          <Link href="/contact" className="text-comb-gold underline underline-offset-2">
            Get in touch
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
