import { test, expect, devices } from '@playwright/test'
import { dismissSplash, mainContentLink, openSearch } from './helpers'

// Journey B — open the primary nav -> navigate to Honey -> return ->
// search -> close overlay. The interaction genuinely differs by
// breakpoint (a hamburger-triggered dialog below `xl`, an inline <nav>
// above it — see site-header.tsx), so this journey is written twice
// rather than relying on whichever of the two configured projects
// (chromium/mobile-safari) happens to run it.

test.describe('mobile viewport', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('mobile menu navigates to honey, then search opens and closes', async ({ page }) => {
    await page.goto('/')
    await dismissSplash(page)

    await page.getByRole('button', { name: 'Open menu' }).click()
    const menu = page.getByRole('dialog', { name: 'Primary' })
    await expect(menu).toBeVisible()

    await menu.getByRole('link', { name: 'Shop', exact: true }).click()
    await expect(menu).toBeHidden()
    await expect(page).toHaveURL(/\/shop$/)

    await page.getByRole('button', { name: 'Grid' }).click()
    await mainContentLink(page, '/shop/honey').click()
    await expect(page).toHaveURL(/\/shop\/honey$/)

    // Return, via the browser back button — same as a real customer's own
    // back gesture, not a link this site has to provide itself.
    await page.goBack()
    await expect(page).toHaveURL(/\/shop$/)

    await openSearch(page)
    const searchDialog = page.getByRole('dialog', { name: 'Search' })
    await expect(searchDialog).toBeVisible()
    await expect(searchDialog.getByRole('textbox')).toBeFocused()

    await page.keyboard.press('Escape')
    await expect(searchDialog).toBeHidden()
    await expect(page.getByRole('button', { name: 'Search', exact: true })).toBeFocused()
  })
})

test.describe('desktop viewport', () => {
  test.use({ viewport: devices['Desktop Chrome'].viewport })

  test('inline nav goes to honey, then search opens and closes', async ({ page }) => {
    await page.goto('/')
    await dismissSplash(page)
    await expect(page.getByRole('button', { name: 'Open menu' })).toBeHidden()

    await page
      .getByRole('navigation', { name: 'Primary' })
      .getByRole('link', { name: 'Shop', exact: true })
      .click()
    await expect(page).toHaveURL(/\/shop$/)

    await page.getByRole('button', { name: 'Grid' }).click()
    await mainContentLink(page, '/shop/honey').click()
    await expect(page).toHaveURL(/\/shop\/honey$/)

    await page.goBack()
    await expect(page).toHaveURL(/\/shop$/)

    await openSearch(page)
    const searchDialog = page.getByRole('dialog', { name: 'Search' })
    await expect(searchDialog).toBeVisible()
    await expect(searchDialog.getByRole('textbox')).toBeFocused()

    await page.keyboard.press('Escape')
    await expect(searchDialog).toBeHidden()
  })
})
