// Real BA (Bath) postcode districts — standard, publicly documented Royal
// Mail postcode-district geography (not proprietary/invented data),
// cross-checked against Wikipedia's BA postcode area article. See
// docs/third-party-assets.md. Matches the pattern used for
// src/lib/bristol-districts.ts: no real district-level GIS boundary shapes
// exist for this area either, so these are presented as a plain button grid,
// not fake drawn polygons.
export const bathDistricts: { code: string; coverage: string }[] = [
  { code: 'BA1', coverage: 'Bath (north of the Avon), Batheaston, Bathford, Swainswick' },
  {
    code: 'BA2',
    coverage:
      'Bath (south of the Avon), Farmborough, Timsbury, Peasedown St John, Wellow, Hinton Charterhouse, Norton St Philip, Freshford, Limpley Stoke',
  },
  { code: 'BA3', coverage: 'Radstock, Midsomer Norton, Holcombe, Coleford' },
  { code: 'BA4', coverage: 'Shepton Mallet, Evercreech' },
  { code: 'BA5', coverage: 'Wells, Wookey, Westbury-sub-Mendip' },
  { code: 'BA6', coverage: 'Glastonbury, Baltonsborough, Meare, Westhay' },
  { code: 'BA7', coverage: 'Castle Cary, Ansford, Alford, Lovington' },
  { code: 'BA8', coverage: 'Templecombe, Henstridge, Horsington' },
  { code: 'BA9', coverage: 'Wincanton, Penselwood, Cucklington, Holton, Yarlington' },
  { code: 'BA10', coverage: 'Bruton, Pitcombe, Redlynch, Brewham' },
  { code: 'BA11', coverage: 'Frome, Beckington' },
  { code: 'BA12', coverage: 'Warminster, Mere, Corsley, Zeals, Kilmington' },
  { code: 'BA13', coverage: 'Westbury, Chapmanslade' },
  { code: 'BA14', coverage: 'Trowbridge' },
  {
    code: 'BA15',
    coverage: 'Bradford-on-Avon, Winsley, Westwood, Monkton Farleigh, South Wraxall',
  },
  { code: 'BA16', coverage: 'Street, Walton' },
  { code: 'BA20', coverage: 'Yeovil (centre and south)' },
  { code: 'BA21', coverage: 'Yeovil (north), Mudford' },
  {
    code: 'BA22',
    coverage:
      'Yeovil (west), East Coker, West Coker, Ilchester, Sparkford, Marston Magna, Halstock, Stoford, Clifton Maybank',
  },
]

// No real stock from the Bath area yet — matches src/lib/postcode-areas.ts's
// activePostcodeAreas as the single source of truth for what's real.
export const activeBathDistrict: string | undefined = undefined
