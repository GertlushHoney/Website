'use client'

import { useState } from 'react'
import Link from 'next/link'

// Persistent floating control, matching the ico.org.uk pattern (a small
// always-available "Cookie options" button, not a one-time dismiss banner).
// No blocking consent banner on load — the site currently sets no
// non-essential cookies at all, so there's nothing that legally requires
// prior consent. The analytics toggle is a stub for when that changes; see
// /legal/cookies.
export function CookiePreferences() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Cookie options"
        className="bg-ink-surface border-ink-line text-porcelain hover:border-honey-amber focus-visible:outline-honey-amber fixed right-4 bottom-4 z-40 flex h-11 w-11 items-center justify-center rounded-full border shadow-lg focus-visible:outline focus-visible:outline-offset-2"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Cookie preferences"
          className="border-ink-line bg-ink-surface text-porcelain fixed right-4 bottom-20 z-40 w-[calc(100vw-2rem)] max-w-sm rounded-xl border p-5 shadow-2xl"
        >
          <p className="font-semibold">Cookie options</p>
          <p className="text-porcelain/60 mt-1 text-sm">
            We don&apos;t currently use tracking or analytics cookies — there&apos;s nothing to opt
            in to yet.
          </p>

          <div className="mt-4 space-y-3">
            <label className="flex items-start justify-between gap-3 text-sm">
              <span>
                <span className="block font-medium">Essential</span>
                <span className="text-porcelain/50">Keeps the site working. Always on.</span>
              </span>
              <input type="checkbox" checked disabled className="accent-honey-amber mt-1" />
            </label>
            <label className="flex items-start justify-between gap-3 text-sm">
              <span>
                <span className="block font-medium">Analytics</span>
                <span className="text-porcelain/50">Not currently used.</span>
              </span>
              <input type="checkbox" disabled className="accent-honey-amber mt-1" />
            </label>
          </div>

          <div className="mt-5 flex items-center justify-between">
            <Link
              href="/legal/cookies"
              className="text-comb-gold text-sm underline underline-offset-2"
              onClick={() => setOpen(false)}
            >
              Full cookie policy
            </Link>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="bg-honey-amber text-ink focus-visible:outline-porcelain rounded-full px-4 py-1.5 text-sm font-semibold focus-visible:outline focus-visible:outline-offset-2"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  )
}
