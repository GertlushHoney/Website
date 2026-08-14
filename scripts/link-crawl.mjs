// Crawls every internal link reachable from the real pages, following
// links breadth-first, and reports any that 404 or error — a quick way to
// catch dead ends in navigation without clicking through by hand.
import { chromium } from '@playwright/test'

const base = (process.argv.find((a) => a.startsWith('--base=')) ?? '--base=http://localhost:3000').split('=')[1]
const seen = new Set()
const queue = ['/']
const broken = []
const ok = []

const browser = await chromium.launch()
const context = await browser.newContext()
const page = await context.newPage()

while (queue.length > 0) {
  const path = queue.shift()
  if (seen.has(path)) continue
  seen.add(path)

  const res = await page.goto(base + path, { waitUntil: 'domcontentloaded' }).catch((e) => ({ error: e.message }))
  const status = res?.status ? res.status() : null
  if (!res || res.error || (status && status >= 400)) {
    broken.push({ path, status: status ?? 'nav error', error: res?.error })
    continue
  }
  ok.push(path)

  const hrefs = await page.$$eval('a[href]', (els) => els.map((el) => el.getAttribute('href')))
  for (const href of hrefs) {
    if (!href) continue
    if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) continue
    if (href.startsWith('#')) continue
    const clean = href.split('#')[0].split('?')[0]
    if (!clean.startsWith('/')) continue
    if (clean.startsWith('/studio') || clean.startsWith('/api') || clean.startsWith('/tools')) continue
    if (!seen.has(clean)) queue.push(clean)
  }
}

await browser.close()

console.log(`Crawled ${ok.length} pages, ${broken.length} broken.`)
if (broken.length > 0) {
  console.log('\nBROKEN:')
  for (const b of broken) console.log(`  ${b.path} — ${b.status}${b.error ? ' (' + b.error + ')' : ''}`)
}
console.log('\nAll pages visited:')
for (const p of ok.sort()) console.log(`  ${p}`)
