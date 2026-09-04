'use server'

import { cookies } from 'next/headers'
import { shopifyFetch, isShopifyConfigured } from './client'
import {
  CART_CREATE_MUTATION,
  CART_QUERY,
  CART_LINES_ADD_MUTATION,
  CART_LINES_UPDATE_MUTATION,
  CART_LINES_REMOVE_MUTATION,
} from './queries'

const CART_ID_COOKIE = 'gl_cart_id'

export type CartLine = {
  id: string
  quantity: number
  variantId: string
  productTitle: string
  productHandle: string
  imageUrl: string | null
  price: number
  currencyCode: string
  // Present only for a real Shopify subscription line (a sellingPlanId was
  // attached when it was added) — used to label it "Monthly subscription"
  // in the basket rather than guessing from price/quantity.
  sellingPlanName: string | null
  // Custom key/value line attributes (e.g. a hamper's "Honey selection")
  // set when the item was added — shown in the basket and visible on the
  // real Shopify order, but never affects pricing or a separate product's
  // own stock on its own (see the order-paid webhook for that).
  attributes: { key: string; value: string }[]
}

export type Cart = {
  id: string
  checkoutUrl: string
  totalQuantity: number
  subtotal: number
  currencyCode: string
  lines: CartLine[]
}

type RawCart = {
  id: string
  checkoutUrl: string
  totalQuantity: number
  cost: { subtotalAmount: { amount: string; currencyCode: string } }
  lines: {
    edges: {
      node: {
        id: string
        quantity: number
        sellingPlanAllocation: {
          sellingPlan: { id: string; name: string }
          checkoutChargeAmount: { amount: string; currencyCode: string }
        } | null
        attributes: { key: string; value: string }[]
        merchandise: {
          id: string
          title: string
          product: { title: string; handle: string }
          image: { url: string; altText: string | null } | null
          price: { amount: string; currencyCode: string }
        }
      }
    }[]
  }
}

function normalizeCart(raw: RawCart): Cart {
  return {
    id: raw.id,
    checkoutUrl: raw.checkoutUrl,
    totalQuantity: raw.totalQuantity,
    subtotal: Number(raw.cost.subtotalAmount.amount),
    currencyCode: raw.cost.subtotalAmount.currencyCode,
    lines: raw.lines.edges.map(({ node }) => ({
      id: node.id,
      quantity: node.quantity,
      variantId: node.merchandise.id,
      productTitle: node.merchandise.product.title,
      productHandle: node.merchandise.product.handle,
      imageUrl: node.merchandise.image?.url ?? null,
      // A subscription line's real charge can differ from the variant's
      // plain price (Shopify applies the selling plan's own price
      // adjustment) — use checkoutChargeAmount when this line has a selling
      // plan attached, never the unadjusted variant price, or the basket
      // shows the wrong recurring amount even though the cart's own total
      // is correct.
      price: Number(
        node.sellingPlanAllocation?.checkoutChargeAmount.amount ?? node.merchandise.price.amount
      ),
      currencyCode: node.merchandise.price.currencyCode,
      sellingPlanName: node.sellingPlanAllocation?.sellingPlan.name ?? null,
      attributes: node.attributes,
    })),
  }
}

async function getCartId(): Promise<string | null> {
  const store = await cookies()
  return store.get(CART_ID_COOKIE)?.value ?? null
}

async function setCartId(cartId: string) {
  const store = await cookies()
  store.set(CART_ID_COOKIE, cartId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30, // 30 days — matches a typical Shopify cart lifetime
    path: '/',
  })
}

// Reads the current basket, if any. Never throws — an unreachable Shopify
// or an expired/invalid cart ID both just mean "no basket yet" rather than
// breaking the page that asks for it (e.g. the header, on every route).
export async function getCart(): Promise<Cart | null> {
  if (!isShopifyConfigured()) return null
  const cartId = await getCartId()
  if (!cartId) return null

  try {
    const data = await shopifyFetch<{ cart: RawCart | null }>({
      query: CART_QUERY,
      variables: { cartId },
      cache: 'no-store',
    })
    return data.cart ? normalizeCart(data.cart) : null
  } catch {
    return null
  }
}

// Adds a variant to the basket, creating one if this is the first item
// added this session. Shopify merges quantities automatically when the
// same variant is added twice, so callers don't need to check "is this
// already in the basket" themselves.
//
// Pass sellingPlanId to add it as a real recurring subscription line
// instead of a one-off — it must be a real Selling Plan id from Shopify
// (see getProductByHandle's subscriptionSellingPlanId), never invented.
//
// Pass attributes for a customer-entered choice that isn't its own Shopify
// variant (e.g. a hamper's "Honey selection") — stored on the order line
// for manual reference and read by the order-paid webhook to work out
// which honey's stock to adjust, but Shopify itself does nothing with it
// automatically.
export async function addToCart(
  variantId: string,
  quantity: number,
  sellingPlanId?: string,
  attributes?: { key: string; value: string }[]
): Promise<Cart> {
  const safeQuantity = Math.min(12, Math.max(1, Math.floor(quantity)))
  const cartId = await getCartId()
  const line = {
    merchandiseId: variantId,
    quantity: safeQuantity,
    ...(sellingPlanId ? { sellingPlanId } : {}),
    ...(attributes && attributes.length > 0 ? { attributes } : {}),
  }

  if (!cartId) {
    const data = await shopifyFetch<{
      cartCreate: { cart: RawCart | null; userErrors: { message: string }[] }
    }>({
      query: CART_CREATE_MUTATION,
      variables: { lines: [line] },
      cache: 'no-store',
    })
    const { cart, userErrors } = data.cartCreate
    if (!cart || userErrors.length > 0) {
      throw new Error(userErrors.map((e) => e.message).join('; ') || 'Could not create basket')
    }
    await setCartId(cart.id)
    return normalizeCart(cart)
  }

  const data = await shopifyFetch<{
    cartLinesAdd: { cart: RawCart | null; userErrors: { message: string }[] }
  }>({
    query: CART_LINES_ADD_MUTATION,
    variables: { cartId, lines: [line] },
    cache: 'no-store',
  })
  const { cart, userErrors } = data.cartLinesAdd
  if (!cart || userErrors.length > 0) {
    throw new Error(userErrors.map((e) => e.message).join('; ') || 'Could not add to basket')
  }
  return normalizeCart(cart)
}

export async function updateCartLine(lineId: string, quantity: number): Promise<Cart> {
  const cartId = await getCartId()
  if (!cartId) throw new Error('No basket to update')

  const safeQuantity = Math.min(12, Math.max(0, Math.floor(quantity)))
  const data = await shopifyFetch<{
    cartLinesUpdate: { cart: RawCart | null; userErrors: { message: string }[] }
  }>({
    query: CART_LINES_UPDATE_MUTATION,
    variables: { cartId, lines: [{ id: lineId, quantity: safeQuantity }] },
    cache: 'no-store',
  })
  const { cart, userErrors } = data.cartLinesUpdate
  if (!cart || userErrors.length > 0) {
    throw new Error(userErrors.map((e) => e.message).join('; ') || 'Could not update basket')
  }
  return normalizeCart(cart)
}

export async function removeCartLine(lineId: string): Promise<Cart> {
  const cartId = await getCartId()
  if (!cartId) throw new Error('No basket to update')

  const data = await shopifyFetch<{
    cartLinesRemove: { cart: RawCart | null; userErrors: { message: string }[] }
  }>({
    query: CART_LINES_REMOVE_MUTATION,
    variables: { cartId, lineIds: [lineId] },
    cache: 'no-store',
  })
  const { cart, userErrors } = data.cartLinesRemove
  if (!cart || userErrors.length > 0) {
    throw new Error(userErrors.map((e) => e.message).join('; ') || 'Could not update basket')
  }
  return normalizeCart(cart)
}
