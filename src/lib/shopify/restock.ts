'use server'

import { shopifyAdminFetch, isShopifyAdminConfigured, ShopifyAdminError } from './admin-client'

export type RestockAlertResult = { ok: true } | { ok: false; error: string }

// Tags the Shopify customer with restock:<product-handle> so a store owner
// can build a Shopify Email segment filtered to that tag and send a single
// email when the product comes back — the actual "notify them" step is a
// manual send in Shopify Email, not automated by this code. See
// docs/launch-checklist.md point 10 for the one-off setup.
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
    variables: { query: `email:${email}` },
  })
  return data.customers.edges[0]?.node.id ?? null
}

export async function subscribeToRestockAlert(
  email: string,
  productHandle: string,
  productName: string
): Promise<RestockAlertResult> {
  const trimmed = email.trim()
  if (!trimmed || !trimmed.includes('@')) {
    return { ok: false, error: 'Enter a valid email address.' }
  }
  if (!isShopifyAdminConfigured()) {
    return { ok: false, error: "Restock alerts aren't available right now." }
  }

  const tag = restockTag(productHandle)

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
            marketingState: 'SUBSCRIBED',
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
