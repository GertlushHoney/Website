import {
  shopifyAdminFetch,
  isShopifyAdminConfigured,
  ShopifyAdminError,
  quoteShopifySearchValue,
} from './admin-client'

// Records someone on the postcode waiting list as a Shopify customer tagged
// waitlist:<area code> (e.g. waitlist:BS3), so the owner can filter Shopify
// Admin → Customers by that tag to see everyone waiting for an area. Only
// ever called from the joinPostcodeWaitingList Server Action
// (src/lib/email/waiting-list.ts), which has already validated the email and
// area code — never import this from a client component.
//
// Marketing consent follows what the visitor actually agreed to: the form's
// optional "also send me news of new honeys" box. Ticked → subscribed to
// Shopify's marketing list (so Shopify Email can reach them); unticked →
// NOT_SUBSCRIBED, the same as the restock alerts — they only asked to hear
// about their area, which the owner then does by hand.

type UserErrors = { userErrors: { message: string }[] }

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

async function tagCustomer(id: string, tag: string): Promise<boolean> {
  const data = await shopifyAdminFetch<{ tagsAdd: UserErrors }>({
    query: /* GraphQL */ `
      mutation TagsAdd($id: ID!, $tags: [String!]!) {
        tagsAdd(id: $id, tags: $tags) {
          userErrors {
            message
          }
        }
      }
    `,
    variables: { id, tags: [tag] },
  })
  return data.tagsAdd.userErrors.length === 0
}

async function subscribeCustomerToMarketing(id: string): Promise<void> {
  await shopifyAdminFetch({
    query: /* GraphQL */ `
      mutation Subscribe($input: CustomerEmailMarketingConsentUpdateInput!) {
        customerEmailMarketingConsentUpdate(input: $input) {
          userErrors {
            message
          }
        }
      }
    `,
    variables: {
      input: {
        customerId: id,
        emailMarketingConsent: {
          marketingState: 'SUBSCRIBED',
          marketingOptInLevel: 'SINGLE_OPT_IN',
          consentUpdatedAt: new Date().toISOString(),
        },
      },
    },
  })
}

export function waitlistTag(areaCode: string): string {
  return `waitlist:${areaCode}`
}

// Returns true once the customer exists with the area tag. Never throws.
export async function addToPostcodeWaitlist(
  email: string,
  areaCode: string,
  subscribeToNews: boolean
): Promise<boolean> {
  if (!isShopifyAdminConfigured()) return false
  const tag = waitlistTag(areaCode)

  try {
    let id = await findCustomerIdByEmail(email)

    if (!id) {
      const data = await shopifyAdminFetch<{
        customerCreate: {
          customer: { id: string } | null
          userErrors: { message: string }[]
        }
      }>({
        query: /* GraphQL */ `
          mutation CustomerCreate($input: CustomerInput!) {
            customerCreate(input: $input) {
              customer {
                id
              }
              userErrors {
                message
              }
            }
          }
        `,
        variables: {
          input: {
            email,
            tags: [tag],
            emailMarketingConsent: {
              marketingState: subscribeToNews ? 'SUBSCRIBED' : 'NOT_SUBSCRIBED',
              marketingOptInLevel: 'SINGLE_OPT_IN',
            },
          },
        },
      })
      if (data.customerCreate.customer) return true

      // Created by someone else between our lookup and now — fall through
      // and treat as an existing customer.
      id = await findCustomerIdByEmail(email)
      if (!id) return false
    }

    const tagged = await tagCustomer(id, tag)
    if (tagged && subscribeToNews) await subscribeCustomerToMarketing(id)
    return tagged
  } catch (error) {
    console.error(
      'Waiting list Shopify tagging failed:',
      error instanceof ShopifyAdminError ? error.message : error
    )
    return false
  }
}
