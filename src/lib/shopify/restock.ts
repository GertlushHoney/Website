'use server'

import {
  shopifyAdminFetch,
  isShopifyAdminConfigured,
  ShopifyAdminError,
  quoteShopifySearchValue,
} from './admin-client'
import { getClientIp, isRateLimited } from '@/lib/rate-limit'
import { getActiveProductNameByShopifyHandle } from '@/lib/sanity/active-product-lookup'

export type RestockAlertResult = { ok: true } | { ok: false; error: string }

// A real Shopify handle is short and never comes close to this — hitting
// it only ever means someone is sending something that isn't a handle.
const PRODUCT_HANDLE_MAX_LENGTH = 200

// See "ADD PUBLIC FORM RATE LIMITING" audit, 2026-09-15 — each call here
// is a real Shopify Admin API customer lookup plus a create-or-tag
// mutation, so unlimited direct calls are both API load and admin-side
// noise (a flood of tagged customers to sift through). The IP cap is
// higher than the newsletter form's — a genuine customer might reasonably
// sign up for restock alerts on several different products in one visit.
const RESTOCK_IP_WINDOW_MS = 10 * 60 * 1000
const RESTOCK_IP_MAX = 10
const RESTOCK_EMAIL_WINDOW_MS = 60 * 60 * 1000
const RESTOCK_EMAIL_MAX = 5

// Tags the Shopify customer with restock:<product-handle> so a store owner
// can find everyone waiting for a specific product when it comes back — the
// actual "notify them" step is a manual email the store owner sends, not
// automated by this code. See docs/launch-checklist.md point 10.
//
// emailMarketingConsent is deliberately NOT_SUBSCRIBED (changed 2026-08-23,
// independent review): a customer here only asked to be told about one
// specific product's restock, not to join general marketing — recording
// SUBSCRIBED would misrepresent that consent. The consequence is Shopify
// Email's own marketing-campaign tool won't deliver to these contacts (it
// requires marketing consent); see the launch checklist for the manual
// alternative that doesn't need it.
function restockTag(productHandle: string): string {
  return `restock:${productHandle}`
}

async function findCustomerIdByEmail(email: string): Promise<string | null> {
  const data = await shopifyAdminFetch<{
    customers: { edges: { node: { id: string } }[] }
  }>({
    query: /* GraphQL */ `
      query FindCustomer($query: String!) {
        customers(first: 1, query: $query) {
          edges {
            node {
              id
            }
          }
        }
      }
    `,
    variables: { query: `email:${quoteShopifySearchValue(email)}` },
  })
  return data.customers.edges[0]?.node.id ?? null
}

export async function subscribeToRestockAlert(
  email: string,
  productHandle: string
): Promise<RestockAlertResult> {
  const trimmed = email.trim()
  const handle = productHandle.trim()
  if (!trimmed || !trimmed.includes('@')) {
    return { ok: false, error: 'Enter a valid email address.' }
  }
  if (!handle || handle.length > PRODUCT_HANDLE_MAX_LENGTH) {
    return { ok: false, error: "Couldn't find that product." }
  }
  if (!isShopifyAdminConfigured()) {
    return { ok: false, error: "Restock alerts aren't available right now." }
  }
  if (
    await isRateLimited([
      {
        action: 'restock-ip',
        identifier: await getClientIp(),
        windowMs: RESTOCK_IP_WINDOW_MS,
        max: RESTOCK_IP_MAX,
      },
      {
        action: 'restock-email',
        identifier: trimmed.toLowerCase(),
        windowMs: RESTOCK_EMAIL_WINDOW_MS,
        max: RESTOCK_EMAIL_MAX,
      },
    ])
  ) {
    return { ok: false, error: 'Too many attempts — please try again later.' }
  }

  // The server's own proof this handle belongs to a real, active Gert
  // Lush product — never trust productName (or that productHandle even
  // refers to anything real) from the client. See "SECURE RESTOCK ALERT
  // SUBMISSION" audit, 2026-09-15: a client that called this Server
  // Action directly, bypassing RestockAlertForm entirely, could otherwise
  // tag a customer with restock:<anything>, regardless of whether Gert
  // Lush sells it.
  const productName = await getActiveProductNameByShopifyHandle(handle)
  if (!productName) {
    return { ok: false, error: "Couldn't find that product." }
  }

  const tag = restockTag(handle)

  try {
    const existingId = await findCustomerIdByEmail(trimmed)

    if (existingId) {
      const data = await shopifyAdminFetch<{
        tagsAdd: { userErrors: { field: string[] | null; message: string }[] }
      }>({
        query: /* GraphQL */ `
          mutation TagsAdd($id: ID!, $tags: [String!]!) {
            tagsAdd(id: $id, tags: $tags) {
              userErrors {
                field
                message
              }
            }
          }
        `,
        variables: { id: existingId, tags: [tag] },
      })
      const errors = data.tagsAdd.userErrors
      if (errors.length > 0) {
        return { ok: false, error: errors[0].message }
      }
      return { ok: true }
    }

    const data = await shopifyAdminFetch<{
      customerCreate: {
        customer: { id: string } | null
        userErrors: { field: string[] | null; message: string }[]
      }
    }>({
      query: /* GraphQL */ `
        mutation CustomerCreate($input: CustomerInput!) {
          customerCreate(input: $input) {
            customer {
              id
            }
            userErrors {
              field
              message
            }
          }
        }
      `,
      variables: {
        input: {
          email: trimmed,
          tags: [tag],
          emailMarketingConsent: {
            marketingState: 'NOT_SUBSCRIBED',
            marketingOptInLevel: 'SINGLE_OPT_IN',
          },
        },
      },
    })

    const { customer, userErrors } = data.customerCreate
    if (customer) return { ok: true }

    const alreadyExists = userErrors.some((e) => /taken|already/i.test(e.message))
    if (alreadyExists) {
      // Rare race: created between our lookup and this call — retry once
      // as an update instead of surfacing an avoidable error.
      const retryId = await findCustomerIdByEmail(trimmed)
      if (retryId) {
        await shopifyAdminFetch({
          query: /* GraphQL */ `
            mutation TagsAdd($id: ID!, $tags: [String!]!) {
              tagsAdd(id: $id, tags: $tags) {
                userErrors {
                  message
                }
              }
            }
          `,
          variables: { id: retryId, tags: [tag] },
        })
        return { ok: true }
      }
    }

    return {
      ok: false,
      error: userErrors[0]?.message || `Couldn't sign you up for ${productName} restock alerts.`,
    }
  } catch (error) {
    if (error instanceof ShopifyAdminError) {
      console.error('Restock alert signup failed:', error.message)
    }
    return { ok: false, error: "Couldn't sign you up — please try again." }
  }
}
