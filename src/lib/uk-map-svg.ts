import { readFileSync } from 'node:fs'
import { join } from 'node:path'

// Server-only: reads the licensed UK postcode-areas SVG and recolours it
// to the site's dark palette via targeted string replacement (the file has
// no <style> block — colours are presentation attributes on specific
// elements/groups, and these hex values are distinctive enough in this file
// to replace safely). Source: public/images/map/uk-postcode-areas-source.svg
// — British postcode areas map by Richardguk, CC BY-SA 3.0 / OS OpenData /
// OGL v3.0. Attribution is rendered alongside the map in the page, not here.
let cached: string | null = null

export function getUkPostcodeMapSvg(): string {
  if (cached) return cached

  const path = join(process.cwd(), 'public/images/map/uk-postcode-areas-source.svg')
  let svg = readFileSync(path, 'utf-8')

  // Literal hex values, not var(...) — SVG presentation attributes don't
  // reliably resolve CSS custom properties across browsers. These must be
  // kept in sync by hand with the tokens in src/app/globals.css.
  svg = svg
    // sea -> ink
    .replaceAll('fill="#C6ECFF"', 'fill="#14110d"')
    // land (main GB/NI landmass, 254 occurrences) -> ink-surface
    .replaceAll('fill="#FEFEE9"', 'fill="#211b14"')
    // land (smaller islands, 95 occurrences, slightly different original grey) -> ink-surface
    .replaceAll('fill="#E0E0E0"', 'fill="#211b14"')
    // land (London/Manchester inset area fills, 16 occurrences) -> ink-surface
    .replaceAll('fill="#F6E1B9"', 'fill="#211b14"')
    // area boundary / water-line strokes -> ink-line
    .replaceAll('stroke="#646464"', 'stroke="#33291d"')
    // area code label fill + outline stroke -> faint porcelain, no white halo
    .replaceAll('fill="#D40000"', 'fill="#f7f5ef" fill-opacity="0.45"')
    .replaceAll('stroke="#FFFFFF"', 'stroke="none"')

  cached = svg
  return svg
}
