export const PRODUCT_BY_QUERY = /* GraphQL */ `
  query ProductSearch($query: String!) {
    products(first: 1, query: $query) {
      edges {
        node {
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
        }
      }
    }
  }
`

export const CART_CREATE_MUTATION = /* GraphQL */ `
  mutation CartCreate($lines: [CartLineInput!]!) {
    cartCreate(input: { lines: $lines }) {
      cart {
        id
        checkoutUrl
      }
      userErrors {
        field
        message
      }
    }
  }
`
