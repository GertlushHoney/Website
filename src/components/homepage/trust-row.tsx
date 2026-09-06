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

// Pointy-top hexagon — same shape used for the shop tiles' phone-carousel
// cards and the Gert Lush Standard stamp, so this reads as the same visual
// system rather than a one-off shape introduced just here.
const HEX_CLIP = 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'

export function TrustRow() {
  return (
    <section className="border-ink-line border-b px-6 py-16 lg:px-16">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-porcelain text-center text-3xl font-bold tracking-tight text-balance">
          Why people choose Gert Lush
        </h2>
        <div className="mt-12 flex flex-wrap justify-center gap-x-6 gap-y-10">
          {points.map((point) => {
            const Icon = point.icon
            return (
              <div key={point.title} className="w-40 text-center">
                <div className="relative mx-auto flex h-[172px] w-[150px] items-center justify-center">
                  {/* Outline ring — outer hex in gold, inner hex inset by the
                      ring width in the page's own background colour, so only
                      a thin gold hexagon border shows, not a filled shape. */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0"
                    style={{ clipPath: HEX_CLIP, backgroundColor: 'var(--color-comb-gold)' }}
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-[2px]"
                    style={{ clipPath: HEX_CLIP, backgroundColor: 'var(--color-ink)' }}
                  />
                  <div className="relative flex flex-col items-center gap-2 px-3">
                    <div className="text-comb-gold">
                      <Icon className="h-9 w-9" />
                    </div>
                    <p className="text-porcelain text-sm leading-tight font-semibold">
                      {point.title}
                    </p>
                  </div>
                </div>
                <p className="text-porcelain/60 mt-3 text-sm">{point.body}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
