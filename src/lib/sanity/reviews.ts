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
