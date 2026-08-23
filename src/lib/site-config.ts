import { env } from '@/lib/env'

// Single source of truth for the canonical site origin — used by
// metadataBase, sitemap.ts, robots.ts and every JSON-LD block, so there's
// one fallback to update rather than several copies drifting apart.
// Falls back to the real production domain rather than a placeholder, since
// NEXT_PUBLIC_SITE_URL is only unset in local/mocked-data dev.
export const SITE_URL = env.NEXT_PUBLIC_SITE_URL ?? 'https://www.gertlushhoney.co.uk'

export const SITE_NAME = 'Gert Lush Honey'
