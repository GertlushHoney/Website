// Checks the two overlays a static crawl can't reach: the cookie
// preferences popover and the basket drawer, both opened via real clicks.
import { chromium } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const base = 'http://localhost:3000'
const browser = await chromium.launch()
const context = await browser.newContext()
const page = await context.newPage()

async function report(label) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze()
  console.log(
    `${label}: ${results.violations.length} violations` +
      (results.violations.length ? ' — ' + results.violations.map((v) => `${v.impact}:${v.id}`).join(', ') : '')
  )
  if (results.violations.length) console.log(JSON.stringify(results.violations, null, 2))
}

// Cookie preferences popover
await page.goto(base + '/', { waitUntil: 'networkidle' })
await page.waitForTimeout(2500)
await page.getByRole('button', { name: 'Cookie options' }).click()
await page.waitForTimeout(300)
const focused1 = await page.evaluate(() => document.activeElement?.getAttribute('role'))
console.log('focused element role after opening cookie popover:', focused1)
await report('cookie popover (open)')
await page.keyboard.press('Escape')
await page.waitForTimeout(300)
const stillOpen = await page.locator('div[role="dialog"][aria-label="Cookie preferences"]').count()
console.log('cookie popover still in DOM after Escape:', stillOpen > 0)
const focusedAfterEscape = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'))
console.log('focus returned to trigger after Escape:', focusedAfterEscape)

// Basket drawer — add an item on the Bee S3 product page to trigger it
await page.goto(base + '/shop/bee-s3', { waitUntil: 'networkidle' })
await page.waitForTimeout(2500)
const addButton = page.getByRole('button', { name: /add to basket/i })
if (await addButton.count()) {
  await addButton.first().click()
  await page.waitForTimeout(800)
  const dialogRole = await page.evaluate(() => document.activeElement?.getAttribute('role'))
  console.log('focused element role after adding to basket:', dialogRole)
  await report('basket drawer (open)')
} else {
  console.log('No "Add to basket" button found on /shop/bee-s3 — check the real button text')
}

await browser.close()
