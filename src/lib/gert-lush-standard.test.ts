import { describe, expect, it } from 'vitest'
import { canShowGertLushStandardBadge, isGertLushStandardLive, standardCopy } from './gert-lush-standard'

// GERT_LUSH_STANDARD_STATUS is a hardcoded module constant (currently
// 'draft'), not something flippable at runtime — flipping it is a genuine
// business decision (does the real supplier-review/batch-check process
// actually run yet?), not something a test should force. These tests lock
// in the real, current behaviour of every page reading this flag today.
//
// The "what happens once it's live" behaviour — does the badge appear
// exactly once instead of twice, does the copy switch to present tense —
// is covered separately, by mocking this module in the *consuming*
// component's own tests (see gert-lush-standard-strip.test.tsx), since
// that's what actually exercises the real bugs this fix addresses.
describe('gert-lush-standard (current real state)', () => {
  it('is currently draft, not live', () => {
    expect(isGertLushStandardLive).toBe(false)
  })

  it('standardCopy currently returns the draft variant', () => {
    expect(standardCopy('will require', 'requires')).toBe('will require')
  })

  it('canShowGertLushStandardBadge is false today regardless of the per-product field, since the Standard itself is still draft', () => {
    expect(canShowGertLushStandardBadge(true)).toBe(false)
    expect(canShowGertLushStandardBadge(false)).toBe(false)
    expect(canShowGertLushStandardBadge(null)).toBe(false)
    expect(canShowGertLushStandardBadge(undefined)).toBe(false)
  })
})
