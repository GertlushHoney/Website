import type { Metadata } from 'next'
import Link from 'next/link'
import { BackToCategoryLink } from '@/components/shop/back-to-category-link'

export const metadata: Metadata = {
  title: 'Become a Supplier',
  description:
    'Keep bees and have surplus honey? Gert Lush Honey buys bulk honey from independent beekeepers across Britain.',
  alternates: { canonical: '/become-a-supplier' },
}

export default function BecomeASupplierPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <BackToCategoryLink href="/information" label="Information" />

      <p className="text-comb-gold mt-6 text-sm font-semibold tracking-wide uppercase">
        Become a supplier
      </p>
      <h1 className="text-porcelain mt-3 text-4xl font-bold tracking-tight text-balance">
        Love beekeeping. Don&apos;t love selling honey?
      </h1>
      <p className="text-porcelain/70 mt-4 text-base">
        Most beekeepers get into it for the bees, not for turning surplus honey into a retail
        product — sourcing jars and labels, working out pricing, finding buyers, dealing with
        food-safety paperwork. That&apos;s the hassle Gert Lush Honey exists to take off your
        hands.
      </p>
      <p className="text-porcelain/70 mt-4 text-base">
        We buy suitable bulk honey from independent beekeepers, wherever you&apos;re based in
        Britain — not just Bristol. You keep managing your bees and harvesting; we handle intake,
        quality checks, jarring, branding and sale, and you remain credited as the beekeeper
        behind the batch. No stall to run, no customers to chase — just a fair price for your
        surplus.
      </p>

      <section className="mt-10">
        <h2 className="text-porcelain text-xl font-bold tracking-tight">What we look for</h2>
        <p className="text-porcelain/70 mt-3 text-sm">
          We&apos;re not expecting commercial-scale paperwork or a formal certification — most
          independent beekeepers won&apos;t have that, and we&apos;re not asking for it. What we do
          look at, before and when we take on your honey:
        </p>
        <ul className="text-porcelain/70 mt-3 list-disc space-y-1 pl-5 text-sm">
          <li>How you manage your bees&apos; health, and how you handle challenges like Varroa</li>
          <li>Any treatments you use, and keeping basic records of them</li>
          <li>Keeping feeding separate from honey that&apos;s meant for us</li>
          <li>How you extract and store your honey, and the cleanliness of your equipment</li>
          <li>Being able to substantiate where your honey actually comes from</li>
        </ul>
        <p className="text-porcelain/70 mt-3 text-sm">
          This is the same review every beekeeper we work with goes through — see{' '}
          <Link
            href="/gert-lush-standard"
            className="text-comb-gold underline underline-offset-2"
          >
            The Gert Lush Standard
          </Link>{' '}
          for the full detail.
        </p>
      </section>

      <div className="border-ink-line bg-honeycomb-surface mt-10 rounded-2xl border p-8">
        <h2 className="text-porcelain text-xl font-bold tracking-tight">To get started</h2>
        <p className="text-porcelain/70 mt-3 text-sm">It helps to know:</p>
        <ul className="text-porcelain/70 mt-3 list-disc space-y-1 pl-5 text-sm">
          <li>Your general apiary area (postcode is enough for now)</li>
          <li>Roughly how many colonies you keep</li>
          <li>Typical surplus available per season</li>
          <li>How the honey is extracted and stored before collection</li>
          <li>Any current beekeeping association registration and insurance</li>
          <li>When you&apos;d expect to have honey ready to supply</li>
        </ul>
        <a
          href="mailto:suppliers@gertlushhoney.co.uk?subject=Become%20a%20supplier&body=Apiary%20area%3A%0AApproximate%20colonies%3A%0ATypical%20seasonal%20surplus%3A%0AExtraction%2Fstorage%20arrangement%3A%0ARegistration%2Finsurance%3A%0ALikely%20supply%20timing%3A"
          className="bg-honey-amber text-ink focus-visible:outline-porcelain mt-6 inline-block rounded-full px-6 py-2.5 text-sm font-semibold focus-visible:outline focus-visible:outline-offset-4"
        >
          Apply to become a supplier
        </a>
      </div>
    </div>
  )
}
