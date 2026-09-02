import { BeekeeperIcon, JarIcon, HomeIcon } from '@/components/icons/line-icons'

// "How Gert Lush works" — a 3-stage strip directly beneath the hero, making
// the business model visual rather than expecting people to read an About
// page. Added 2026-08-27 per independent review feedback (John Hutchinson):
// resolves the "is this a single farm, an umbrella brand, or a marketplace?"
// ambiguity within five seconds of landing on the homepage.
const stages = [
  {
    number: '1',
    icon: BeekeeperIcon,
    title: 'Independent beekeeper',
    body: 'Produces and harvests the honey.',
  },
  {
    number: '2',
    icon: JarIcon,
    title: 'Gert Lush',
    body: 'Selects, checks, jars, labels and packs it.',
  },
  {
    number: '3',
    icon: HomeIcon,
    title: 'You',
    body: 'Get proper British honey with its provenance preserved.',
  },
]

export function WhatIsGertLush() {
  return (
    <section className="border-ink-line bg-honeycomb-surface border-b px-6 py-16 lg:px-16">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-porcelain text-center text-3xl font-bold tracking-tight text-balance">
          How Gert Lush works
        </h2>
        <div className="mt-10 grid gap-10 sm:grid-cols-3 lg:gap-0">
          {stages.map((stage, index) => {
            const Icon = stage.icon
            return (
              <div
                key={stage.number}
                className={`text-center lg:px-6 ${index > 0 ? 'lg:border-ink-line lg:border-l' : ''}`}
              >
                <div className="text-comb-gold">
                  <Icon />
                </div>
                <span className="border-comb-gold text-comb-gold mx-auto mt-4 flex h-16 w-16 items-center justify-center rounded-full border-2 text-3xl font-semibold">
                  {stage.number}
                </span>
                <p className="text-porcelain mt-3 text-sm font-semibold">{stage.title}</p>
                <p className="text-porcelain/60 mt-2 text-sm">{stage.body}</p>
              </div>
            )
          })}
        </div>
        <p className="text-porcelain/50 mt-10 text-center text-sm">
          Gert Lush is the brand. Independent beekeepers produce the honey. We bring it to your
          table.
        </p>
      </div>
    </section>
  )
}
