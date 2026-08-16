// Groups postcode areas (src/lib/postcode-areas.ts) into the everyday UK
// regions people actually use to talk about where they live — not a
// proprietary grouping, just standard geography. Boundary postcode areas
// (e.g. MK, SG) are placed in whichever region they're most commonly
// associated with; a jar being "technically" borderline doesn't need to be
// exact for a shop filter.
export const ukRegions: Record<string, string[]> = {
  'South West': ['BA', 'BS', 'DT', 'EX', 'GL', 'PL', 'SN', 'SP', 'TA', 'TQ', 'TR', 'BH'],
  'South East': ['BN', 'CT', 'GU', 'ME', 'OX', 'PO', 'RG', 'RH', 'SL', 'SO', 'TN', 'TW', 'KT'],
  London: ['E', 'EC', 'N', 'NW', 'SE', 'SW', 'W', 'WC', 'BR', 'CR', 'DA', 'EN', 'HA', 'IG', 'RM', 'SM', 'UB', 'WD'],
  'East of England': ['CB', 'CM', 'CO', 'IP', 'NR', 'SS', 'AL', 'LU', 'HP', 'MK', 'SG'],
  'East Midlands': ['DE', 'LE', 'LN', 'NG', 'NN', 'PE'],
  'West Midlands': ['B', 'CV', 'DY', 'HR', 'ST', 'SY', 'TF', 'WR', 'WS', 'WV'],
  'North West': ['BB', 'BL', 'CA', 'CH', 'CW', 'FY', 'L', 'LA', 'M', 'OL', 'PR', 'SK', 'WA', 'WN'],
  'Yorkshire and the Humber': ['BD', 'DN', 'HD', 'HG', 'HU', 'HX', 'LS', 'S', 'WF', 'YO'],
  'North East': ['DH', 'DL', 'NE', 'SR', 'TS'],
  Wales: ['CF', 'LD', 'LL', 'NP', 'SA'],
  Scotland: ['AB', 'DD', 'DG', 'EH', 'FK', 'G', 'HS', 'IV', 'KA', 'KW', 'KY', 'ML', 'PA', 'PH', 'TD', 'ZE'],
  'Northern Ireland': ['BT'],
}

const areaToRegion: Record<string, string> = Object.fromEntries(
  Object.entries(ukRegions).flatMap(([region, areas]) => areas.map((area) => [area, region]))
)

export const ukRegionNames = Object.keys(ukRegions)

// A honeyProduct's postcodeCode can be an area ("M") or, for Bristol/Bath, a
// district ("BS3") — same resolution as getAreaNameForCode in
// postcode-areas.ts.
export function getRegionForCode(code: string): string | undefined {
  if (code in areaToRegion) return areaToRegion[code]
  const areaCode = code.replace(/\d+$/, '')
  return areaToRegion[areaCode]
}
