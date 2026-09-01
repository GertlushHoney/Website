import Link from 'next/link'

// Only rendered when a honeyProduct's meetsGertLushStandard flag is
// explicitly true in Sanity — never assumed for every active product, so
// switching this on for a given batch is a deliberate choice, not a default.
export function GertLushStandardBadge() {
  return (
    <div className="border-comb-gold/40 bg-comb-gold/5 mt-6 rounded-xl border p-4">
      <p className="text-comb-gold text-sm font-semibold">✓ Meets the Gert Lush Standard</p>
      <p className="text-porcelain/70 mt-1 text-sm">
        Beekeeper reviewed. Batch checked. Provenance recorded. This honey comes from a beekeeper
        who has met our supplier standards for bee husbandry, honey handling and traceability, and
        this batch has been checked by Gert Lush before packing.
      </p>
      <Link
        href="/gert-lush-standard"
        className="text-comb-gold hover:text-porcelain focus-visible:outline-honey-amber mt-2 inline-block text-sm font-semibold underline underline-offset-2 focus-visible:outline focus-visible:outline-offset-2"
      >
        Learn about the Gert Lush Standard →
      </Link>
    </div>
  )
}
