import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Become a Supplier',
  description:
    'Keep bees and have surplus honey? Gert Lush Honey buys bulk honey from independent beekeepers across Britain.',
}

export default function BecomeASupplierPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <p className="text-comb-gold text-sm font-semibold tracking-wide uppercase">
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
          href="mailto:gertlushhoney@outlook.com?subject=Become%20a%20supplier&body=Apiary%20area%3A%0AApproximate%20colonies%3A%0ATypical%20seasonal%20surplus%3A%0AExtraction%2Fstorage%20arrangement%3A%0ARegistration%2Finsurance%3A%0ALikely%20supply%20timing%3A"
          className="bg-honey-amber text-ink focus-visible:outline-porcelain mt-6 inline-block rounded-full px-6 py-2.5 text-sm font-semibold focus-visible:outline focus-visible:outline-offset-4"
        >
          Apply to become a supplier
        </a>
      </div>
    </div>
  )
}
