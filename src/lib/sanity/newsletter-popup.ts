import { groq } from 'next-sanity'
import { sanityFetch } from './client'

export type NewsletterPopupContent = {
  enabled: boolean
  heading: string
  body: string
  discountCode: string | null
  discountLabel: string | null
  buttonLabel: string
  delaySeconds: number
}

// Sensible copy so the popup still works before anyone's created the
// Sanity document — same "never break the page" pattern as every other
// Sanity-backed fetch in this codebase. No discount mentioned by default,
// since no real code exists until one is set up in Shopify and entered in
// Sanity.
//
// delaySeconds default was 6 — interrupting visitors before they'd even
// finished reading the splash screen. 25s is a genuine "you've been
// looking around for a bit" delay, matched to the schema's own enforced
// 15-120s range (src/sanity/schemaTypes/newsletterPopup.ts) so an editor
// can't accidentally dial this back into aggressive territory. See
// "REDUCE NEWSLETTER POPUP AGGRESSION" audit, 2026-09-13.
const DEFAULTS: NewsletterPopupContent = {
  enabled: true,
  heading: 'Join the Gert Lush hive',
  body: "Hear about new postcode honey as soon as it's ready — nothing else.",
  discountCode: null,
  discountLabel: null,
  buttonLabel: 'Join the hive',
  delaySeconds: 25,
}

export async function getNewsletterPopup(): Promise<NewsletterPopupContent> {
  const result = await sanityFetch<Partial<NewsletterPopupContent>>(
    groq`*[_type == "newsletterPopup"][0]{
      enabled,
      heading,
      body,
      discountCode,
      discountLabel,
      buttonLabel,
      delaySeconds
    }`
  )
  if (!result) return DEFAULTS
  return {
    enabled: result.enabled ?? DEFAULTS.enabled,
    heading: result.heading || DEFAULTS.heading,
    body: result.body || DEFAULTS.body,
    discountCode: result.discountCode || null,
    discountLabel: result.discountLabel || null,
    buttonLabel: result.buttonLabel || DEFAULTS.buttonLabel,
    delaySeconds: result.delaySeconds ?? DEFAULTS.delaySeconds,
  }
}
