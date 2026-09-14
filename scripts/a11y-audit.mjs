#!/usr/bin/env node
// Crawls every real page on the site with a headless browser and runs
// axe-core against each one (WCAG 2.0/2.1/2.2 A+AA rule sets), so the
// accessibility statement at /legal/accessibility can describe the site's
// actual tested state instead of "we designed for it but never checked".
//
// Usage: node scripts/a11y-audit.mjs [--base=http://localhost:3000]
//
// Requires the dev server already running at --base (or defaults to
// localhost:3000) — this script only crawls, it doesn't start one.

import { chromium } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const base = (process.argv.find((a) => a.startsWith('--base=')) ?? '--base=http://localhost:3000').split('=')[1]

// Re-run in full 2026-09-13 ("RERUN ACCESSIBILITY TESTING") — the previous
// audit predated several components rebuilt/added since (product tabs,
// mobile-first shop carousel, the surprise-hamper stock gate, the
// newsletter popup's exit-intent trigger, weddings/events, the bee-
// friendly garden). Added: an individual merch product, an individual
// hamper product, an individual experience product, /weddings-events and
// /bee-friendly-garden — none of which had a route-level check before.
const routes = [
  '/',
  '/asian-hornets',
  '/become-a-supplier',
  '/becoming-a-beekeeper',
  '/beekeepers',
  '/beekeepers/adam',
  '/bee-friendly-garden',
  '/contact',
  '/delivery',
  '/faqs',
  '/information',
  '/our-story',
  '/sustainability',
  '/postcode-honey',
  '/gert-lush-standard',
  '/weddings-events',
  '/shop',
  '/shop/honey',
  '/shop/bee-s3',
  '/shop/bee-s4',
  '/shop/candles',
  '/shop/bee-decorated-ceramic-plate-large',
  '/shop/experiences',
  '/shop/experience-bramble-farm',
  '/shop/hamper',
  '/shop/hamper-3-jar-honey',
  '/shop/lip-balm',
  '/shop/soap',
  '/stockists',
  '/thank-you',
  '/legal/accessibility',
  '/legal/cookies',
  '/legal/privacy',
  '/legal/terms',
  '/legal/refund-policy',
]

// The site-wide password gate (src/middleware.ts) didn't exist when this
// script was first run (2026-08-11) — added 2026-08-19. httpCredentials is
// Playwright's real Basic Auth support, not the embedded-URL-credentials
// approach that breaks a page's own fetch() calls.
const browser = await chromium.launch()
const context = await browser.newContext(
  process.env.SITE_PASSWORD_USER && process.env.SITE_PASSWORD
    ? {
        httpCredentials: {
          username: process.env.SITE_PASSWORD_USER,
          password: process.env.SITE_PASSWORD,
        },
      }
    : {}
)
const page = await context.newPage()

// The intro splash auto-dismisses after 1.8s and would otherwise cover
// every page's content for axe on first load — wait for it, don't disable
// it, so the audit reflects what a real first-time visitor sees.
async function gotoAndSettle(url) {
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.waitForTimeout(2500)
}

const results = []

for (const route of routes) {
  await gotoAndSettle(base + route)
  const axeResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze()

  results.push({
    route,
    violationCount: axeResults.violations.length,
    violations: axeResults.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      help: v.help,
      helpUrl: v.helpUrl,
      nodes: v.nodes.map((n) => ({
        html: n.html,
        target: n.target,
        failureSummary: n.failureSummary,
      })),
    })),
  })
  const summary = axeResults.violations.map((v) => `${v.impact}:${v.id}(${v.nodes.length})`).join(', ')
  console.log(`${route} — ${axeResults.violations.length} violation types${summary ? ' — ' + summary : ''}`)
}

// Overlays/modals (mobile menu, search, basket, newsletter popup) only
// exist in the DOM once opened — a plain page-load crawl above never sees
// them, and axe can only flag what's actually rendered. Each one is
// opened here, then audited in that open state, labelled distinctly in
// the report. See "RERUN ACCESSIBILITY TESTING" audit, 2026-09-13 — the
// task explicitly calls out "cart/basket overlays where testable" and
// several other overlays as needing more than the default page-load pass.
async function auditLabel(label, opener) {
  await opener()
  await page.waitForTimeout(400) // let the open transition/focus-move settle
  const axeResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze()
  results.push({
    route: label,
    violationCount: axeResults.violations.length,
    violations: axeResults.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      help: v.help,
      helpUrl: v.helpUrl,
      nodes: v.nodes.map((n) => ({ html: n.html, target: n.target, failureSummary: n.failureSummary })),
    })),
  })
  const summary = axeResults.violations.map((v) => `${v.impact}:${v.id}(${v.nodes.length})`).join(', ')
  console.log(`${label} — ${axeResults.violations.length} violation types${summary ? ' — ' + summary : ''}`)
}

await gotoAndSettle(base + '/')

await auditLabel('/ (search overlay open)', () => page.getByRole('button', { name: 'Search' }).click())
await page.keyboard.press('Escape')

await auditLabel('/ (basket overlay open)', () => page.getByRole('button', { name: /^Basket/ }).click())
await page.keyboard.press('Escape')

// Mobile menu only renders below the `xl` breakpoint (see site-header.tsx)
// — narrow the viewport first, same as a real phone visitor would see it.
await page.setViewportSize({ width: 390, height: 844 })
await gotoAndSettle(base + '/')
await auditLabel('/ (mobile menu open, 390px viewport)', () =>
  page.getByRole('button', { name: 'Open menu' }).click()
)
await page.keyboard.press('Escape')
await page.setViewportSize({ width: 1280, height: 800 })

// The newsletter popup no longer shows on a flat short delay (see "REDUCE
// NEWSLETTER POPUP AGGRESSION") — forced open here the same way a real
// exit-intent gesture would trigger it, rather than waiting out the real
// 25s delay in this script.
await gotoAndSettle(base + '/')
await auditLabel('/ (newsletter popup open, forced via exit-intent)', () =>
  page.evaluate(() => {
    localStorage.removeItem('gert-lush-newsletter-popup-seen')
    document.dispatchEvent(new MouseEvent('mouseout', { clientY: -5, bubbles: true }))
  })
)

// Product tabs / accordions — desktop tab interface, audited on a real
// product with several tabs (Where it's from / Tasting profile / The
// beekeeper / More information / Season by season / Details / Reviews).
await gotoAndSettle(base + '/shop/bee-s3')
await auditLabel('/shop/bee-s3 (a product tab selected)', () =>
  page.getByRole('tab', { name: 'The beekeeper' }).click()
)

await browser.close()

const totalViolations = results.reduce((sum, r) => sum + r.violationCount, 0)
console.log(`\nTotal: ${totalViolations} violation types across ${routes.length} pages`)

const fs = await import('node:fs')
fs.writeFileSync('a11y-audit-report.json', JSON.stringify(results, null, 2))
console.log('Full report written to a11y-audit-report.json')
