import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Sustainability',
  description:
    'Good for bees. Better for the planet — how Gert Lush Honey approaches beekeeping, packaging and supporting British beekeepers.',
  alternates: { canonical: '/sustainability' },
}

const COMMITMENTS = [
  {
    title: 'British Honey',
    description:
      'We source our honey from British beekeepers and celebrate the different flavours, locations and people behind every batch.',
  },
  {
    title: 'Reusable Glass Jars',
    description: 'Our honey is supplied in glass jars that can be reused or widely recycled.',
  },
  {
    title: 'Plastic-Free Postal Packaging',
    description:
      'Our postal packaging uses paper and cardboard-based materials rather than unnecessary plastic.',
  },
  {
    title: 'Minimal Packaging',
    description: 'We use only the packaging needed to protect the product and get it safely to you.',
  },
  {
    title: 'Supporting Independent Beekeepers',
    description:
      'We work with and support independent British beekeepers, helping create a sustainable market for their honey.',
  },
  {
    title: 'Reducing Waste',
    description: 'We reuse, recycle and minimise waste wherever practical throughout our business.',
  },
]

export default function SustainabilityPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-honey-amber text-sm font-semibold tracking-wide uppercase">
        Sustainability
      </p>
      <h1 className="text-porcelain mt-3 text-4xl font-bold tracking-tight text-balance">
        Naturally better.
      </h1>
      <p className="text-porcelain/70 mt-4 text-lg">Good for bees. Better for the planet.</p>

      <div className="relative mt-10 aspect-[21/9] overflow-hidden rounded-2xl">
        <Image
          src="/images/source/bees-on-comb.jpg"
          alt="Honeybees working a frame of comb"
          fill
          sizes="(min-width: 768px) 680px, 100vw"
          className="object-cover"
        />
      </div>

      <div className="text-porcelain/80 mt-10 space-y-14 text-base">
        <section>
          <h2 className="text-porcelain text-xl font-bold tracking-tight">
            It starts with the bees
          </h2>
          <p className="mt-3">
            We believe good beekeeping means working with nature, not against it. Our bees are
            cared for responsibly, with their health and welfare always coming first. Healthy
            colonies, thriving forage and a diverse local environment are essential not only for
            producing great honey, but for supporting the wider ecosystem around us.
          </p>
          <p className="mt-3">
            Wherever possible, we keep things local. Our honey is sourced from British beekeepers,
            and individual batches retain their connection to the places and people that produced
            them. By celebrating local and regional honey, we support independent beekeepers,
            British beekeeping, and the communities where our honey is produced.
          </p>
        </section>

        <section>
          <h2 className="text-porcelain text-xl font-bold tracking-tight">
            Our hives don&apos;t need to be perfect. They just need to be good homes.
          </h2>
          <p className="mt-3">
            Even our beehives reflect the way we think about sustainability. Our hives are made
            using <strong className="text-porcelain">Thorne &quot;seconds&quot; cedar
            beehives</strong>, manufactured here in Britain at Thorne&apos;s factory in
            Lincolnshire.
          </p>
          <p className="mt-3">
            &quot;Seconds&quot; doesn&apos;t mean second-hand. It refers to perfectly usable cedar
            that may have natural imperfections such as knots, small splits or plugged sections.
            It might not look quite as cosmetically perfect as premium-grade timber, but to the
            bees that really doesn&apos;t matter.
          </p>
          <p className="mt-3">
            Thorne&apos;s seconds hives are made from home-grown Western Red Cedar sourced from
            sustainable forests. Cedar is naturally durable and, thanks to the natural oils
            within the timber, doesn&apos;t need the same painting or treatment that many other
            timbers require.
          </p>
          <p className="mt-3">
            For us, choosing seconds makes sense. We&apos;d rather use good, functional timber
            with a bit of character than insist that every piece of wood has to look perfect.
          </p>
          <p className="text-porcelain mt-3 text-lg font-semibold text-balance">
            After all, the bees aren&apos;t bothered by a knot in the wood — and neither are we.
          </p>
        </section>

        <section>
          <h2 className="text-porcelain text-xl font-bold tracking-tight">
            Packaging with a purpose
          </h2>
          <p className="mt-3">
            Honey doesn&apos;t need lots of plastic around it. Our honey is packed in reusable and
            widely recyclable glass jars, and our postal packaging uses recyclable paper and
            cardboard-based materials rather than unnecessary plastic.
          </p>

          <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-2xl">
            <Image
              src="/images/source/bee-s3-jars-stack-professional.jpg"
              alt="Stacked glass jars of Bee S3 honey"
              fill
              sizes="(min-width: 768px) 680px, 100vw"
              className="object-cover"
            />
          </div>

          <p className="text-porcelain mt-6 text-lg font-semibold text-balance">
            Protect the jar, not wrap the planet.
          </p>
          <p className="text-porcelain/70 mt-2">
            We use packaging designed to keep your honey safe in transit while keeping waste and
            unnecessary materials to a minimum.
          </p>
        </section>

        <section>
          <h2 className="text-porcelain text-xl font-bold tracking-tight">
            Waste less. Use more.
          </h2>
          <p className="mt-3">
            We make sensible choices throughout the business to reduce waste — ordering packaging
            efficiently, avoiding unnecessary materials, reusing suitable packaging where
            appropriate, and choosing recyclable materials wherever we can.
          </p>
          <p className="mt-3">
            And when your Gert Lush jar is empty, give it another life. Wash it, reuse it, refill
            it, or pop it in the recycling.
          </p>
        </section>

        <section>
          <h2 className="text-porcelain text-xl font-bold tracking-tight">
            Supporting British beekeeping
          </h2>
          <p className="mt-3">
            For us, sustainability is about much more than packaging. Gert Lush Honey works with
            independent British beekeepers and supports a sustainable market for genuine British
            honey. We believe beekeepers should receive a fair price for their crop, and customers
            should know where their honey comes from, who produced it, and the story behind it.
            Supporting British honey helps support the beekeepers, bees and landscapes that make
            it possible.
          </p>
        </section>

        <section>
          <h2 className="text-porcelain text-xl font-bold tracking-tight">
            Our sustainability commitments
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {COMMITMENTS.map((item) => (
              <div key={item.title} className="border-ink-line bg-honeycomb-surface rounded-2xl border p-5">
                <p className="text-comb-gold text-sm font-semibold">{item.title}</p>
                <p className="text-porcelain/70 mt-2 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-honey-amber/40 bg-honeycomb-surface rounded-2xl border p-6 text-center sm:p-8">
          <p className="text-porcelain text-lg font-semibold text-balance">
            Better honey. Less waste. More support for British bees and beekeepers.
          </p>
        </section>
      </div>

      <div className="mt-12 flex flex-wrap gap-3">
        <Link
          href="/shop/honey"
          className="bg-honey-amber text-ink focus-visible:outline-porcelain inline-block rounded-full px-6 py-2.5 text-sm font-semibold focus-visible:outline focus-visible:outline-offset-4"
        >
          Shop British honey
        </Link>
        <Link
          href="/beekeepers"
          className="border-porcelain/40 bg-porcelain/10 text-porcelain hover:bg-porcelain/20 hover:border-porcelain focus-visible:outline-honey-amber inline-block rounded-full border px-6 py-2.5 text-sm font-semibold focus-visible:outline focus-visible:outline-offset-4"
        >
          Meet our beekeepers
        </Link>
      </div>
    </div>
  )
}
