import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NewsletterPopup } from './newsletter-popup'
import type { NewsletterPopupContent } from '@/lib/sanity/newsletter-popup'

// This project's vitest config doesn't set `globals: true`, so
// @testing-library/react's automatic afterEach cleanup never registers.
afterEach(cleanup)

vi.mock('@/lib/shopify/customer', () => ({
  subscribeToNewsletter: vi.fn(),
}))

const content: NewsletterPopupContent = {
  enabled: true,
  heading: 'Join the Gert Lush hive',
  body: 'Hear about new postcode honey as soon as it is ready.',
  discountCode: null,
  discountLabel: null,
  buttonLabel: 'Join the hive',
  delaySeconds: 25,
}

// See "REDUCE NEWSLETTER POPUP AGGRESSION" audit, 2026-09-13 — the popup
// used to show after a flat ~6 seconds every session, with no durable
// memory of a dismissal. This locks in: the new, much longer delay;
// exit-intent showing it sooner on desktop only; and localStorage (not
// sessionStorage) remembering it's been shown at all, across reloads.
describe('NewsletterPopup', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
    // (pointer: fine) — simulates a desktop mouse by default; individual
    // tests override this via vi.stubGlobal where a touch device matters.
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query.includes('pointer: fine'),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('does not show before delaySeconds has elapsed', () => {
    render(<NewsletterPopup content={content} />)
    act(() => {
      vi.advanceTimersByTime(24_000)
    })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shows once delaySeconds has elapsed, and records it in localStorage', () => {
    render(<NewsletterPopup content={content} />)
    act(() => {
      vi.advanceTimersByTime(25_000)
    })
    expect(screen.getByRole('dialog', { name: content.heading })).toBeInTheDocument()
    expect(localStorage.getItem('gert-lush-newsletter-popup-seen')).toBe('1')
  })

  it('shows immediately on desktop exit-intent, well before the delay elapses', () => {
    render(<NewsletterPopup content={content} />)
    act(() => {
      vi.advanceTimersByTime(2_000) // barely any dwell time yet
    })
    act(() => {
      document.dispatchEvent(new MouseEvent('mouseout', { clientY: -5, bubbles: true }))
    })
    expect(screen.getByRole('dialog', { name: content.heading })).toBeInTheDocument()
  })

  it('ignores mouseout that is not a real exit toward the top of the viewport', () => {
    render(<NewsletterPopup content={content} />)
    act(() => {
      vi.advanceTimersByTime(2_000)
    })
    act(() => {
      document.dispatchEvent(new MouseEvent('mouseout', { clientY: 400, bubbles: true }))
    })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('never shows at all once the localStorage flag is already set (a returning visitor)', () => {
    localStorage.setItem('gert-lush-newsletter-popup-seen', '1')
    render(<NewsletterPopup content={content} />)
    act(() => {
      vi.advanceTimersByTime(120_000)
    })
    act(() => {
      document.dispatchEvent(new MouseEvent('mouseout', { clientY: -5, bubbles: true }))
    })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('does not use exit-intent on a touch-only device (no fine pointer)', () => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: false, // no device matches (pointer: fine)
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
    render(<NewsletterPopup content={content} />)
    act(() => {
      document.dispatchEvent(new MouseEvent('mouseout', { clientY: -5, bubbles: true }))
    })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    // The time-based delay still applies on mobile — just no early trigger.
    act(() => {
      vi.advanceTimersByTime(25_000)
    })
    expect(screen.getByRole('dialog', { name: content.heading })).toBeInTheDocument()
  })
})
