import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getBeekeepers } from '@/lib/sanity/beekeepers'
import { urlForImage } from '@/lib/sanity/image'

export const metadata: Metadata = {
  title: 'Our Beekeepers',
  description:
    'Meet the independent partner beekeepers behind Gert Lush Honey, starting with Adam and Bee S3.',
  alternates: { canonical: '/beekeepers' },
}

export default async function BeekeepersPage() {
  const beekeepers = await getBeekeepers()

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-honey-amber text-sm font-semibold tracking-wide uppercase">
        Our Beekeepers
      </p>
      <h1 className="text-porcelain mt-3 text-4xl font-bold tracking-tight text-balance">
        The people behind the honey.
      </h1>
      <p className="text-porcelain/70 mt-4 text-base">
        Gert Lush began with our own bees at Bramble Farm. Today we&apos;re building a network of
        independent British beekeepers whose honey we select, check, jar and sell — while keeping
        each beekeeper and place at the heart of the story.
      </p>

      <div className="relative mt-10 aspect-[21/9] overflow-hidden rounded-2xl">
        <Image
          src="/images/source/bees-on-comb.jpg"
          alt="Honeybees working a frame of comb"
          fill
          sizes="(min-width: 768px) 680px, 100vw"
          className="object-cover"
        />
      </div>

      {beekeepers.length > 0 ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {beekeepers.map((beekeeper) => {
            const portraitUrl = urlForImage(beekeeper.portrait ?? undefined)
              ?.width(400)
              .height(400)
              .url()
            return (
              <Link
                key={beekeeper._id}
                href={`/beekeepers/${beekeeper.slug}`}
                className="border-ink-line bg-honeycomb-surface hover:border-honey-amber focus-visible:outline-honey-amber block rounded-2xl border p-6 transition focus-visible:outline focus-visible:outline-offset-2"
              >
                {portraitUrl && (
                  <div className="relative mb-4 aspect-square overflow-hidden rounded-xl">
                    <Image
                      src={portraitUrl}
                      alt={beekeeper.name}
                      fill
                      sizes="200px"
                      className="object-cover"
                    />
                  </div>
                )}
                {beekeeper.honeyName && (
                  <p className="text-honey-amber text-xs font-semibold tracking-wide uppercase">
                    {beekeeper.honeyName}
                  </p>
                )}
                <p className="text-porcelain mt-1 text-lg font-semibold">{beekeeper.name}</p>
                <p className="text-porcelain/50 text-sm">{beekeeper.area}</p>
                <p className="text-porcelain/70 mt-3 text-sm">{beekeeper.teaser}</p>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="border-ink-line bg-honeycomb-surface mt-10 rounded-2xl border p-8">
          <p className="text-honey-amber text-sm font-semibold tracking-wide uppercase">Bee S3</p>
          <h2 className="text-porcelain mt-2 text-2xl font-bold tracking-tight">
            Meet Adam, the beekeeper behind Bee S3.
          </h2>
          <div className="text-porcelain/80 mt-4 space-y-4 text-base">
            <p>
              Adam started beekeeping in 2015 while working at a boarding school — after admitting
              to an experienced beekeeper that he was &quot;petrified&quot; of bees, the advice
              back was simple: buy a beehive. He said there was no chance. A couple of months
              later, he bought his first hive in a winter sale.
            </p>
            <p>
              With a mentor&apos;s help and an Introduction to Beekeeping course with Somerset
              Central Division, he was quickly hooked. More than ten years on, he still loves the
              excitement of opening a hive and never quite knowing what he&apos;s going to find —
              beekeeping keeps teaching him something new, and the bees don&apos;t always follow
              the textbook.
            </p>
            <p>
              In 2019 the bees moved to Bramble Farm on Bristol&apos;s Northern Slopes, a
              community farm that feels like a piece of countryside hidden in the middle of the
              city. Today there are around ten colonies, with his wife and children involved at
              every stage.
            </p>
            <p>
              Beekeeping is his escape from a working life in technology and education — but Gert
              Lush Honey brings those two worlds together. The aim is simple: great-tasting honey,
              supporting local beekeepers, and celebrating the people, bees and places behind
              every jar.
            </p>
          </div>
        </div>
      )}

      <p className="text-porcelain/50 mt-8 text-sm">
        More beekeeper profiles will appear here as new postcode honeys join Gert Lush — we
        don&apos;t publish details until they&apos;re confirmed and approved.
      </p>

      <div className="border-ink-line bg-honeycomb-surface mt-8 rounded-2xl border p-8">
        <p className="text-comb-gold text-sm font-semibold tracking-wide uppercase">
          Keep bees yourself?
        </p>
        <h2 className="text-porcelain mt-2 text-2xl font-bold tracking-tight">
          Love beekeeping. Don&apos;t love selling honey?
        </h2>
        <p className="text-porcelain/70 mt-4 text-sm">
          We buy suitable bulk honey from independent beekeepers across Britain, and handle
          everything from intake to sale — you stay credited as the beekeeper behind the batch.
        </p>
        <Link
          href="/become-a-supplier"
          className="bg-honey-amber text-ink focus-visible:outline-porcelain mt-6 inline-block rounded-full px-6 py-2.5 text-sm font-semibold focus-visible:outline focus-visible:outline-offset-4"
        >
          Become a supplier
        </Link>
      </div>

      <div className="border-ink-line bg-honeycomb-surface mt-8 rounded-2xl border p-8">
        <p className="text-comb-gold text-sm font-semibold tracking-wide uppercase">
          For every beekeeper, not just ours
        </p>
        <h2 className="text-porcelain mt-2 text-2xl font-bold tracking-tight">
          Seen an Asian hornet?
        </h2>
        <p className="text-porcelain/70 mt-4 text-sm">
          The yellow-legged (Asian) hornet is the biggest current threat to honeybee colonies in
          Britain. Whether you supply us or not, if you think you&apos;ve spotted one, reporting
          it quickly genuinely helps.
        </p>
        <Link
          href="/asian-hornets"
          className="border-porcelain/40 bg-porcelain/10 text-porcelain hover:bg-porcelain/20 hover:border-porcelain focus-visible:outline-honey-amber mt-5 inline-block rounded-full border px-6 py-2.5 text-sm font-semibold focus-visible:outline focus-visible:outline-offset-4"
        >
          How to identify and report it
        </Link>
      </div>
    </div>
  )
}
