import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Information',
  description:
    'Beekeeping and bee-health information from Gert Lush Honey — becoming a supplier, Asian hornets, and frequently asked questions.',
}

// A hub for the site's educational/awareness content, as distinct from
// shopping or trade pages — added 2026-08-10 at the user's request, pulling
// together pages that already existed but were only reachable via the
// footer (Asian Hornets, Become a Supplier) plus FAQs. Deliberately doesn't
// remove those pages from the footer too — multiple paths to the same page
// is already how the rest of the site's nav works (e.g. Stockists is both
// a top-nav item and a footer link).
const CARDS = [
  {
    href: '/becoming-a-beekeeper',
    eyebrow: 'For aspiring beekeepers',
    title: 'Thinking of becoming a beekeeper?',
    description:
      'A practical guide to getting started — local associations, courses, costs, equipment, and the route to Master Beekeeper.',
    image: null,
  },
  {
    href: '/become-a-supplier',
    eyebrow: 'For beekeepers',
    title: 'Becoming a beekeeper supplier',
    description:
      'Keep bees and have surplus honey? We buy bulk honey from independent beekeepers across Britain and handle the retail side, so you can stick to the bees.',
    image: null,
  },
  {
    href: '/asian-hornets',
    eyebrow: 'Protecting British bees',
    title: 'Asian hornets',
    description:
      'What the yellow-legged (Asian) hornet is, why it threatens British honeybee colonies, and how to report a sighting.',
    image: {
      src: '/images/source/asian-hornet-2026.jpg',
      alt: 'Close-up of a male Asian hornet (Vespa velutina) head, showing its dark body, orange face and yellow-tipped legs',
    },
  },
  {
    href: '/faqs',
    eyebrow: 'Common questions',
    title: 'FAQs',
    description:
      'Answers to common questions about Gert Lush Honey — sourcing, ordering, delivery, storage and more.',
    image: null,
  },
]

export default function InformationPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <p className="text-honey-amber text-sm font-semibold tracking-wide uppercase">
        Information
      </p>
      <h1 className="text-porcelain mt-3 max-w-2xl text-4xl font-bold tracking-tight text-balance">
        Beyond the jar.
      </h1>
      <p className="text-porcelain/70 mt-4 max-w-xl text-base">
        Beekeeping, bee health, and the questions people ask us most.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {CARDS.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="border-ink-line bg-honeycomb-surface hover:border-honey-amber focus-visible:outline-honey-amber group flex flex-col overflow-hidden rounded-2xl border transition focus-visible:outline focus-visible:outline-offset-2"
          >
            {card.image && (
              <div className="relative aspect-[16/9]">
                <Image
                  src={card.image.src}
                  alt={card.image.alt}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition group-hover:scale-105"
                />
              </div>
            )}
            <div className="flex flex-1 flex-col p-6">
              <p className="text-comb-gold text-xs font-semibold tracking-wide uppercase">
                {card.eyebrow}
              </p>
              <h2 className="text-porcelain mt-2 text-lg font-bold tracking-tight">
                {card.title}
              </h2>
              <p className="text-porcelain/70 mt-2 text-sm">{card.description}</p>
              <span className="text-comb-gold mt-4 text-sm font-semibold">Learn more &rarr;</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
