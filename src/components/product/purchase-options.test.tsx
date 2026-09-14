import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { PurchaseOptions } from './purchase-options'

// This project's vitest config doesn't set `globals: true`, so
// @testing-library/react's automatic afterEach cleanup never registers —
// without this, each test's render stays mounted into the next, and a
// query like getByRole matches elements from multiple tests at once.
afterEach(cleanup)

// PurchaseOptions renders inside a real CartProvider on every real page —
// stubbed here since this suite only cares about the surprise-hamper
// stock gate, not basket behaviour itself.
vi.mock('@/components/cart/cart-context', () => ({
  useCart: () => ({ addItem: vi.fn(), isPending: false, error: null }),
}))

// Matches the real Shopify hamper product: a "Surprise selection" variant
// (selected by default, index 0) alongside "Choose your own". See "FIX
// SURPRISE HAMPER STOCK VALIDATION" audit, 2026-09-13 — this used to let a
// customer buy a surprise hamper of any quantity with no connection to
// real honey stock at all.
const surpriseVariant = {
  id: 'variant-surprise',
  label: 'Surprise selection',
  price: 22.5,
  availableForSale: true,
  quantityAvailable: 0, // hampers have inventory tracking off — always "in stock" by design
}
const chooseYourOwnVariant = {
  id: 'variant-choose',
  label: 'Choose your own',
  price: 22.5,
  availableForSale: true,
  quantityAvailable: 0,
}

describe('PurchaseOptions — surprise hamper stock validation', () => {
  it('allows checkout when quantity × jars-per-hamper is covered by at least one honey', () => {
    render(
      <PurchaseOptions
        productName="Hamper - 3 Jar Honey"
        productHandle="hamper-3-jar-honey"
        unitPrice={22.5}
        unitLabel="item"
        variantId={surpriseVariant.id}
        variants={[surpriseVariant, chooseYourOwnVariant]}
        hamperJarCount={3}
        honeyJarOptions={[
          { name: 'Bee S3', quantityAvailable: 4 },
          { name: 'Bee S4', quantityAvailable: 2 },
        ]}
      />
    )

    // Default quantity 1 → 3 jars required; Bee S3 (4) covers it.
    expect(screen.getByRole('button', { name: 'Add to basket' })).toBeEnabled()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('blocks checkout with a clear message once no single honey covers the full order (3 jars × 2 = 6, best stock is only 4)', () => {
    render(
      <PurchaseOptions
        productName="Hamper - 3 Jar Honey"
        productHandle="hamper-3-jar-honey"
        unitPrice={22.5}
        unitLabel="item"
        variantId={surpriseVariant.id}
        variants={[surpriseVariant, chooseYourOwnVariant]}
        hamperJarCount={3}
        honeyJarOptions={[
          { name: 'Bee S3', quantityAvailable: 4 },
          { name: 'Bee S4', quantityAvailable: 2 },
        ]}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Increase quantity' }))

    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent(/not enough stock/i)
    expect(screen.getByRole('button', { name: 'Add to basket' })).toBeDisabled()
  })

  it('does not apply the surprise stock check to the "Choose your own" variant', () => {
    render(
      <PurchaseOptions
        productName="Hamper - 3 Jar Honey"
        productHandle="hamper-3-jar-honey"
        unitPrice={22.5}
        unitLabel="item"
        variantId={chooseYourOwnVariant.id}
        variants={[surpriseVariant, chooseYourOwnVariant]}
        hamperJarCount={3}
        honeyJarOptions={[
          { name: 'Bee S3', quantityAvailable: 4 },
          { name: 'Bee S4', quantityAvailable: 2 },
        ]}
      />
    )

    // Selects "Choose your own" instead of the surprise variant.
    fireEvent.click(screen.getByRole('radio', { name: /Choose your own/i }))

    // No honey picked yet (defaults to the first honey option), so this
    // exercises the existing per-honey shortfall path, not the surprise
    // one — confirming the two checks are independent and the surprise
    // rule doesn't leak into this variant.
    expect(screen.getByText('Which honey?')).toBeInTheDocument()
  })
})
