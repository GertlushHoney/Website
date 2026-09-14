import Link from 'next/link'
import { ShieldCheckIcon } from '@/components/icons/line-icons'
import { GertLushStandardStamp } from '@/components/product/gert-lush-standard-stamp'
import { isGertLushStandardLive, standardCopy } from '@/lib/gert-lush-standard'

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
//
// Reworked again 2026-09-13 ("FINALISE THE GERT LUSH STANDARD STATUS"):
// this used to show the actual certification stamp and claim "Beekeeper
// reviewed · Batch checked" in the present tense unconditionally, while the
// Standard's own page called itself a "working draft — pending compliance
// review" — a direct public contradiction. Both now read off the same
// central flag as the per-product badge, so a visitor never sees the seal
// treated as live in one place and admittedly unfinished in another.
//
// Reworked again 2026-09-15 ("Make the Gert Lush Standard draft/live state
// fully consistent"): once live, this used to show the stamp *twice* —
// mirrored on both sides of the text card, like a heraldic crest. Honey is
// this site's actual product; the Standard supports that story, it isn't a
// second hero image competing for the same attention. One stamp, placed
// once, reads as a supporting mark; two identical stamps read as the main
// event.
export function GertLushStandardStrip() {
  const eyebrow = standardCopy(
    'Being introduced · beekeeper review · batch checks',
    'Beekeeper reviewed · Batch checked · Provenance recorded'
  )
  const body = standardCopy(
    "We're introducing a formal standard for reviewing the people, process and provenance behind our honey, and checking each batch before it's packed by Gert Lush.",
    'We review the people, process and provenance behind our honey, then check each batch again before it is packed by Gert Lush.'
  )
  const cta = standardCopy('See how it will work', 'Read the Gert Lush Standard')

  return (
    <section className="border-ink-line border-b px-6 py-16 lg:px-16">
      <div className="mx-auto flex max-w-5xl items-center justify-center gap-12">
        {isGertLushStandardLive && (
          <div className="hidden shrink-0 lg:block">
            <GertLushStandardStamp />
          </div>
        )}

        <div className="border-comb-gold/40 bg-honeycomb-surface flex max-w-2xl flex-col items-center gap-3 rounded-2xl border p-10 text-center">
          <div className="text-comb-gold">
            <ShieldCheckIcon />
          </div>
          <h2 className="text-porcelain mt-2 text-3xl font-bold tracking-tight">
            The Gert Lush Standard
          </h2>
          <p className="text-comb-gold text-sm font-semibold tracking-wide uppercase">{eyebrow}</p>
          <p className="text-porcelain/70 max-w-xl text-base">{body}</p>
          <Link
            href="/gert-lush-standard"
            className="bg-honey-amber text-ink focus-visible:outline-porcelain mt-3 inline-block rounded-full px-6 py-2.5 text-sm font-semibold focus-visible:outline focus-visible:outline-offset-4"
          >
            {cta}
          </Link>
        </div>
      </div>
    </section>
  )
}
