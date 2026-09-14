import { test, expect } from '@playwright/test'
import { basketDialog, dismissSplash, mainContentLink, openBasket } from './helpers'

// Journey A — Homepage -> Shop Honey -> select honey -> view product ->
// add to basket -> verify basket. Exercises the real Shopify Storefront
// cart (see src/lib/shopify/cart.ts) exactly as a real customer's browser
// would — no mocked network layer — so this also proves the live
// integration works, not just that the UI renders. Each test run creates
// a fresh, harmless abandoned Shopify cart (never a completed order);
// see docs/technical-architecture.md.
test('customer can browse to a honey and add it to their basket', async ({ page }) => {
  await page.goto('/')
  await dismissSplash(page)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

  // Shop -> Honey, via the plain grid (deterministic single link per
  // category; the default carousel view can render multiple/cloned tiles
  // for its looping animation — see tile-carousel.tsx).
  await page.goto('/shop')
  await page.getByRole('button', { name: 'Grid' }).click()
  await mainContentLink(page, '/shop/honey').click()
  await expect(page).toHaveURL(/\/shop\/honey$/)
  await expect(page.getByRole('heading', { level: 1, name: 'Honey' })).toBeVisible()

  // Select a specific honey (Bee S3 — a real, always-present product used
  // throughout this project's own test/audit scripts).
  await mainContentLink(page, '/shop/bee-s3').click()
  await expect(page).toHaveURL(/\/shop\/bee-s3$/)
  await expect(page.getByText('Bee S3', { exact: true })).toBeVisible()

  const basketButton = page.getByRole('button', { name: /^Basket/ })
  await expect(basketButton).toHaveAccessibleName(/Basket, 0 items?/)

  const addToBasket = page.getByRole('button', { name: 'Add to basket' })
  await expect(addToBasket).toBeVisible()
  await addToBasket.click()

  // Verify basket: it opens automatically after a successful add (see
  // cart-context.tsx), reflects the new count, and offers a real Shopify
  // checkout link — never asserting on invented copy, just the customer-
  // observable state that actually matters.
  const drawer = basketDialog(page)
  await expect(drawer).toBeVisible()
  await expect(basketButton).toHaveAccessibleName(/Basket, 1 item$/)
  await expect(drawer.getByRole('link', { name: 'Checkout' })).toHaveAttribute(
    'href',
    /^https:\/\//
  )
  await expect(drawer.getByText('Subtotal')).toBeVisible()

  // Closing the basket returns it to the header trigger, same as every
  // other overlay on this site (see "RERUN ACCESSIBILITY TESTING" audit).
  await page.keyboard.press('Escape')
  await expect(drawer).toBeHidden()
})

test('basket persists across a page reload', async ({ page }) => {
  await page.goto('/shop/bee-s3')
  await dismissSplash(page)
  await page.getByRole('button', { name: 'Add to basket' }).click()
  await expect(basketDialog(page)).toBeVisible()

  await page.reload()
  await expect(page.getByRole('button', { name: /^Basket/ })).toHaveAccessibleName(
    /Basket, 1 item$/
  )

  await openBasket(page)
  await expect(basketDialog(page).getByText('Subtotal')).toBeVisible()
})
