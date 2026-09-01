import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'The Gert Lush Standard',
  description:
    'Good beekeeping. Proper provenance. Carefully handled honey — the standard every Gert Lush honey is reviewed and checked against.',
  alternates: { canonical: '/gert-lush-standard' },
}

// Source: Gert_Lush_Standard_Website_Copy_v1.0.docx, supplied 2026-08-27 —
// carried across close to verbatim, since this is the user's own prepared
// copy, not something to rewrite. The doc's own internal notes say this is
// "a working draft for website and compliance review before publication"
// and warns "only publish claims that match the final approved
// supplier-review and batch-check procedures in practice" — hence the
// notice below, same honest-until-confirmed pattern as the legal pages.
const promises = [
  {
    number: '1',
    title: 'Healthy bees',
    lede: 'Good honey starts with well-managed colonies.',
    body: 'We expect our beekeepers to actively monitor the health of their bees, understand serious bee diseases and manage challenges such as Varroa responsibly.',
  },
  {
    number: '2',
    title: 'Responsible treatments',
    lede: 'What goes into the hive matters.',
    body: 'Our beekeepers must keep appropriate records of veterinary medicines and treatments used on their bees and follow the relevant instructions and harvest restrictions.',
  },
  {
    number: '3',
    title: 'Proper honey',
    lede: 'Honey should be honey. Nothing clever.',
    body: 'We require feeding to be managed separately from honey being produced for Gert Lush, and we do not accept honey with added syrups, flavourings or other ingredients. What goes into the jar should be what the bees made.',
  },
  {
    number: '4',
    title: 'Cleanly harvested and handled',
    lede: 'From hive to bucket, we want honey treated like the food it is.',
    body: "We review the beekeeper's harvesting, extraction and storage arrangements, including the cleanliness and suitability of food-contact equipment, containers and processing areas.",
  },
  {
    number: '5',
    title: 'Checked by Gert Lush',
    lede: 'The beekeeper is not the end of our checks.',
    body: 'When a batch arrives at Gert Lush, we inspect it before accepting it for packing. We check its condition, provenance and traceability and measure its moisture content before approving it for the Gert Lush range.',
  },
  {
    number: '6',
    title: 'Known provenance',
    lede: 'We know whose honey it is.',
    body: "Every Gert Lush local honey is linked to a named beekeeper, an identified area and a recorded harvest. We maintain the trail from the beekeeper's bulk honey through our own batch records and into the jars we sell. We do not publish precise hive locations — protecting apiary sites matters — but we do require enough information to substantiate the origin we put on the jar.",
  },
]

export default function GertLushStandardPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-honey-amber text-sm font-semibold tracking-wide uppercase">
        The Gert Lush Standard
      </p>
      <h1 className="text-porcelain mt-3 text-4xl font-bold tracking-tight text-balance">
        Good beekeeping. Proper provenance. Carefully handled honey.
      </h1>

      <div className="border-honey-amber/40 bg-honey-amber/10 mt-8 mb-10 rounded-xl border p-4 text-sm">
        <p className="text-honey-amber font-semibold">Working draft — pending compliance review</p>
        <p className="text-porcelain/70 mt-1">
          This page describes how we intend the Gert Lush Standard to work. It&apos;s only
          published for real once it matches our actual, final supplier-review and batch-check
          procedures in practice — not before.
        </p>
      </div>

      <div className="text-porcelain/80 space-y-4 text-base">
        <p>
          We believe knowing where honey comes from should mean more than printing a place name on
          a label.
        </p>
        <p>
          Before we work with an independent beekeeper, we review how their bees are managed, how
          their honey is harvested and extracted, how it is stored, and the records that sit
          behind it.
        </p>
        <p>
          When their honey reaches us, we check the batch again before it is packed under the Gert
          Lush name.
        </p>
        <p>
          Because every jar should have a beekeeper behind it — and a proper trail back to where it
          came from.
        </p>
      </div>

      <div className="mt-12 space-y-10">
        {promises.map((promise) => (
          <div key={promise.number} className="border-ink-line flex gap-5 border-t pt-8">
            <span className="border-comb-gold text-comb-gold flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-semibold">
              {promise.number}
            </span>
            <div>
              <p className="text-porcelain text-lg font-semibold">{promise.title}</p>
              <p className="text-comb-gold mt-1 text-sm italic">{promise.lede}</p>
              <p className="text-porcelain/70 mt-2 text-sm">{promise.body}</p>
            </div>
          </div>
        ))}
      </div>

      <section className="border-ink-line bg-honeycomb-surface mt-16 rounded-2xl border p-8">
        <h2 className="text-porcelain text-xl font-bold tracking-tight">
          What does &quot;Meets the Gert Lush Standard&quot; mean?
        </h2>
        <p className="text-porcelain/70 mt-3 text-sm">
          It means the beekeeper has passed our supplier review and the honey has passed our batch
          acceptance process.
        </p>
        <p className="text-porcelain/70 mt-3 text-sm">
          We review bee-health management, treatment records, harvesting and extraction practices,
          storage, provenance and traceability. We then carry out our own checks when the honey
          arrives with us.
        </p>
        <p className="text-porcelain mt-3 text-sm font-semibold">
          If something doesn&apos;t meet the standard, it doesn&apos;t get the mark.
        </p>
        <p className="text-porcelain/50 mt-6 text-xs">
          The Gert Lush Standard is Gert Lush Honey&apos;s own supplier and product quality
          standard. It is not a government or third-party certification scheme.
        </p>
      </section>

      <p className="text-porcelain/60 mt-10 text-sm">
        <Link href="/beekeepers" className="text-comb-gold underline underline-offset-2">
          Meet the beekeepers
        </Link>{' '}
        behind honey that meets this standard.
      </p>
    </div>
  )
}
