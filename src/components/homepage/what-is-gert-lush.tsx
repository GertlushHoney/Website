// "How Gert Lush works" — a 3-stage strip directly beneath the hero, making
// the business model visual rather than expecting people to read an About
// page. Added 2026-08-27 per independent review feedback (John Hutchinson):
// resolves the "is this a single farm, an umbrella brand, or a marketplace?"
// ambiguity within five seconds of landing on the homepage.
const stages = [
  {
    number: '1',
    title: 'Independent beekeeper',
    body: 'Produces and harvests the honey.',
  },
  {
    number: '2',
    title: 'Gert Lush',
    body: 'Selects, checks, jars, labels and packs it.',
  },
  {
    number: '3',
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
        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          {stages.map((stage) => (
            <div key={stage.number} className="text-center">
              <span className="border-comb-gold text-comb-gold mx-auto flex h-10 w-10 items-center justify-center rounded-full border text-lg font-semibold">
                {stage.number}
              </span>
              <p className="text-porcelain mt-4 text-base font-semibold">{stage.title}</p>
              <p className="text-porcelain/60 mt-2 text-sm">{stage.body}</p>
            </div>
          ))}
        </div>
        <p className="text-porcelain/50 mt-10 text-center text-sm">
          Gert Lush is the brand. Independent beekeepers produce the honey. We bring it to your
          table.
        </p>
      </div>
    </section>
  )
}
