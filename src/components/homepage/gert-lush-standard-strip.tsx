import Link from 'next/link'

// Compact homepage version of the Gert Lush Standard — the doc this is
// sourced from (Gert_Lush_Standard_Website_Copy_v1.0.docx) offers this as
// an alternative to a full section "if you want to surface the Standard on
// the homepage without adding another large section."
export function GertLushStandardStrip() {
  return (
    <section className="border-ink-line border-b px-6 py-12 lg:px-16">
      <Link
        href="/gert-lush-standard"
        className="group mx-auto flex max-w-4xl flex-col items-center gap-2 text-center"
      >
        <p className="text-comb-gold group-hover:text-porcelain text-sm font-semibold tracking-wide uppercase">
          The Gert Lush Standard
        </p>
        <p className="text-porcelain text-lg font-semibold">
          Beekeeper reviewed &middot; Batch checked &middot; Provenance recorded
        </p>
        <p className="text-porcelain/60 max-w-xl text-sm">
          We review the people, process and provenance behind our honey, then check each batch
          again before it is packed by Gert Lush.
        </p>
      </Link>
    </section>
  )
}
