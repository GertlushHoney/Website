import { env } from '@/lib/env'

const FALLBACK_SITE_URL = 'https://www.gertlushhoney.co.uk'

// Single source of truth for the canonical site origin — used by
// metadataBase, sitemap.ts, robots.ts and every JSON-LD block, so there's
// one fallback to update rather than several copies drifting apart.
// Falls back to the real production domain rather than a placeholder, since
// NEXT_PUBLIC_SITE_URL is only unset in local/mocked-data dev.
//
// Validated with a real URL parse rather than trusted as-is: a typo made
// directly in Vercel's env var settings (missing the https:// scheme, stray
// whitespace) must fall back safely here rather than crash `new URL(...)`
// wherever this constant gets consumed (metadataBase in particular).
// Also rejects a value that parses but is plainly wrong. The address pasted
// twice in Vercel ("https://www.example.co.ukhttps://www.example.co.uk") is a
// valid URL to the parser, whose origin becomes "https://www.example.co.ukhttps"
// — and that went out in every canonical link, the sitemap and robots.txt.
export function resolveSiteUrlFrom(value: string | undefined): string {
  if (!value) return FALLBACK_SITE_URL
  try {
    const url = new URL(value)
    const plausibleHost =
      /^[a-z0-9-]+(\.[a-z0-9-]+)*(:\d+)?$/i.test(url.host) && !/https?/i.test(url.hostname)
    return plausibleHost ? url.origin : FALLBACK_SITE_URL
  } catch {
    return FALLBACK_SITE_URL
  }
}

function resolveSiteUrl(): string {
  return resolveSiteUrlFrom(env.NEXT_PUBLIC_SITE_URL)
}

export const SITE_URL = resolveSiteUrl()

export const SITE_NAME = 'Gert Lush Honey'
