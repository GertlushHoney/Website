// "How Gert Lush works" — a 3-stage strip directly beneath the hero, making
// the business model visual rather than expecting people to read an About
// page. Added 2026-08-27 per independent review feedback (John Hutchinson):
// resolves the "is this a single farm, an umbrella brand, or a marketplace?"
// ambiguity within five seconds of landing on the homepage.
//
// Icons are simple inline line-art (2026-08-28) — a beekeeper's veiled hat,
// a honey jar, and a house ("we bring it to your table") — echoing the
// icon-plus-caption layout from the reference mockup without adopting its
// colours (this site's own dark/gold palette stays as-is).
function BeekeeperIcon() {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mx-auto h-11 w-11"
      aria-hidden="true"
    >
      <ellipse cx="24" cy="15" rx="14" ry="4" />
      <path d="M14 15 Q24 6 34 15" />
      <path d="M17 19 Q24 23 31 19" />
      <path d="M17 19 L17 35 M21.5 19 L21.5 37 M24 19 L24 38 M26.5 19 L26.5 37 M31 19 L31 35" />
    </svg>
  )
}

function JarIcon() {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mx-auto h-11 w-11"
      aria-hidden="true"
    >
      <rect x="14" y="8" width="20" height="6" rx="2" />
      <path d="M16 14 L14 20 L14 38 Q14 40 16 40 L32 40 Q34 40 34 38 L34 20 L32 14" />
      <rect x="18" y="23" width="12" height="9" rx="1" />
    </svg>
  )
}

function HomeIcon() {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mx-auto h-11 w-11"
      aria-hidden="true"
    >
      <path d="M10 22 L24 10 L38 22" />
      <path d="M14 19 L14 38 L34 38 L34 19" />
      <rect x="21" y="28" width="6" height="10" />
    </svg>
  )
}

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
        <div className="mt-10 grid gap-10 sm:grid-cols-3">
          {stages.map((stage) => {
            const Icon = stage.icon
            return (
              <div key={stage.number} className="text-center">
                <div className="text-comb-gold">
                  <Icon />
                </div>
                <span className="border-comb-gold text-comb-gold mx-auto mt-4 flex h-16 w-16 items-center justify-center rounded-full border-2 text-3xl font-semibold">
                  {stage.number}
                </span>
                <p className="text-porcelain mt-4 text-xl font-semibold">{stage.title}</p>
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
