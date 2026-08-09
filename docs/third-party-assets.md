# Third-party assets

Tracks anything in this codebase that isn't originated by Gert Lush Honey or this build, so
licensing/attribution obligations aren't lost track of before launch.

## UK postcode areas map

- **File:** `public/images/map/uk-postcode-areas-source.svg`
- **Source:** "British postcode areas map" by Richardguk, via Wikimedia Commons
  (https://commons.wikimedia.org/wiki/File:British_postcode_areas_map.svg)
- **License:** Dual/triple-licensed — CC BY-SA 3.0, Ordnance Survey OpenData licence, and UK Open
  Government Licence v3.0.
- **Required attribution** (already rendered beneath the map on `/postcode-honey`, do not
  remove): *"Map: British postcode areas by Richardguk, CC BY-SA 3.0. Contains Ordnance Survey
  and Royal Mail data © Crown copyright and database right, and National Statistics data ©
  Crown copyright and database right."*
- **Modifications made:** recoloured only, via `src/lib/uk-map-svg.ts` (string replacement of
  specific fill/stroke hex values to the site's dark palette). Geometry is untouched. CC BY-SA
  requires derivative works to carry a compatible license — this recoloured version inherits the
  same licence terms; if this SVG is ever redistributed on its own (not just used within this
  site), keep the same attribution and license notice with it.
- **Interaction data:** the 122 postcode-area codes and their names
  (`src/lib/postcode-areas.ts`) are standard, publicly documented Royal Mail postcode-area
  geography, not derived from or subject to the map's own license.
- **No district-level boundary shapes exist for Bristol, Bath, or anywhere.** The source map only
  has postcode-AREA boundaries (BS, BA, M, EH, ...), not postcode-DISTRICT boundaries (BS1, BS2,
  BS3, ... / BA1, BA2, ...). Zooming into an area with district data shows the real area shape
  zoomed in, with the district list (`src/lib/bristol-districts.ts` for the 37 real BS1–BS49
  districts, `src/lib/bath-districts.ts` for the 19 real BA1–BA22 districts, both cross-checked
  against Wikipedia's postcode-area articles) presented as a plain button grid — not fake drawn
  boundary polygons. `src/components/postcode-map/interactive-uk-map.tsx` looks up which areas
  have district data via `districtDataByArea`; only add an area there once real district data
  exists for it. Do not add invented district shapes to the map; if real district GIS boundaries
  are ever wanted, they'd need sourcing from ONS Open Geography Portal separately (not from this
  file).

## Asian hornet photo

- **File:** `public/images/source/asian-hornet-2026.jpg` (currently used on `/asian-hornets`)
- **Source:** "Asian hornet" (Vespa velutina male) by Gilles San Martin, via Flickr
  (https://www.flickr.com/photos/sanmartin/33283876513) — downloaded directly from Flickr at the
  largest available size (1024px, `..._b.jpg`), not re-hosted from a third party.
- **License:** CC BY-SA 2.0.
- **Required attribution** (already rendered beneath the image on `/asian-hornets`, do not
  remove): *"Photo: Gilles San Martin, via Flickr, CC BY-SA 2.0."* with a link to the license.
- **Modifications made:** none — used as downloaded from Flickr (already at Flickr's max
  available resolution for this photo).
- **How this was found:** the user wanted the male-hornet head photo shown on the Natural History
  Museum's Asian hornet page (nhm.ac.uk), which is itself credited there to "Gilles San Martin via
  Flickr, CC BY-SA 2.0." Rather than using NHM's re-hosted copy (or two other candidates that
  turned out to be unusable — see below), this was tracked back to Gilles San Martin's own Flickr
  upload and downloaded from the original source.
- **Superseded:** `public/images/source/asian-hornet-vespa-velutina.jpg` (Charles J. Sharp, via
  Wikimedia Commons, CC BY-SA 4.0 — also genuinely fine to use, just no longer referenced by any
  page). Two other candidates from the user's media folder were rejected as unverifiable/risky:
  `skynews-asian-hornet-file-generic_6560574.jpg` (Sky News press/wire photo, no redistribution
  rights) and `asian-hornet-head-full-width.jpg.thumb.1920.1920.png` (an auto-generated forum/CMS
  thumbnail filename with no traceable source or license — this turned out to be the same NHM
  photo, and once its real source was found via the caption text, that's what's used above instead
  of the untraceable downloaded copy).

## Honeycomb background pattern

- **File:** `public/images/patterns/honeycomb.svg`
- **Source:** hand-authored for this project (plain hexagon geometry, not traced from or based
  on any third-party asset). No attribution required.

## Brand assets (logo, jar photography, label artwork, bee/location photography)

Not third-party — supplied directly by the user from `Z:\Business\Gert _Lush_Honey\Media\`,
confirmed as owned/licensed for commercial use (2026-08-09). See `docs/brand-alignment-board.md`
for the full inventory. Includes `public/images/brand/*` (logo variants, favicon/icon source),
`public/images/source/bees-on-comb.jpg` and `bee-eating-honeycomb.jpg` (from `Media/Bees`), and
`public/images/source/bramble-farm-view.jpg` (from `Media/Bristol`, landscape only — see the
Bramble Farm group-photo note in `docs/brand-alignment-board.md` before using any other photo from
that folder). Also includes `bee-s3-jar-single-professional.jpg` and
`bee-s3-jars-stack-professional.jpg` (from `Media/Products`, the "Professional" studio renders) —
these are staged/generated marketing images, not documentary photography; see
`docs/brand-alignment-board.md`'s photography brief table for the label-text accuracy caveat on
the stack image specifically.
