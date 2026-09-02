import { LocationPinIcon, BeekeeperIcon, JarIcon, DeliveryTruckIcon } from '@/components/icons/line-icons'

// Kept to four honest claims. Dropped "thoughtful gifting" from the
// reference layout since that's not a real feature yet (no dedicated
// gifting product line exists) — matches this site's rule of not implying
// a capability that isn't built.
const points = [
  {
    icon: LocationPinIcon,
    title: 'Real provenance',
    body: 'We share the place and story behind every jar.',
  },
  {
    icon: BeekeeperIcon,
    title: 'Named beekeepers',
    body: 'Every jar is produced by a real person we know and trust.',
  },
  {
    icon: JarIcon,
    title: 'Small-batch British honey',
    body: 'Carefully sourced, never mass-blended.',
  },
  {
    icon: DeliveryTruckIcon,
    title: 'Careful UK delivery',
    body: 'Royal Mail Tracked 48 on every order.',
  },
]

export function TrustRow() {
  return (
    <section className="border-ink-line border-b px-6 py-16 lg:px-16">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-porcelain text-center text-3xl font-bold tracking-tight text-balance">
          Why people choose Gert Lush
        </h2>
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
          {points.map((point, index) => {
            const Icon = point.icon
            return (
              <div
                key={point.title}
                className={`text-center lg:px-6 ${index > 0 ? 'lg:border-ink-line lg:border-l' : ''}`}
              >
                <div className="text-comb-gold">
                  <Icon />
                </div>
                <p className="text-porcelain mt-3 text-sm font-semibold">{point.title}</p>
                <p className="text-porcelain/60 mt-2 text-sm">{point.body}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
