// Real BS (Bristol) postcode districts and their coverage areas — standard
// public Royal Mail postal geography, not invented. Excludes non-geographic
// codes (BS0, BS98, BS99). Source cross-checked against Wikipedia's BS
// postcode area article.
//
// No real district-level *boundary shapes* exist in this codebase (the
// licensed map in src/lib/uk-map-svg.ts only has postcode-AREA boundaries,
// not district boundaries) — rather than fabricate fake boundary polygons,
// districts are presented as a plain list/grid once zoomed into Bristol.
// See docs/third-party-assets.md.
export const bristolDistricts: { code: string; coverage: string }[] = [
  { code: 'BS1', coverage: 'Bristol city centre, Redcliffe' },
  { code: 'BS2', coverage: "Kingsdown, St Paul's, St Phillips, St Agnes" },
  { code: 'BS3', coverage: 'Bedminster, Southville, Bower Ashton, Totterdown, Windmill Hill' },
  { code: 'BS4', coverage: "Brislington, Knowle, Knowle West, St Anne's, Totterdown" },
  {
    code: 'BS5',
    coverage:
      'Easton, St George, Redfield, Whitehall, Eastville, Speedwell, Greenbank, Barton Hill',
  },
  { code: 'BS6', coverage: "Cotham, Redland, Montpelier, Westbury Park, St Andrew's" },
  { code: 'BS7', coverage: 'Bishopston, Horfield, Filton, Lockleaze, Ashley Down' },
  { code: 'BS8', coverage: 'Clifton, Failand, Hotwells, Leigh Woods' },
  {
    code: 'BS9',
    coverage: 'Coombe Dingle, Sneyd Park, Stoke Bishop, Westbury-on-Trym, Henleaze, Sea Mills',
  },
  { code: 'BS10', coverage: 'Brentry, Henbury, Southmead, Westbury-on-Trym' },
  { code: 'BS11', coverage: 'Avonmouth, Shirehampton, Lawrence Weston' },
  { code: 'BS13', coverage: 'Bedminster Down, Bishopsworth, Hartcliffe, Withywood, Headley Park' },
  { code: 'BS14', coverage: 'Hengrove, Stockwood, Whitchurch' },
  { code: 'BS15', coverage: 'Hanham, Kingswood' },
  {
    code: 'BS16',
    coverage:
      'Downend, Emersons Green, Fishponds, Frenchay, Pucklechurch, Mangotsfield, Staple Hill',
  },
  { code: 'BS20', coverage: 'Pill, Portishead' },
  { code: 'BS21', coverage: 'Clevedon' },
  { code: 'BS22', coverage: 'Kewstoke, Weston-super-Mare, Worle' },
  { code: 'BS23', coverage: 'Uphill, Weston-super-Mare' },
  {
    code: 'BS24',
    coverage: 'Bleadon, Hutton, Locking, Lympsham, Puxton, Weston-super-Mare, Wick St Lawrence',
  },
  { code: 'BS25', coverage: 'Churchill, Winscombe, Sandford, Shipham' },
  { code: 'BS26', coverage: 'Axbridge, Compton Bishop, Loxton' },
  { code: 'BS27', coverage: 'Cheddar, Draycott' },
  { code: 'BS28', coverage: 'Wedmore' },
  { code: 'BS29', coverage: 'Banwell' },
  {
    code: 'BS30',
    coverage: 'Bitton, Longwell Green, Cadbury Heath, Oldland Common, Warmley, Wick',
  },
  { code: 'BS31', coverage: 'Keynsham, Saltford' },
  { code: 'BS32', coverage: 'Almondsbury, Aztec West, Bradley Stoke' },
  {
    code: 'BS34',
    coverage: 'Patchway, Charlton Hayes, Cribbs Causeway, Little Stoke, Stoke Gifford',
  },
  {
    code: 'BS35',
    coverage:
      'Thornbury, Alveston, Rudgeway, Aust, Olveston, Pilning, Severn Beach, Easter Compton',
  },
  { code: 'BS36', coverage: 'Winterbourne, Frampton Cotterell, Coalpit Heath' },
  { code: 'BS37', coverage: 'Yate, Chipping Sodbury, Rangeworthy, Westerleigh, Wapley' },
  {
    code: 'BS39',
    coverage: 'Paulton, Clutton, Temple Cloud, High Littleton, Pensford, Bishop Sutton',
  },
  {
    code: 'BS40',
    coverage: 'Chew Valley, Chew Magna, Chew Stoke, Blagdon, Wrington, Charterhouse',
  },
  { code: 'BS41', coverage: 'Long Ashton, Dundry' },
  { code: 'BS48', coverage: 'Backwell, Nailsea' },
  { code: 'BS49', coverage: 'Congresbury, Yatton' },
]

// Only BS3 has real stock — matches src/lib/postcode-areas.ts's
// activePostcodeAreas as the single source of truth for what's real.
export const activeBristolDistrict = 'BS3'
