# Brand alignment board

Required checkpoint per `Brand Identity and Packaging Guidelines.docx`: *"Do not proceed to
final visual development until the website direction clearly feels consistent with the supplied
Gert Lush Honey packaging."*

**Correction (2026-08-07):** an earlier version of this document said no jar/label photography
had been supplied. That was wrong — it existed in `Z:\Business\Gert _Lush_Honey\` (outside the
`Website` subfolder this build initially focused on), just not yet reviewed. It has now been
reviewed. The section below replaces the earlier provisional-only assessment.

**Direction change (2026-08-07, same day):** the user asked for a dark, warm and moody theme
instead of the light Porcelain-first palette this document originally settled on. Ink (`#14110d`,
darkened slightly from the original `#171717` for more depth) is now the default site
background; Porcelain is now the default text colour and used sparingly as a light accent
rather than the default surface. This isn't a reversal of the colour audit below — it's a
straightforward flip of which token is "default" versus "accent", and it fits the real product
better: the physical label is black-and-gold, so a dark site now matches the jar itself, not
just the logo. The `emblem_logo.png` variant (gold on black, `public/images/brand/
emblem-gold-on-black.png`) is used for the new splash screen for the same reason — it's an
official brand asset, not a new invention.

**Photography enhancement:** the hero jar shot's background was removed via Higgsfield
(`image_background_remover` model) to get a clean product cutout
(`public/images/source/bee-s3-jar-cutout.png`), composited onto a dark radial-gradient backdrop
in code. This is the real, unedited product — only the background changed, not the jar or
label. No AI-generated (invented) product imagery has been used anywhere on the site.

## What actually exists

- **A real photographed jar** (`BeeS3 Honey Jar.JPG`): hexagonal glass jar, brushed-gold lid,
  runny amber honey, black label with gold foil detail. This is the actual physical product,
  not a mockup.
- **Finished, print-ready label artwork** (`Lables/` — many size/format variants: gold-on-black,
  black-and-white, transparent/white-backed, multiple print pack iterations). The current
  "final" version (`Bee_S3_label_UPDATED_FINAL_GOLD_BLACK_144mm_x_60mm_v7`) and the packaging
  mockup (`Bee_S3_mockup_three_label_PRINT_PACK/Bee_S3_packaging_mockup_reference.png`) show:
  - **Front:** hexagon + bee mark, "Bee S3" in a large serif display face, "Pure honey from the
    Northern Slopes", "12OZ / 280ML".
  - **Left side:** "Origin: United Kingdom", a short provenance paragraph ("carefully harvested
    from hives nestled on the northern slopes, where wild flora thrives and bees forage
    freely"), botanical line-art sprig.
  - **Right side:** business address ("14 Beckington Road, Bristol BS3 5EB"), blank expiry-date
    and batch-number fields (i.e. the batch system in the docs isn't populated on labels yet).
- **Real location photography:** `Northern_Slopes_Main.jpg` — a genuine photo from Bristol's
  **Troopers Hill / Netham "Northern Slopes"** greenspace overlooking the city, matching the
  label copy exactly (this is a real named place, not an invented marketing phrase).
  `Bramble Farm views 1.jpg` / `.avif` / `.webp` and `Bramble Farm logo.png` — a real community
  growing site, **Bramble Farm, Knowle** (Bristol), which appears to be the actual apiary
  context. Clifton Suspension Bridge photos (day/night/mist) for general Bristol identity.
- **Multiple logo variants** (as previously documented): black-on-white, gold-on-cream,
  gold-on-black, icon-only, reversed.

This means the "BS3 postcode / GL-XX-BS3-S26-01 batch code / beekeeper-attribution" system
described in the project pack docs is the *target* data model, not yet reflected on the
existing label run — the real label currently says "Bee S3" / "Northern Slopes" with blank
batch fields. Treat the docs' postcode/batch/beekeeper framework as the plan to grow into, and
the existing label as the current real-world starting point. These aren't in conflict, but the
website copy should match what's actually on the jar today (Bee S3, Northern Slopes, 12oz),
not invent postcode/batch details the label doesn't yet carry.

## Colour system (now confirmed against the real product, not just the logo)

| Token | Hex | Status |
|---|---|---|
| Ink | `#171717` | **Confirmed** — matches the label's black background closely. |
| Porcelain | `#F7F5EF` | Plausible for page backgrounds; the jar itself sits on plain white/wood in the reference photos, not porcelain-cream — minor gap, not a conflict. |
| Honey Amber / Comb Gold | `#D99614` / `#F2C35B` | **Confirmed direction** — the label's gold foil is warmer/more metallic than either flat hex, exactly as the guidelines predicted ("where a printed metallic gold cannot be accurately reproduced on screen, create a refined flat digital gold"). Comb Gold is the closer everyday-web match; reserve richer gradients/photography for moments that need to evoke actual foil. |
| Bristol Brick, Garden Green, Soft Stone | as before | Still provisional — not present on the label itself, kept for supporting/editorial use only. |

## Typography

The label's "Bee S3" display face is a confident serif with moderate contrast between thick and
thin strokes — closer to a Didone/transitional serif (in the family of Playfair Display,
Freight Display, or the logo pack's own custom lettering) than the previously-guessed Fraunces,
which reads softer/more humanist. **Action:** swap the site's display font for something closer
to this register (Playfair Display is a solid open-source match and a reasonable interim
choice) — flagged as a near-term fix, not done in this pass since it touches the whole type
scale and deserves its own review pass. The small-caps sans/serif used for "PURE HONEY FROM THE
NORTHERN SLOPES" and the side-panel body copy is plainer and closer to what Manrope already
provides for UI text.

## Illustration

The hexagon + bee mark and a single botanical line-sprig are the confirmed illustrative
vocabulary — matches the guidelines' instruction to use these "selectively" rather than as a
repeating pattern. No other illustration exists; still nothing to invent here.

## Photography brief status (revised again — real batch photos found 2026-08-07)

| Asset needed | Status |
|---|---|
| Front-facing / three-quarter jar shot | **Have it** — swapped to `Professional - Single Jar BeeS3.png` (2026-08-09, used sitewide as `bee-s3-jar-single-professional-blended.png` — edges feathered to transparent via a radial alpha mask so the photo's own background blends into each section's dark gradient instead of a hard rectangle edge; the unfeathered original is kept as `bee-s3-jar-single-professional.jpg` but nothing references it). This is a staged/generated studio render, not documentary photography, but the label text on it is accurate and legible ("BEE S3 / PURE HONEY FROM THE NORTHERN SLOPES / 12OZ / 280ML"). Superseded `bee-s3-jar-cutout.png` and `bee-s3-jar-front.jpg`, which are no longer referenced anywhere. |
| Jar on dark background, packaging mockup | **Have it** (professional mockup already produced, `label-mockup-three-panel.png`) |
| Bristol/location context | **Have it** — Northern Slopes, Clifton Suspension Bridge |
| Batch/jarring, "real production" proof | Homepage now uses `Professional  - Stack of BeeS3 Jars.png` (2026-08-09, as `bee-s3-jars-stack-professional.jpg`), used at the user's request despite a caveat raised: it's a staged/generated render and the label text is garbled/inconsistent across most of the jars in it (not legible/accurate the way the single-jar shot is) — alt text was written to describe the image honestly ("Stacked jars of Bee S3 honey") rather than claim it's a real production batch. The original real, informal home-kitchen photos of an actual jarred batch (`bee-s3-jars-stack-1/2.jpg`, hand-crank honey extractor visible, confirms the label prints **"ORIGIN: BRISTOL, UK"**) still exist in `public/images/source/` if a documentary-style photo is wanted again later — they're just no longer referenced in any page. |
| Apiary environment | **Have it, partially** — Bramble Farm photos show a community growing site, not hives specifically; no photo of actual hives/frames/bees yet. `Bramble Farm  views 1.jpg` shows identifiable people at a community event — do not publish it without explicit consent from those pictured. `Bramble Farm 2.webp` (landscape only, no people) is used instead, e.g. on `/gifts` for the Bee Day Experience card |
| Honey pour, texture macro, honey on toast/yoghurt | **Still missing** |
| Jar history by season | **Have it, partially** (2026-08-09) — real unlabelled harvest photos for 2023 (`jar-history-2023.jpg`, amber-copper), 2025 (`jar-history-2025.jpg`, dark), and 2026 (`jar-history-2026.jpg`, pale gold), from `Media/History/BeeS3`. 2024 photo not yet supplied — shown as an honest "photo still to come" placeholder on the product page's "Season by season" tab rather than skipped or invented. |
| Beekeeper portrait | **Still missing** (name confirmed 2026-08-09 — Adam — but no photo yet) |
| Gift-box presentation | **Still missing** (no gift product exists yet) |

## A note on photography style

The batch photos are genuine home-production shots, not studio work — natural light, a kitchen
counter, household clutter in the background. This is honest and consistent with a real
small-batch operation, and arguably supports the brand's "premium but not corporate" positioning
better than a sterile studio shot would. The hero/product-page treatment should crop and
present these confidently rather than trying to disguise their origin — but a decision is still
needed on whether launch imagery leans fully into this authenticity or gets a lighter studio
pass (consistent background, controlled lighting) before going live. Not resolved in this pass.

## Outstanding before full sign-off

Genuinely small now: a beekeeper portrait, hive/harvest-in-progress shots, and honey-texture/
usage photography (pour, toast, yoghurt). Everything else the guidelines' checkpoint asks for
(colour, type direction, packaging-to-web comparison) can be done properly now that real assets
exist — see `public/images/source/` in the codebase for the working copies now in use.
