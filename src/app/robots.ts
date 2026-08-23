import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site-config'

// /studio (Sanity Studio CMS) and /tools (internal image-prep helper) are
// real working pages, not content for search results — keep both out of the
// index even though they're already behind the Studio password gate
// (see src/middleware.ts) for defence in depth. /api is server plumbing,
// never a page a search result should link to.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/studio', '/tools', '/api'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
