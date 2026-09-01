import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site-config'
import { getHoneyProducts } from '@/lib/sanity/products'
import { getAllMerchProducts } from '@/lib/sanity/merch'
import { getBeekeepers } from '@/lib/sanity/beekeepers'

// Static routes only — every real page.tsx under src/app/(site) that isn't a
// dynamic [slug] route and isn't /thank-you (a post-purchase page with no
// standalone reason to be a search landing page, so deliberately excluded).
const staticRoutes: { path: string; priority: number }[] = [
  { path: '', priority: 1 },
  { path: '/shop', priority: 0.9 },
  { path: '/shop/honey', priority: 0.8 },
  { path: '/shop/candles', priority: 0.6 },
  { path: '/shop/soap', priority: 0.6 },
  { path: '/shop/lip-balm', priority: 0.6 },
  { path: '/shop/hamper', priority: 0.6 },
  { path: '/shop/experiences', priority: 0.6 },
  { path: '/postcode-honey', priority: 0.8 },
  { path: '/gert-lush-standard', priority: 0.6 },
  { path: '/beekeepers', priority: 0.7 },
  { path: '/our-story', priority: 0.6 },
  { path: '/stockists', priority: 0.5 },
  { path: '/become-a-supplier', priority: 0.5 },
  { path: '/becoming-a-beekeeper', priority: 0.4 },
  { path: '/sustainability', priority: 0.4 },
  { path: '/asian-hornets', priority: 0.4 },
  { path: '/information', priority: 0.4 },
  { path: '/faqs', priority: 0.5 },
  { path: '/contact', priority: 0.4 },
  { path: '/delivery', priority: 0.4 },
  { path: '/legal/privacy', priority: 0.2 },
  { path: '/legal/terms', priority: 0.2 },
  { path: '/legal/refund-policy', priority: 0.2 },
  { path: '/legal/cookies', priority: 0.2 },
  { path: '/legal/accessibility', priority: 0.2 },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [honeyProducts, merchProducts, beekeepers] = await Promise.all([
    getHoneyProducts(),
    getAllMerchProducts(),
    getBeekeepers(),
  ])

  const now = new Date()

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map(({ path, priority }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    priority,
  }))

  // Honey and merch products share one URL space (/shop/[slug]) — see
  // src/app/(site)/shop/[slug]/page.tsx.
  const productEntries: MetadataRoute.Sitemap = [...honeyProducts, ...merchProducts].map(
    (product) => ({
      url: `${SITE_URL}/shop/${product.slug}`,
      lastModified: now,
      priority: 0.7,
    })
  )

  const beekeeperEntries: MetadataRoute.Sitemap = beekeepers.map((beekeeper) => ({
    url: `${SITE_URL}/beekeepers/${beekeeper.slug}`,
    lastModified: now,
    priority: 0.5,
  }))

  return [...staticEntries, ...productEntries, ...beekeeperEntries]
}
