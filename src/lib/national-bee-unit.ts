// APHA's rolling Yellow-legged (Asian) hornet update, shown on /asian-hornets.
//
// Fetched from the National Bee Unit once a day (changed 2026-10-21 — it was
// hand-maintained only, because nationalbeeunit.com sat behind a Cloudflare
// JS challenge that 403'd every non-browser request; it now serves the page
// to an ordinary browser-like request). Cloudflare can still refuse a
// request from a data-centre IP, so FALLBACK below is what the page shows
// whenever the fetch or the parse fails — it never breaks, it just shows
// these hand-checked figures with their own as-of date.
//
// To refresh FALLBACK by hand: open SOURCE_URL in a real browser, find the
// "As of DD/MM/YYYY" line near the top, and update the fields to match,
// with lastCheckedDate = today.
//
// Each spring APHA starts a new rolling-update page for the new year; once
// it exists, point SOURCE_URL at it (until then this keeps showing the
// previous year's final figures, with that year named on the page).
export const SOURCE_URL =
  'https://www.nationalbeeunit.com/about-us/beekeeping-news/yellow-legged-hornet-2025-rolling-update-2'

export type HornetUpdate = {
  asOfDate: string
  sightingsCount: number
  nestsCount: number
  year: string
  sourceUrl: string
}

export const FALLBACK: HornetUpdate & { lastCheckedDate: string } = {
  asOfDate: '15/10/2026',
  sightingsCount: 226,
  nestsCount: 85,
  year: '2026',
  lastCheckedDate: '2026-10-21',
  sourceUrl: SOURCE_URL,
}

const ONE_DAY_SECONDS = 24 * 60 * 60

// A plain server fetch (no browser user agent) is what Cloudflare refuses;
// this is the same request a normal browser visit makes for the HTML.
const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml',
  'Accept-Language': 'en-GB,en;q=0.9',
}

// Pulls the three figures out of the page's own sentences, e.g.
// "As of 15/10/2026: … 226 credible yellow-legged hornet sightings have
// been reported in the UK in 2026. 85 nests have been found". Returns null
// if any of them is missing, so a page redesign (or a Cloudflare challenge
// page served with a 200) falls back rather than showing nonsense.
export function parseHornetUpdate(html: string): HornetUpdate | null {
  const text = html
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')

  const asOf = text.match(/As of (\d{1,2}\/\d{1,2}\/\d{4})/i)
  const sightings = text.match(
    /([\d,]+) credible yellow-legged hornet sightings have been reported in the UK in (\d{4})/i
  )
  const nests = text.match(/([\d,]+) nests have been found/i)
  if (!asOf || !sightings || !nests) return null

  const toNumber = (value: string) => Number(value.replace(/,/g, ''))
  const sightingsCount = toNumber(sightings[1])
  const nestsCount = toNumber(nests[1])
  if (!Number.isFinite(sightingsCount) || !Number.isFinite(nestsCount)) return null

  return {
    asOfDate: asOf[1],
    sightingsCount,
    nestsCount,
    year: sightings[2],
    sourceUrl: SOURCE_URL,
  }
}

// Cached by Next's fetch cache for a day, so the National Bee Unit gets at
// most one request a day from this site however many people visit — and
// /asian-hornets (revalidate = one day) is rebuilt with whatever it returns.
export async function getYellowLeggedHornetUpdate(): Promise<HornetUpdate> {
  try {
    const res = await fetch(SOURCE_URL, {
      headers: BROWSER_HEADERS,
      next: { revalidate: ONE_DAY_SECONDS },
      signal: AbortSignal.timeout(10_000),
    })
    if (!res.ok) {
      console.warn(`National Bee Unit fetch refused (${res.status}) — showing fallback figures`)
      return FALLBACK
    }
    const parsed = parseHornetUpdate(await res.text())
    if (!parsed) {
      console.warn('National Bee Unit page had no recognisable figures — showing fallback figures')
      return FALLBACK
    }
    return parsed
  } catch (error) {
    console.warn('National Bee Unit fetch failed — showing fallback figures:', error)
    return FALLBACK
  }
}
