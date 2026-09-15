import { groq } from 'next-sanity'
import { sanityFetch } from './client'

export type ProductReview = {
  _id: string
  reviewerName: string
  rating: number
  body: string
  submittedAt: string
}

// Only approved reviews — see productReview.ts, everything starts
// unapproved until someone reviews it in Studio.
export async function getApprovedReviews(productSlug: string): Promise<ProductReview[]> {
  const result = await sanityFetch<ProductReview[]>(
    groq`*[_type == "productReview" && productSlug == $productSlug && approved == true] | order(submittedAt desc) {
      _id,
      reviewerName,
      rating,
      body,
      submittedAt
    }`,
    { productSlug }
  )
  return result ?? []
}

export function averageRating(reviews: ProductReview[]): number | null {
  if (reviews.length === 0) return null
  return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
}

// The server's own proof that a review's productSlug refers to a real,
// active Gert Lush product — a honeyProduct or merchProduct sharing the
// /shop/[slug] URL space (same "try honey first, then merch" order as
// /shop/[slug]/page.tsx), never the client's say-so. Used by
// submit-review.ts so a review can't be attributed to a fictional or
// retired product; also the trusted source for productReview.productName,
// which is a point-in-time snapshot, not something the client should be
// trusted to supply. Returns null if no active product matches either
// type, which submitReview treats as a hard rejection.
export async function getActiveProductName(slug: string): Promise<string | null> {
  const honeyName = await sanityFetch<string>(
    groq`*[_type == "honeyProduct" && slug.current == $slug && active == true][0].name`,
    { slug }
  )
  if (honeyName) return honeyName

  const merchName = await sanityFetch<string>(
    groq`*[_type == "merchProduct" && slug.current == $slug && active == true][0].name`,
    { slug }
  )
  return merchName ?? null
}

// Fetches approved reviews for every slug in one Sanity query instead of
// one query per product — a category listing page (honey or merch) used
// to call getApprovedReviews once per product via Promise.all, which is
// fine at 2-3 products but is Θ(N) Sanity requests on every render as N
// grows toward the 20-50 honeys this build is meant to handle. See
// "REVIEW PERFORMANCE AS PRODUCT COUNT GROWS" audit, 2026-09-13.
// Always returns an entry for every slug passed in (an empty array if that
// product has no approved reviews), so callers can index straight in
// without an `?? []` at every call site.
export async function getApprovedReviewsForSlugs(
  productSlugs: string[]
): Promise<Record<string, ProductReview[]>> {
  const grouped: Record<string, ProductReview[]> = Object.fromEntries(
    productSlugs.map((slug) => [slug, []])
  )
  if (productSlugs.length === 0) return grouped

  const result = await sanityFetch<(ProductReview & { productSlug: string })[]>(
    groq`*[_type == "productReview" && productSlug in $slugs && approved == true] | order(submittedAt desc) {
      _id,
      productSlug,
      reviewerName,
      rating,
      body,
      submittedAt
    }`,
    { slugs: productSlugs }
  )

  for (const review of result ?? []) {
    grouped[review.productSlug]?.push(review)
  }
  return grouped
}
