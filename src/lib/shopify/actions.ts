'use server'

import { shopifyFetch } from './client'
import { CART_CREATE_MUTATION } from './queries'

type CartCreateResponse = {
  cartCreate: {
    cart: { id: string; checkoutUrl: string } | null
    userErrors: { field: string[]; message: string }[]
  }
}

// Creates a real Shopify cart for one line item and returns its checkout
// URL — no payment details ever pass through this app. Returns a result
// object rather than calling next/navigation's redirect() itself: the
// destination is Shopify's own hosted checkout, an external domain, so the
// client does a plain full-page navigation to it (see PurchaseOptions)
// rather than this action trying to drive Next's router. variantId/quantity
// come from the client, but both are re-read against Shopify's own
// catalogue by the mutation itself, so there's nothing here a caller could
// tamper with beyond "which real product, how many" (see Next.js Server
// Actions security guidance).
export async function checkoutWithVariant(
  variantId: string,
  quantity: number
): Promise<{ checkoutUrl: string }> {
  const safeQuantity = Math.min(12, Math.max(1, Math.floor(quantity)))

  const data = await shopifyFetch<CartCreateResponse>({
    query: CART_CREATE_MUTATION,
    variables: {
      lines: [{ merchandiseId: variantId, quantity: safeQuantity }],
    },
  })

  const { cart, userErrors } = data.cartCreate
  if (!cart || userErrors.length > 0) {
    throw new Error(userErrors.map((e) => e.message).join('; ') || 'Could not start checkout')
  }

  return { checkoutUrl: cart.checkoutUrl }
}
