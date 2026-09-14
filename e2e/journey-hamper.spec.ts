import { test, expect } from '@playwright/test'
import { basketDialog, clickLabelled, dismissSplash } from './helpers'

// Journey C — open a hamper -> choose the honey for each jar -> change
// quantity -> add to basket -> verify the basket carries the exact
// selection made, not just "an item was added". The honey choice isn't a
// Shopify variant — it travels as a cart line attribute (see
// src/lib/hamper.ts) that the order-paid webhook later reads to work out
// which honey's stock to deduct, so asserting its exact text here is the
// only way this journey actually proves the configuration survived.
test('hamper: choosing honey per jar and increasing quantity produces the right basket line', async ({
  page,
}) => {
  await page.goto('/shop/hamper-3-jar-honey')
  await dismissSplash(page)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

  await clickLabelled(page, 'Choose your own')
  await clickLabelled(page, "I'll choose each jar")

  // Jars 1 and 3 keep the default (Bee S3); jar 2 is deliberately changed
  // to Bee S4, so the resulting tally must show both honeys, not just one.
  await page.getByLabel('Honey for jar 1').selectOption({ label: 'Bee S3' })
  await page.getByLabel('Honey for jar 2').selectOption({ label: 'Bee S4' })
  await page.getByLabel('Honey for jar 3').selectOption({ label: 'Bee S3' })

  const quantity = page.locator('span[aria-live="polite"]').first()
  await expect(quantity).toHaveText('1')
  await page.getByRole('button', { name: 'Increase quantity' }).click()
  await expect(quantity).toHaveText('2')
  await expect(page.getByText('Subtotal (x2)')).toBeVisible()

  await page.getByRole('button', { name: 'Add to basket' }).click()

  const drawer = basketDialog(page)
  await expect(drawer).toBeVisible()
  await expect(page.getByRole('button', { name: /^Basket/ })).toHaveAccessibleName(
    /Basket, 2 items$/
  )
  await expect(drawer.getByText('Honey selection: 2x Bee S3, 1x Bee S4')).toBeVisible()

  // The quantity stepper inside the basket itself controls how many
  // hampers are on the order, not how many jars are in one — increasing
  // it should not touch the honey-selection attribute at all.
  await drawer.getByRole('button', { name: 'Increase quantity' }).click()
  await expect(page.getByRole('button', { name: /^Basket/ })).toHaveAccessibleName(
    /Basket, 3 items$/
  )
  await expect(drawer.getByText('Honey selection: 2x Bee S3, 1x Bee S4')).toBeVisible()
})

test('hamper: surprise selection needs no honey picker and adds a plain line', async ({
  page,
}) => {
  await page.goto('/shop/hamper-3-jar-honey')
  await dismissSplash(page)

  // Default variant is "Surprise selection" — no "Which honey?" picker at
  // all, since the picker only ever applies to "Choose your own" (see
  // purchase-options.tsx's needsHoneyChoice). The actual honey is resolved
  // later, at fulfilment, by the order-paid webhook — never something the
  // customer chooses here.
  await expect(page.getByRole('radio', { name: /Surprise selection/i })).toBeChecked()
  await expect(page.getByText('Which honey?')).toBeHidden()

  await page.getByRole('button', { name: 'Add to basket' }).click()

  const drawer = basketDialog(page)
  await expect(drawer).toBeVisible()
  await expect(drawer.getByText(/Hamper/i)).toBeVisible()
  // No "Honey selection" attribute at all for a surprise pick — that
  // attribute only ever gets attached by the "Choose your own" path.
  await expect(drawer.getByText(/Honey selection/)).toBeHidden()
})
