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
function resolveSiteUrl(): string {
  if (!env.NEXT_PUBLIC_SITE_URL) return FALLBACK_SITE_URL
  try {
    return new URL(env.NEXT_PUBLIC_SITE_URL).origin
  } catch {
    return FALLBACK_SITE_URL
  }
}

export const SITE_URL = resolveSiteUrl()

export const SITE_NAME = 'Gert Lush Honey'
