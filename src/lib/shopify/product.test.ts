import { describe, expect, it } from 'vitest'
import { isProductSoldOut } from './product'

// The single source of truth for OutOfStock vs InStock in product JSON-LD
// (and anywhere else that needs it). See "FIX PRODUCT STRUCTURED DATA
// STOCK STATUS" audit, 2026-09-13 — this used to be computed independently
// in two files as `quantityAvailable <= 0`, which reported OutOfStock to
// Google for any product with inventory tracking off (hampers, by design —
// see docs/technical-architecture.md, "Hamper stock sync") regardless of
// whether customers could actually buy it.
describe('isProductSoldOut', () => {
  it('is not sold out when availableForSale is true, even with untracked (zero) inventory', () => {
    // A hamper: inventory tracking off, quantityAvailable always reports 0,
    // but Shopify still says it's genuinely purchasable.
    expect(isProductSoldOut({ availableForSale: true })).toBe(false)
  })

  it('is sold out when Shopify says availableForSale is false', () => {
    expect(isProductSoldOut({ availableForSale: false })).toBe(true)
  })

  it('is sold out when there is no product at all (Shopify unreachable / handle not found)', () => {
    expect(isProductSoldOut(null)).toBe(true)
  })
})
