import Image from 'next/image'
import Link from 'next/link'

// Facts below are taken directly from the physical label artwork
// (Bee_S3_packaging_mockup_reference.png) plus the user-confirmed price —
// nothing invented. This static list will be replaced by real Shopify data
// once Phase 3 is wired in. Full origin/beekeeper detail lives on the
// product page, not here — this panel is deliberately a short teaser, per
// the homepage's brand-generic framing (see Hero).
const facts = [
  { label: 'Price', value: '£8.00' },
  { label: 'Weight', value: '12oz / 280ml' },
  { label: 'Origin', value: 'Bristol, UK' },
]

export function FeaturedProduct() {
  return (
    <section className="border-ink-line grid items-stretch border-b lg:grid-cols-2">
      <div className="relative order-2 min-h-[420px] lg:order-1 lg:min-h-[560px]">
        <Image
          src="/images/source/bee-s3-jars-stack-professional.jpg"
          alt="Stacked jars of Bee S3 honey"
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
        <div className="from-ink/70 absolute inset-0 bg-gradient-to-t via-transparent to-transparent" />
      </div>

      <div className="bg-honeycomb-surface order-1 flex flex-col justify-center px-6 py-16 lg:order-2 lg:px-16">
        <p className="text-honey-amber text-sm font-semibold tracking-wide uppercase">
          This season&apos;s harvest
        </p>
        <p className="font-display text-comb-gold mt-2 text-2xl italic">Bee S3</p>
        <h2 className="text-porcelain mt-3 text-4xl font-bold tracking-tight text-balance">
          Our Bristol original.
        </h2>
        <dl className="mt-8 space-y-4">
          {facts.map((fact) => (
            <div key={fact.label} className="border-ink-line flex gap-4 border-t pt-4">
              <dt className="text-porcelain/50 w-24 shrink-0 text-sm font-medium">{fact.label}</dt>
              <dd className="text-porcelain/90 text-sm">{fact.value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Link
            href="/shop/bee-s3"
            className="bg-honey-amber text-ink focus-visible:outline-porcelain rounded-full px-6 py-2.5 text-sm font-semibold focus-visible:outline focus-visible:outline-offset-4"
          >
            Buy Bee S3
          </Link>
          <Link
            href="/shop/bee-s3"
            className="border-porcelain/30 text-porcelain hover:border-porcelain focus-visible:outline-honey-amber rounded-full border px-6 py-2.5 text-sm font-semibold focus-visible:outline focus-visible:outline-offset-4"
          >
            See origin &amp; beekeeper
          </Link>
        </div>
      </div>
    </section>
  )
}
