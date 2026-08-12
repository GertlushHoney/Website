'use server'

import { shopifyFetch, isShopifyConfigured, ShopifyError } from './client'
import { CUSTOMER_CREATE_MUTATION } from './queries'

export type NewsletterSignupResult = { ok: true } | { ok: false; error: string }

// Shopify's Storefront API customerCreate mutation always requires a
// password, even though we only want an email-marketing subscriber, not a
// login-capable account — a real quirk of the API, not a design choice.
// We generate a random one the customer never sees or needs; if they ever
// land on a real Shopify "forgot password" flow it just resets to
// something new, which is harmless. Shopify caps passwords at 40
// characters, so a single UUID (36 chars) fits — two concatenated (72)
// gets rejected with a TOO_LONG error, confirmed against the real store.
function randomPassword(): string {
  return crypto.randomUUID()
}

// Subscribes an email to Shopify's own customer marketing list
// (acceptsMarketing: true) — the same list Shopify Email sends to, no
// third-party service involved. Never throws: a missing scope, an
// unreachable Shopify, or Shopify rejecting the request all just return a
// friendly ok:false so the signup form can show a plain message instead of
// crashing.
export async function subscribeToNewsletter(email: string): Promise<NewsletterSignupResult> {
  const trimmed = email.trim()
  if (!trimmed || !trimmed.includes('@')) {
    return { ok: false, error: 'Enter a valid email address.' }
  }
  if (!isShopifyConfigured()) {
    return { ok: false, error: "Sign-up isn't available right now." }
  }

  try {
    const data = await shopifyFetch<{
      customerCreate: {
        customer: { id: string } | null
        customerUserErrors: { field: string[] | null; message: string; code: string }[]
      }
    }>({
      query: CUSTOMER_CREATE_MUTATION,
      variables: {
        input: { email: trimmed, password: randomPassword(), acceptsMarketing: true },
      },
      cache: 'no-store',
    })

    const { customer, customerUserErrors } = data.customerCreate
    if (customer) return { ok: true }

    // Signing up twice isn't an error from the customer's point of view —
    // Shopify's real code for "this email already has an account" is TAKEN.
    if (customerUserErrors.some((e) => e.code === 'TAKEN')) {
      return { ok: true }
    }

    return {
      ok: false,
      error: customerUserErrors[0]?.message || "Couldn't sign you up — please try again.",
    }
  } catch (error) {
    if (error instanceof ShopifyError) {
      console.error('Newsletter signup failed:', error.message)
    }
    return { ok: false, error: "Couldn't sign you up — please try again." }
  }
}
