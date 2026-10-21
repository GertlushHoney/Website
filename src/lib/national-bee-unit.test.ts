import { afterEach, describe, expect, it, vi } from 'vitest'
import { FALLBACK, getYellowLeggedHornetUpdate, parseHornetUpdate, SOURCE_URL } from './national-bee-unit'

// Trimmed from the real page's markup (2026-10-21): the figures sit in
// separate <p>/<strong> elements, with the nest table after them.
const REAL_SHAPE = `
<main><h1>Yellow-legged hornet 2026 rolling update</h1>
<p>Please report sightings of Yellow-legged hornets (YLH)&nbsp;on this online form.</p>
<p><strong>As of 15/10/2026:</strong></p>
<p>To view the location of destroyed nests, please visit the map page.</p>
<p><strong>226</strong> credible yellow-legged hornet sightings have been reported in the UK in 2026.</p>
<p><strong>85</strong> nests have been found: <a href="#">Click here for the most recent nest</a></p>
<table><tr><td>1</td><td>SK36</td><td>Chesterfield</td></tr></table></main>`

function htmlResponse(body: string, status = 200) {
  return new Response(body, { status, headers: { 'Content-Type': 'text/html' } })
}

describe('parseHornetUpdate', () => {
  it('reads the as-of date, sightings, nests and year from the real page shape', () => {
    expect(parseHornetUpdate(REAL_SHAPE)).toEqual({
      asOfDate: '15/10/2026',
      sightingsCount: 226,
      nestsCount: 85,
      year: '2026',
      sourceUrl: SOURCE_URL,
    })
  })

  it('copes with thousands separators', () => {
    const html = REAL_SHAPE.replace('<strong>226</strong>', '<strong>1,226</strong>')
    expect(parseHornetUpdate(html)?.sightingsCount).toBe(1226)
  })

  it.each([
    ['a Cloudflare challenge page', '<html><title>Just a moment...</title>Checking your browser</html>'],
    ['a page missing the nest count', REAL_SHAPE.replace('nests have been found', 'nests found')],
    ['a page missing the as-of date', REAL_SHAPE.replace('As of 15/10/2026', 'Updated recently')],
  ])('returns null for %s', (_, html) => {
    expect(parseHornetUpdate(html)).toBeNull()
  })
})

describe('getYellowLeggedHornetUpdate', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('returns the live figures, fetched with a one-day cache', async () => {
    const fetchMock = vi.fn().mockResolvedValue(htmlResponse(REAL_SHAPE.replace('226', '240')))
    vi.stubGlobal('fetch', fetchMock)

    const update = await getYellowLeggedHornetUpdate()

    expect(update.sightingsCount).toBe(240)
    expect(fetchMock).toHaveBeenCalledWith(
      SOURCE_URL,
      expect.objectContaining({ next: { revalidate: 86400 } })
    )
  })

  it.each([
    ['refused by Cloudflare', () => Promise.resolve(htmlResponse('Forbidden', 403))],
    ['served an unrecognisable page', () => Promise.resolve(htmlResponse('<p>Just a moment...</p>'))],
    ['unreachable', () => Promise.reject(new TypeError('fetch failed'))],
  ])('falls back to the hand-checked figures when %s', async (_, respond) => {
    vi.stubGlobal('fetch', vi.fn(respond))
    vi.spyOn(console, 'warn').mockImplementation(() => {})

    expect(await getYellowLeggedHornetUpdate()).toBe(FALLBACK)
  })
})
