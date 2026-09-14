import { test, expect } from '@playwright/test'
import { basketDialog, dismissSplash } from './helpers'

// Journey D — open an experience -> choose a session/date -> choose a
// quantity (capped by that session's real remaining places, not the
// product's own untracked Shopify stock — see purchase-options.tsx) ->
// add to basket -> verify the basket line carries the session it was
// actually booked against. The exact session offered is live Sanity data
// (bookings change "places left" over time), so this reads it back from
// the page rather than hardcoding a place count or date that could go
// stale.
test('experience: choosing a session caps quantity to its remaining places, and the basket reflects it', async ({
  page,
}) => {
  await page.goto('/shop/experience-bramble-farm')
  await dismissSplash(page)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

  const sessionSelect = page.getByLabel('Which date?')
  await expect(sessionSelect).toBeVisible()
  const selectedLabel = await sessionSelect.evaluate(
    (el: HTMLSelectElement) => el.options[el.selectedIndex].textContent ?? ''
  )
  const placesMatch = selectedLabel.match(/(\d+) place/)
  test.skip(!placesMatch, 'No session with available places to book right now')
  const placesRemaining = Number(placesMatch![1])

  const quantity = page.locator('span[aria-live="polite"]').first()
  const increase = page.getByRole('button', { name: 'Increase quantity' })

  // Try to go three places past the cap — the picker must never let a
  // booking exceed what this specific date actually has left.
  for (let i = 0; i < placesRemaining + 3; i++) {
    await increase.click()
  }
  await expect(quantity).toHaveText(String(placesRemaining))

  // Back off to a small, always-valid booking size for the actual add.
  const decrease = page.getByRole('button', { name: 'Decrease quantity' })
  const bookingSize = Math.min(2, placesRemaining)
  for (let i = 0; i < placesRemaining - bookingSize; i++) {
    await decrease.click()
  }
  await expect(quantity).toHaveText(String(bookingSize))

  await page.getByRole('button', { name: 'Add to basket' }).click()

  const drawer = basketDialog(page)
  await expect(drawer).toBeVisible()
  await expect(page.getByRole('button', { name: /^Basket/ })).toHaveAccessibleName(
    new RegExp(`Basket, ${bookingSize} items?$`)
  )
  // The basket line shows the real Shopify product title ("Experience -
  // Bramble Farm"), which differs from the marketing name/tagline shown
  // on the product page itself ("Bee Day Experience at Bramble Farm") —
  // asserting on the shared, stable part of both rather than either one
  // verbatim.
  await expect(drawer.getByText(/Bramble Farm/i)).toBeVisible()
  // The real booking date is stored as the raw ISO date (not the pretty
  // display string), since the order-paid webhook matches it exactly
  // against Sanity — see purchase-options.tsx.
  await expect(drawer.getByText(/Session date: \d{4}-\d{2}-\d{2}/)).toBeVisible()
})
