import type { Metadata } from 'next'
import { BackToCategoryLink } from '@/components/shop/back-to-category-link'

export const metadata: Metadata = {
  title: 'Make Your Garden More Bee Friendly',
  description:
    'Practical, research-backed ways to make a garden better for bees — plant colour and shape, flowering all season, and building a bee hotel for solitary bees.',
  alternates: { canonical: '/bee-friendly-garden' },
}

export default function BeeFriendlyGardenPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <BackToCategoryLink href="/information" label="Information" />

      <p className="text-honey-amber mt-6 text-sm font-semibold tracking-wide uppercase">
        Helping bees at home
      </p>
      <h1 className="text-porcelain mt-3 text-4xl font-bold tracking-tight text-balance">
        Make your garden more bee friendly.
      </h1>
      <p className="text-porcelain/70 mt-4 text-base">
        You don&apos;t need an allotment or a wildflower meadow to help bees — small, deliberate
        choices in an ordinary garden, balcony or window box make a real difference. Here&apos;s
        what actually helps, based on RHS and wildlife charity guidance.
      </p>

      <div className="text-porcelain/80 mt-10 space-y-8 text-base">
        <section>
          <h2 className="text-porcelain text-xl font-bold tracking-tight">
            Choose the right colours and shapes
          </h2>
          <p className="mt-3">
            Bees are drawn strongly to blue and purple flowers, and also forage well on yellow,
            white and orange blooms — lavender, hollyhock, cosmos, catmint and hellebore are all
            RHS-recommended pollinator plants. Colour isn&apos;t the only thing that matters
            though: shape counts too. Open, daisy-like flowers with easy-to-reach pollen and
            nectar suit the widest range of bees, including short-tongued solitary species, while
            tubular flowers like foxglove, salvia and honeysuckle feed longer-tongued bumblebees
            but shut out smaller visitors.
          </p>
          <p className="mt-3">
            Where you have a choice, pick single-flowered varieties over heavily &ldquo;double&rdquo;
            or pom-pom cultivars — the extra petals on double blooms are often bred at the expense
            of the pollen and nectar-bearing parts, so they can look impressive but offer very
            little to a bee.
          </p>
        </section>

        <section>
          <h2 className="text-porcelain text-xl font-bold tracking-tight">
            Plant for the whole season, not just summer
          </h2>
          <p className="mt-3">
            Bees need forage from as early as February through to late autumn, and gaps in that
            timeline are often where colonies and solitary bees alike run short. A few
            easy anchors for each stretch of the year:
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
            <li>
              <span className="text-porcelain font-medium">Late winter/early spring:</span>{' '}
              crocus, snowdrops, hellebores and flowering currant
            </li>
            <li>
              <span className="text-porcelain font-medium">Spring:</span> fruit tree blossom,
              pulmonaria, forget-me-not and bluebell
            </li>
            <li>
              <span className="text-porcelain font-medium">Summer:</span> lavender, catmint,
              foxglove, borage and single-flowered roses
            </li>
            <li>
              <span className="text-porcelain font-medium">Autumn:</span> ivy flowers, sedum,
              Michaelmas daisy and Verbena bonariensis
            </li>
          </ul>
          <p className="text-porcelain/60 mt-3 text-sm">
            Ivy is worth calling out on its own — it flowers late, when almost nothing else is
            available, and is one of the most important late-season food sources for bees
            building up reserves before winter.
          </p>
        </section>

        <section>
          <h2 className="text-porcelain text-xl font-bold tracking-tight">
            Cut back on pesticides, and let a few &ldquo;weeds&rdquo; be
          </h2>
          <p className="mt-3">
            Avoid spraying anything while it&apos;s in flower and bees are actively visiting it,
            and skip pesticides altogether where you can — even products marketed as
            garden-friendly can harm bees on contact. Letting patches of clover, dandelion and
            self-heal grow in a lawn, or mowing less often, costs nothing and can turn an ordinary
            lawn into a genuinely useful early-season food source.
          </p>
        </section>

        <section>
          <h2 className="text-porcelain text-xl font-bold tracking-tight">
            Leave out a shallow water source
          </h2>
          <p className="mt-3">
            Bees need water to drink and to regulate the humidity and temperature of a nest or
            hive, but they can drown in open water with no way to land. A shallow dish with
            pebbles or marbles poking above the waterline gives them somewhere safe to perch while
            they drink.
          </p>
        </section>

        <section>
          <h2 className="text-porcelain text-xl font-bold tracking-tight">
            Build or buy a bee hotel — for solitary bees, not honeybees
          </h2>
          <p className="mt-3">
            It&apos;s worth being clear about what a bee hotel actually does: honeybees like ours
            live in colonies inside a hive and won&apos;t use one. Bee hotels are for solitary
            bees — species like red mason bees and leafcutter bees, which don&apos;t form
            colonies and nest alone in narrow tunnels. They&apos;re excellent pollinators in their
            own right, and just as worth encouraging.
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm">
            <li>
              <span className="text-porcelain font-medium">Tubes:</span> use a mix of diameters
              between roughly 2mm and 10mm to suit different species, with most UK solitary bees
              preferring 3&ndash;5mm. Tubes should be at least 100mm deep and closed at the back —
              open both ends and the bees won&apos;t use them.
            </li>
            <li>
              <span className="text-porcelain font-medium">Materials:</span> untreated bamboo,
              reed or hardwood with drilled holes work well. Avoid anything varnished, glued or
              with splintered/frayed openings, and skip plastic tubes, which trap damp and
              encourage mould.
            </li>
            <li>
              <span className="text-porcelain font-medium">Placement:</span> fix it firmly (it
              shouldn&apos;t swing in the wind) around 1&ndash;1.5m off the ground, facing
              south or south-east for morning sun, and sheltered from driving rain.
            </li>
            <li>
              <span className="text-porcelain font-medium">Upkeep:</span> leave it undisturbed
              over winter — the next generation is often developing inside the tubes — but replace
              or renew the canes/tubes every couple of years to stop parasites and disease
              building up.
            </li>
          </ul>
        </section>

        <p className="text-porcelain/50 text-xs">
          Sources: Royal Horticultural Society (RHS) Plants for Pollinators guidance, The Wildlife
          Trusts, Friends of the Earth, and the Bumblebee Conservation Trust.
        </p>
      </div>
    </div>
  )
}
