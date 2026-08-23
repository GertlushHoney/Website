// Renders a single JSON-LD <script> block. Server-only (no 'use client') —
// every caller passes a plain object built from real page data.
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
