import type { Page } from '@playwright/test'

// The intro splash (splash.tsx) auto-dismisses after ~2.3s, but a test
// that starts interacting immediately after goto() can catch it mid-way
// and have every click swallowed by its full-screen overlay. Clicking it
// away directly is faster and more reliable than waiting out its timers.
export async function dismissSplash(page: Page) {
  const splash = page.getByRole('button', { name: 'Skip intro' })
  try {
    // Racing the component's own ~2.3s auto-dismiss timer (see
    // splash.tsx): it can legitimately disappear on its own between the
    // isVisible() check and the click, which is just as good an outcome
    // as clicking it ourselves.
    if (await splash.isVisible({ timeout: 500 })) {
      await splash.click({ timeout: 3000 })
    }
  } catch {}
  // The click starts a 500ms fade before the element actually unmounts —
  // it keeps intercepting clicks the whole time (opacity, unlike
  // visibility, doesn't affect pointer-events), so the next action must
  // wait for it to fully detach either way, not just fire-and-forget.
  await splash.waitFor({ state: 'detached', timeout: 5000 }).catch(() => {})
}

// Several radio groups on this site (variant choice, honey-pick mode,
// purchase type — see purchase-options.tsx) use a visually-hidden
// (`sr-only`) native radio nested inside a big clickable <label>, so the
// label reads as the whole styled control. Playwright's own
// scroll-into-view for the sr-only input itself lands somewhere
// unpredictable (its absolute positioning collapses its real layout
// position), so click the label text a real user would actually click.
export function clickLabelled(page: Page, text: string | RegExp) {
  return page.locator('label').filter({ hasText: text }).click()
}

export async function openBasket(page: Page) {
  await page.getByRole('button', { name: /^Basket/ }).click()
}

export async function openSearch(page: Page) {
  await page.getByRole('button', { name: 'Search', exact: true }).click()
}

export function basketDialog(page: Page) {
  return page.getByRole('dialog', { name: 'Basket' })
}

// Scoped to <main> — the site footer repeats several of the same shop
// category links (see lib/navigation.ts's footerNav), so an unscoped
// `a[href="..."]` locator for a shop category matches the footer's own
// copy too.
export function mainContentLink(page: Page, href: string) {
  return page.getByRole('main').locator(`a[href="${href}"]`)
}
