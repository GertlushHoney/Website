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

type JsonLdReview = {
  reviewerName: string
  rating: number
  body: string
  submittedAt: string
}

// Only ever built from reviews already approved in Studio (getApprovedReviews),
// and omitted entirely when there are none — an empty or invented rating is
// exactly what Google's structured-data rules (and this project's "no
// invented content" rule) forbid. Capped at the 5 newest reviews in the
// markup; the aggregate still counts all of them.
function reviewJsonLd(reviews: JsonLdReview[]) {
  if (reviews.length === 0) return {}
  const average = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
  return {
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: average.toFixed(1),
      reviewCount: reviews.length,
      bestRating: 5,
      worstRating: 1,
    },
    review: reviews.slice(0, 5).map((r) => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: r.reviewerName },
      datePublished: r.submittedAt.slice(0, 10),
      reviewBody: r.body,
      reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5, worstRating: 1 },
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
  reviews = [],
}: {
  name: string
  description: string
  imageUrl: string | null
  slug: string
  price: number | null
  availability?: 'InStock' | 'OutOfStock'
  reviews?: JsonLdReview[]
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description: description.trim(),
    ...(imageUrl ? { image: imageUrl } : {}),
    brand: { '@type': 'Brand', name: SITE_NAME },
    ...reviewJsonLd(reviews),
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

// A beekeeper's profile page as a Person — name, where they keep bees, a
// short description and portrait, nothing the profile doesn't already say.
export function beekeeperJsonLd({
  name,
  slug,
  description,
  area,
  imageUrl,
}: {
  name: string
  slug: string
  description: string
  area: string
  imageUrl: string | null
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    url: `${SITE_URL}/beekeepers/${slug}`,
    jobTitle: 'Beekeeper',
    description: description.trim(),
    ...(imageUrl ? { image: imageUrl } : {}),
    workLocation: { '@type': 'Place', name: area },
  }
}
