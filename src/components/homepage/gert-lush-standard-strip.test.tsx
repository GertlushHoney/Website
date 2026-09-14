import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// This project's vitest config doesn't set `globals: true`, so
// @testing-library/react's automatic afterEach cleanup never registers.
afterEach(cleanup)

// The real GERT_LUSH_STANDARD_STATUS constant can't be flipped at runtime
// (see gert-lush-standard.test.ts) — this is the only way to exercise the
// strip's actual *live* rendering path, which is where "Make the Gert Lush
// Standard draft/live state fully consistent" (2026-09-15) fixed a real
// bug: it used to render the certification stamp twice, mirrored on both
// sides of the text card. `isGertLushStandardLive`/`standardCopy` are
// mocked directly (not via importOriginal + spread) because a spread
// wouldn't change what the *real* standardCopy closes over internally —
// only replacing it outright changes what this component actually calls.
function mockStandard(isLive: boolean) {
  vi.doMock('@/lib/gert-lush-standard', () => ({
    isGertLushStandardLive: isLive,
    standardCopy: <T,>(whileDraft: T, onceLive: T) => (isLive ? onceLive : whileDraft),
  }))
}

describe('GertLushStandardStrip', () => {
  beforeEach(() => {
    vi.resetModules()
  })
  afterEach(() => {
    vi.doUnmock('@/lib/gert-lush-standard')
  })

  it('while draft: uses future/conditional copy and shows no certification stamp at all', async () => {
    mockStandard(false)
    const { GertLushStandardStrip } = await import('./gert-lush-standard-strip')
    render(<GertLushStandardStrip />)

    expect(screen.getByText(/being introduced/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /see how it will work/i })).toBeInTheDocument()
    // No stamp at all — not "Meets the Gert Lush Standard" present tense.
    expect(screen.queryAllByTitle('Meets the Gert Lush Standard')).toHaveLength(0)
  })

  it('once live: switches to present-tense copy and shows exactly one certification stamp, not two', async () => {
    mockStandard(true)
    const { GertLushStandardStrip } = await import('./gert-lush-standard-strip')
    render(<GertLushStandardStrip />)

    expect(screen.getByText(/beekeeper reviewed/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /read the gert lush standard/i })).toBeInTheDocument()
    // The bug this fixes: it used to render two, mirrored either side of
    // the card. Exactly one now — a supporting mark, not a matched pair.
    expect(screen.queryAllByTitle('Meets the Gert Lush Standard')).toHaveLength(1)
  })
})
