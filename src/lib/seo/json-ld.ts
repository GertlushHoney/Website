import { SITE_URL, SITE_NAME } from '@/lib/site-config'

type BreadcrumbItem = { name: string; path: string }

export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  }
}

// `price`/`availability` are omitted entirely (no `offers` block at all)
// when there's no real Shopify product behind the page yet — an absent
// offer is honest; an invented one isn't, per this project's "no invented
// content" rule (see docs/technical-architecture.md).
export function productJsonLd({
  name,
  description,
  imageUrl,
  slug,
  price,
  availability,
}: {
  name: string
  description: string
  imageUrl: string | null
  slug: string
  price: number | null
  availability?: 'InStock' | 'OutOfStock'
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description: description.trim(),
    ...(imageUrl ? { image: imageUrl } : {}),
    brand: { '@type': 'Brand', name: SITE_NAME },
    ...(price !== null
      ? {
          offers: {
            '@type': 'Offer',
            url: `${SITE_URL}/shop/${slug}`,
            priceCurrency: 'GBP',
            price: price.toFixed(2),
            availability: `https://schema.org/${availability ?? 'InStock'}`,
          },
        }
      : {}),
  }
}
