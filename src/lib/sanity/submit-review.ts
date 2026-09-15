'use server'

import { revalidatePath } from 'next/cache'
import { getSanityWriteClient, isSanityWriteConfigured } from './write-client'
import { getActiveProductName } from './reviews'
import { getClientIp, isRateLimited } from '@/lib/rate-limit'

// Sensible, generous caps — a real name or slug never gets close to these,
// so hitting the limit only ever means someone is sending something that
// isn't a name or a slug.
const REVIEWER_NAME_MAX_LENGTH = 100
const PRODUCT_SLUG_MAX_LENGTH = 200

// IP only — this form never collects an email address, so there's no
// second identity to key a "per-email" limit on. 5 real reviews from one
// IP in 10 minutes is already generous (shared IPs — offices, cafes,
// carrier NAT — mean this can't be tightened much further without risking
// real customers), while a script hammering the action directly hits this
// within its first handful of calls. See "ADD PUBLIC FORM RATE LIMITING"
// audit, 2026-09-15.
const REVIEW_IP_WINDOW_MS = 10 * 60 * 1000
const REVIEW_IP_MAX = 5

export type SubmitReviewResult = { ok: true } | { ok: false; error: string }

export async function submitReview(input: {
  productSlug: string
  reviewerName: string
  rating: number
  body: string
  // Hidden field real visitors never fill in — see ReviewForm. A filled
  // honeypot reports success without writing anything, so a bot doesn't
  // learn its submission was rejected and keep retrying.
  companyWebsite: string
}): Promise<SubmitReviewResult> {
  const productSlug = input.productSlug.trim()
  const reviewerName = input.reviewerName.trim()
  const body = input.body.trim()

  // Checked before the honeypot, not after — a script calling this action
  // directly (never rendering ReviewForm, never touching the hidden field)
  // skips the honeypot entirely, so counting every real invocation here is
  // what actually catches it.
  if (
    await isRateLimited([
      {
        action: 'review-ip',
        identifier: await getClientIp(),
        windowMs: REVIEW_IP_WINDOW_MS,
        max: REVIEW_IP_MAX,
      },
    ])
  ) {
    return { ok: false, error: 'Too many reviews submitted — please try again later.' }
  }

  if (input.companyWebsite.trim() !== '') {
    return { ok: true }
  }
  if (!reviewerName) {
    return { ok: false, error: 'Enter your name.' }
  }
  if (reviewerName.length > REVIEWER_NAME_MAX_LENGTH) {
    return { ok: false, error: `Name is too long (${REVIEWER_NAME_MAX_LENGTH} characters max).` }
  }
  if (!productSlug || productSlug.length > PRODUCT_SLUG_MAX_LENGTH) {
    return { ok: false, error: "Couldn't find that product." }
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

  // The server's own proof this is a real, active product — never trust
  // productName (or that productSlug even refers to anything real) from
  // the client. See "SECURE REVIEW SUBMISSION" audit, 2026-09-15: a
  // client that called this Server Action directly, bypassing ReviewForm
  // entirely, could otherwise create review records for a product that
  // doesn't exist at all.
  const productName = await getActiveProductName(productSlug)
  if (!productName) {
    return { ok: false, error: "Couldn't find that product." }
  }

  try {
    await getSanityWriteClient().create({
      _type: 'productReview',
      productSlug,
      productName,
      reviewerName,
      rating: input.rating,
      body,
      submittedAt: new Date().toISOString(),
      approved: false,
    })
    revalidatePath(`/shop/${productSlug}`)
    return { ok: true }
  } catch (error) {
    console.error('Review submission failed:', error)
    return { ok: false, error: "Couldn't submit your review — please try again." }
  }
}
