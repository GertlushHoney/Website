// Single source of truth for whether the Gert Lush Standard is publicly
// live yet. Every page that touches it — the homepage strip, the
// dedicated /gert-lush-standard page, the FAQ, and the per-product
// certification badge — reads this one flag rather than deciding for
// itself. Before this existed, the Standard page said "working draft —
// pending compliance review" while the homepage strip displayed the real
// certification stamp and claimed "Beekeeper reviewed · Batch checked" in
// the present tense — a direct, publicly-visible contradiction. See
// "FINALISE THE GERT LUSH STANDARD STATUS" audit, 2026-09-13.
//
// Flip this to 'live' only once the real supplier-review and batch-check
// procedures described on /gert-lush-standard are genuinely happening in
// practice — not before (that page's own sourced copy says the same).
// Switching this does NOT retroactively mark any product as meeting the
// standard: that stays a per-product/batch decision made by hand in
// Sanity Studio (honeyProduct.meetsGertLushStandard, defaults to false),
// exactly as today. This flag only controls whether that field is allowed
// to show a badge at all, not who gets one.
export type GertLushStandardStatus = 'draft' | 'live'

// `as` rather than a `: GertLushStandardStatus` annotation — with a plain
// annotation, TypeScript still narrows this binding to the literal 'draft'
// for control-flow purposes in this file, which makes the comparison below
// a compile error ("no overlap") the moment someone actually flips it back
// to 'draft' after trying 'live'. The cast keeps the widened union type.
export const GERT_LUSH_STANDARD_STATUS = 'draft' as GertLushStandardStatus

export const isGertLushStandardLive = GERT_LUSH_STANDARD_STATUS === 'live'
