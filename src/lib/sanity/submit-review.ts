'use server'

import { revalidatePath } from 'next/cache'
import { getSanityWriteClient, isSanityWriteConfigured } from './write-client'

export type SubmitReviewResult = { ok: true } | { ok: false; error: string }

export async function submitReview(input: {
  productSlug: string
  productName: string
  reviewerName: string
  rating: number
  body: string
  // Hidden field real visitors never fill in — see ReviewForm. A filled
  // honeypot reports success without writing anything, so a bot doesn't
  // learn its submission was rejected and keep retrying.
  companyWebsite: string
}): Promise<SubmitReviewResult> {
  const reviewerName = input.reviewerName.trim()
  const body = input.body.trim()

  if (input.companyWebsite.trim() !== '') {
    return { ok: true }
  }
  if (!reviewerName) {
    return { ok: false, error: 'Enter your name.' }
  }
  if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) {
    return { ok: false, error: 'Choose a rating from 1 to 5.' }
  }
  if (body.length < 10) {
    return { ok: false, error: 'Review needs to be at least 10 characters.' }
  }
  if (body.length > 2000) {
    return { ok: false, error: 'Review is too long (2000 characters max).' }
  }
  if (!isSanityWriteConfigured()) {
    return { ok: false, error: "Reviews aren't available right now." }
  }

  try {
    await getSanityWriteClient().create({
      _type: 'productReview',
      productSlug: input.productSlug,
      productName: input.productName,
      reviewerName,
      rating: input.rating,
      body,
      submittedAt: new Date().toISOString(),
      approved: false,
    })
    revalidatePath(`/shop/${input.productSlug}`)
    return { ok: true }
  } catch (error) {
    console.error('Review submission failed:', error)
    return { ok: false, error: "Couldn't submit your review — please try again." }
  }
}
