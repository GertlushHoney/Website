// sellingPlanGroups surfaces any real Shopify Selling Plan attached to this
// product (created via the Shopify Subscriptions app in the merchant's
// admin) — we just take the first plan of the first group, since each
// honey product only ever needs one "monthly" plan. Requires the
// unauthenticated_read_selling_plans Storefront API scope on the Headless
// channel. Absent/empty means "no real subscription set up for this
// product yet", handled honestly by the caller, never assumed.
export const PRODUCT_BY_HANDLE_QUERY = /* GraphQL */ `
  query ProductByHandle($handle: String!) {
    product(handle: $handle) {
      id
      title
      handle
      availableForSale
      variants(first: 1) {
        edges {
          node {
            id
            availableForSale
            quantityAvailable
            price {
              amount
              currencyCode
            }
          }
        }
      }
      sellingPlanGroups(first: 1) {
        edges {
          node {
            sellingPlans(first: 1) {
              edges {
                node {
                  id
                }
              }
            }
          }
        }
      }
    }
  }
`

// Shared shape for every cart operation below, so the client always gets
// back everything the basket UI needs (line items with product info, live
// totals) in one round trip — never a bare id needing a follow-up fetch.
const CART_FRAGMENT = /* GraphQL */ `
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      subtotalAmount {
        amount
        currencyCode
      }
    }
    lines(first: 50) {
      edges {
        node {
          id
          quantity
          sellingPlanAllocation {
            sellingPlan {
              id
              name
            }
            checkoutChargeAmount {
              amount
              currencyCode
            }
          }
          merchandise {
            ... on ProductVariant {
              id
              title
              product {
                title
                handle
              }
              image {
                url
                altText
              }
              price {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
  }
`

export const CART_CREATE_MUTATION = /* GraphQL */ `
  ${CART_FRAGMENT}
  mutation CartCreate($lines: [CartLineInput!]!) {
    cartCreate(input: { lines: $lines }) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
      }
    }
  }
`

export const CART_QUERY = /* GraphQL */ `
  ${CART_FRAGMENT}
  query Cart($cartId: ID!) {
    cart(id: $cartId) {
      ...CartFields
    }
  }
`

export const CART_LINES_ADD_MUTATION = /* GraphQL */ `
  ${CART_FRAGMENT}
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
      }
    }
  }
`

export const CART_LINES_UPDATE_MUTATION = /* GraphQL */ `
  ${CART_FRAGMENT}
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
      }
    }
  }
`

// Requires the unauthenticated_write_customers Storefront API scope on the
// Headless channel — not ticked by the original setup (see
// docs/launch-checklist.md point 3), since nothing used customer accounts
// until this newsletter signup. subscribeToNewsletter() in
// src/lib/shopify/customer.ts fails gracefully if it's missing, but the
// signup won't actually work until that scope is added.
export const CUSTOMER_CREATE_MUTATION = /* GraphQL */ `
  mutation CustomerCreate($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer {
        id
      }
      customerUserErrors {
        field
        message
        code
      }
    }
  }
`

export const CART_LINES_REMOVE_MUTATION = /* GraphQL */ `
  ${CART_FRAGMENT}
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
      }
    }
  }
`
