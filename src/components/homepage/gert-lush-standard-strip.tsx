import Link from 'next/link'

// Compact homepage version of the Gert Lush Standard — the doc this is
// sourced from (Gert_Lush_Standard_Website_Copy_v1.0.docx) offers this as
// an alternative to a full section "if you want to surface the Standard on
// the homepage without adding another large section."
//
// Redesigned 2026-08-28: the original version was three centred lines of
// plain text with no icon, border or real button — it read as an
// afterthought next to the icon/photo treatment every other homepage
// section got. Now a bordered "seal" card with a shield icon and a real
// CTA, so it reads as a feature being shown off, not a caption.
function ShieldCheckIcon() {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mx-auto h-14 w-14"
      aria-hidden="true"
    >
      <path d="M24 5 L39 11 L39 23 Q39 36 24 43 Q9 36 9 23 L9 11 Z" />
      <path d="M16 23 L21.5 28.5 L32 17" />
    </svg>
  )
}

export function GertLushStandardStrip() {
  return (
    <section className="border-ink-line border-b px-6 py-16 lg:px-16">
      <div className="border-comb-gold/40 bg-honeycomb-surface mx-auto flex max-w-2xl flex-col items-center gap-3 rounded-2xl border p-10 text-center">
        <div className="text-comb-gold">
          <ShieldCheckIcon />
        </div>
        <h2 className="text-porcelain mt-2 text-3xl font-bold tracking-tight">
          The Gert Lush Standard
        </h2>
        <p className="text-comb-gold text-sm font-semibold tracking-wide uppercase">
          Beekeeper reviewed &middot; Batch checked &middot; Provenance recorded
        </p>
        <p className="text-porcelain/70 max-w-xl text-base">
          We review the people, process and provenance behind our honey, then check each batch
          again before it is packed by Gert Lush.
        </p>
        <Link
          href="/gert-lush-standard"
          className="bg-honey-amber text-ink focus-visible:outline-porcelain mt-3 inline-block rounded-full px-6 py-2.5 text-sm font-semibold focus-visible:outline focus-visible:outline-offset-4"
        >
          Read the Gert Lush Standard
        </Link>
      </div>
    </section>
  )
}
