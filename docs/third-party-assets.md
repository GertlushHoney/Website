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

## Shop category placeholder imagery (AI-generated, 2026-08-10 — mostly superseded 2026-08-10)

- **File still in active use:** `public/images/shop-tiles/gift-hamper-materials.png` — the
  `/shop` tile image for Gift Hampers (see `src/app/(site)/shop/page.tsx`'s `PLACEHOLDER_IMAGE`
  map). Gift Hampers has no real product or curated photo yet.
- **Superseded, same day:** `soap-ingredients.png` and `lip-balm-ingredients.png` were the
  original tile images for Soap and Lip Balm but are no longer referenced anywhere — the user
  supplied real, purpose-made tile photography for both (see "Shop home-tile photography" below),
  which now takes priority. Left on disk, unreferenced, rather than deleted, matching this
  project's usual practice for superseded assets (see the "Brand assets" section below for other
  examples of this pattern).
- **Source (for the still-active Gift Hampers image):** generated via Higgsfield
  (`nano_banana_2`/Nano Banana Pro), at the user's request ("fill the tiles of the shop with an
  image of what's behind it"), after confirming with the user how to handle the fact that these
  categories had no real product or photo at the time.
- **This is the one deliberate exception to the site's "no AI-generated invented product imagery"
  rule (see `docs/brand-alignment-board.md`) — and it's a narrow one.** The image is an abstract
  ingredient/material flat-lay (kraft paper, raffia, dried wheat and eucalyptus — see the exact
  prompt in git history for `src/app/(site)/shop/page.tsx`), deliberately composed to show **no
  finished product**: no wrapped hamper. The intent is texture/mood, not a claim that "this is
  what our hamper looks like." **Do not generate a literal product shot for this category** —
  that would cross into inventing a product that doesn't exist. Replace with a real product photo
  the moment a real Gift Hamper product exists.
- **No attribution required** (Higgsfield-generated, not sourced from a third party), but this
  entry exists so the "AI-generated" fact itself isn't lost track of.

## Shop home-tile photography (real, user-supplied, 2026-08-10)

- **Files:** `public/images/shop-tiles/candles-home-tile.png`, `soap-home-tile.png`,
  `lip-balm-home-tile.png` — the `/shop` tile image for Candles, Soap and Lip Balm respectively
  (see `src/app/(site)/shop/page.tsx`'s `HOME_TILE_IMAGE` map, which takes priority over both a
  real product's own hero photo and the Higgsfield placeholder above).
- **Source:** supplied directly by the user from `Media/{Candles,Soap,Lip Balm}/` — purpose-made
  tile photography, already feathered (soft transparent edges, same treatment as
  `docs/product-creation-sop.md`'s image-prep step) by the time it was handed over. Not
  third-party, not AI-generated.
- **Why a separate image from the product's own listing photo:** these are composed specifically
  for the shop-tile grid (see `src/app/(site)/shop/page.tsx`), which can differ from what looks
  best as an individual product's own hero image on its `/shop/[slug]` page — Candles already has
  a real Sanity `merchProduct` with its own `heroImage` used elsewhere, and this tile photo is
  deliberately layered on top of that specifically for the `/shop` grid, not a replacement for it.

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
