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

const routes = [
  '/',
  '/asian-hornets',
  '/become-a-supplier',
  '/becoming-a-beekeeper',
  '/beekeepers',
  '/beekeepers/adam',
  '/contact',
  '/delivery',
  '/faqs',
  '/information',
  '/our-story',
  '/sustainability',
  '/postcode-honey',
  '/shop',
  '/shop/honey',
  '/shop/bee-s3',
  '/shop/bee-s4',
  '/shop/candles',
  '/shop/experiences',
  '/shop/hamper',
  '/shop/lip-balm',
  '/shop/soap',
  '/stockists',
  '/thank-you',
  '/legal/accessibility',
  '/legal/cookies',
  '/legal/privacy',
  '/legal/terms',
]

const browser = await chromium.launch()
const context = await browser.newContext()
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

await browser.close()

const totalViolations = results.reduce((sum, r) => sum + r.violationCount, 0)
console.log(`\nTotal: ${totalViolations} violation types across ${routes.length} pages`)

const fs = await import('node:fs')
fs.writeFileSync('a11y-audit-report.json', JSON.stringify(results, null, 2))
console.log('Full report written to a11y-audit-report.json')
