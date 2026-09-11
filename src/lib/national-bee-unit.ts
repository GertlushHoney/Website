// Manually-maintained summary of APHA's rolling Yellow-legged (Asian)
// hornet update (see /asian-hornets). Automated fetching isn't possible —
// both nationalbeeunit.com and nonnativespecies.org sit behind a
// Cloudflare JS challenge that returns a 403 to any non-browser request,
// so a server-side fetch can never reach the real numbers.
//
// To refresh: open SOURCE_URL in a real browser, find the "As of DD/MM/
// YYYY" line near the top, and update the three fields below to match.
// Update lastCheckedDate to today whenever you do this, so it's obvious
// from the code alone how stale these numbers might be.
export const SOURCE_URL =
  'https://www.nationalbeeunit.com/about-us/beekeeping-news/yellow-legged-hornet-2025-rolling-update-2'

export const yellowLeggedHornetUpdate = {
  asOfDate: '03/09/2026',
  sightingsCount: 167,
  nestsCount: 53,
  year: '2026',
  lastCheckedDate: '2026-09-06',
  sourceUrl: SOURCE_URL,
}
