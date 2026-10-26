import { getHoneyProductsWithBeekeeper } from '@/lib/sanity/products'
import { getAreaNameForCode } from '@/lib/postcode-areas'
import { FREE_DELIVERY_THRESHOLD_GBP } from '@/lib/delivery'
import { SITE_URL } from '@/lib/site-config'
import { buildLlmsTxt } from '@/lib/seo/llms-txt'

// Served at /llms.txt — see src/lib/seo/llms-txt.ts for what it is and why.
export const revalidate = 3600

export async function GET() {
  const products = await getHoneyProductsWithBeekeeper()
  const body = buildLlmsTxt({
    siteUrl: SITE_URL,
    freeDeliveryThresholdGbp: FREE_DELIVERY_THRESHOLD_GBP,
    honeys: products.map((p) => ({
      name: p.name,
      slug: p.slug,
      tagline: p.tagline,
      postcodeCode: p.postcodeCode,
      areaName: getAreaNameForCode(p.postcodeCode) ?? null,
      beekeeperName: p.beekeeper?.name ?? null,
    })),
  })
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
