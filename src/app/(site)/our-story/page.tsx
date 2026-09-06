import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Our Story',
  description:
    'Bristol honey. Proper lush. The story behind Gert Lush Honey and its postcode honey model.',
  alternates: { canonical: '/our-story' },
}

export default function OurStoryPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-honey-amber text-sm font-semibold tracking-wide uppercase">Our Story</p>
      <h1 className="text-porcelain mt-3 text-4xl font-bold tracking-tight text-balance">
        Bristol honey. Proper lush.
      </h1>
      <p className="text-porcelain/70 mt-4 text-lg">
        Every jar has a postcode, a season and a story.
      </p>

      <div className="relative mt-10 aspect-[21/9] overflow-hidden rounded-2xl">
        <Image
          src="/images/source/northern-slopes.jpg"
          alt="View across Bristol from the Northern Slopes greenspace"
          fill
          sizes="(min-width: 768px) 680px, 100vw"
          className="object-cover"
        />
      </div>

      <div className="text-porcelain/80 mt-10 space-y-5 text-base">
        <p>
          Gert Lush Honey started with one beekeeper and one postcode: BS3, Bristol&apos;s Northern
          Slopes. That first jar, Bee S3, is still the honey behind the brand today.
        </p>
        <p>
          The idea behind postcode honey is simple: honey shouldn&apos;t be anonymous. Where a hive
          sits — the streets, gardens and parks the bees forage in, the season they&apos;re
          harvested — shapes the colour, texture and character of every batch. Rather than smoothing
          that out, we think it&apos;s worth celebrating.
        </p>
        <p>
          Gert Lush Honey buys honey in bulk from independent beekeepers, checks and
          quality-controls it, then jars, labels and sells it under one standard. The beekeeper
          stays visibly credited on every jar — you&apos;re never buying something anonymous.
        </p>
        <p>
          As Adam, the beekeeper behind Bee S3, puts it:{' '}
          <span className="text-porcelain italic">
            &quot;great-tasting honey, supporting local beekeepers, and celebrating the people, bees
            and places behind every jar.&quot;
          </span>
        </p>
        <p>
          Bee S3 is the first postcode. It won&apos;t be the last — as more independent beekeepers
          join, more postcodes will follow.
        </p>
      </div>

      <div className="mt-12 flex flex-wrap gap-3">
        <Link
          href="/beekeepers"
          className="bg-honey-amber text-ink focus-visible:outline-porcelain inline-block rounded-full px-6 py-2.5 text-sm font-semibold focus-visible:outline focus-visible:outline-offset-4"
        >
          Meet the beekeeper
        </Link>
        <Link
          href="/postcode-honey"
          className="border-porcelain/40 bg-porcelain/10 text-porcelain hover:bg-porcelain/20 hover:border-porcelain focus-visible:outline-honey-amber inline-block rounded-full border px-6 py-2.5 text-sm font-semibold focus-visible:outline focus-visible:outline-offset-4"
        >
          Explore postcode honey
        </Link>
      </div>
    </div>
  )
}
