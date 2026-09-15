import { headers } from 'next/headers'

// Renders a single JSON-LD <script> block. Server-only (no 'use client') —
// every caller passes a plain object built from real page data. Carries the
// same per-request nonce middleware.ts put on the Content-Security-Policy
// header (via the x-nonce request header it forwards) — without this, the
// script-src CSP added in "ADD SECURITY HEADER POLICY" (2026-09-15) would
// silently strip every JSON-LD block in production.
export async function JsonLd({ data }: { data: object }) {
  const nonce = (await headers()).get('x-nonce') ?? undefined
  return (
    <script
      type="application/ld+json"
      nonce={nonce}
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
