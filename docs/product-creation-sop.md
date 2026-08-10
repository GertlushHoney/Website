# SOP: Adding a new product

Covers both product types this site supports. Pick the right one first — they're not
interchangeable, and using the wrong one is the most common way to end up with a product that
looks right in Sanity but never appears on the site.

| | Honey Product | Merch Product |
|---|---|---|
| Use for | A new postcode honey (a new jar/beekeeper/area) | Candles, soap, lip balm, gift hampers — anything non-honey |
| Sanity schema | `honeyProduct` | `merchProduct` |
| Linked to a beekeeper? | Yes — required | No |
| Appears on the postcode map? | Yes, via `postcodeCode` | No |
| Category field? | No — always "Honey" | Yes — `candles` / `hamper` / `soap` / `lip-balm` |
| Subscription option possible? | Yes (optional) | No |

Both types share the same shape everywhere else: a Sanity document for content, a Shopify product
for price/stock/checkout, linked by an exact `shopifyHandle` string — never by title, never by
guessing.

## Step 1 — Create the product in Shopify

1. Shopify admin → Products → Add product.
2. Set the title, description, price, and at least one variant with real stock.
3. **Note the exact handle** — Shopify admin → the product → the "Search engine listing" /
   URL/handle field. This is what goes into Sanity, not the title. A handle is
   lowercase-hyphenated (e.g. `bee-s4`, `beewax-candle-skep-and-bees` — yes, a real handle in this
   store has a typo baked in; the handle is whatever Shopify actually has, typo or not).
4. Publish the product to the **Headless** sales channel specifically — if it's only on the
   default Online Store channel, the Storefront API (what this site actually queries) won't see
   it.
5. (Optional, honey products only) If this product should offer a real subscription, create a
   Selling Plan for it via the Shopify Subscriptions app and attach it to this product now — see
   `docs/technical-architecture.md`'s "Subscriptions" section. This can also be done later; the
   subscription option on the site falls back to an honest mailto until a real Selling Plan
   exists, so there's no rush.

## Step 2 — Prepare the product image

The site's product photography uses a consistent treatment: the photo's own edges fade to
transparent via a radial mask, so it blends into each page's dark gradient background instead of
sitting in a hard-edged rectangle. This is what makes `bee-s3-jar-single-professional-blended.png`
look like it belongs on the dark background rather than pasted onto it.

**Script:** `scripts/feather-product-image.mjs` (uses `sharp`, already a project dependency —
verified working 2026-08-10, tested against the real Bee S3 photo and produces an equivalent
result to the existing production image).

```bash
node scripts/feather-product-image.mjs <input> <output> [--start=0.6] [--end=1.0]
```

- `--start` (default `0.6`): how far out (as a fraction of the image, 0–1) the fully-opaque centre
  extends before the fade begins.
- `--end` (default `1.0`): where the image reaches full transparency. `1.0` means the very corners
  are transparent; lower it (e.g. `0.85`) for a tighter, more visible fade.
- Output is always a PNG (needs the alpha channel — feathering a JPEG output would just show
  black/white where the transparency should be).

**Before running it:**
- Start from a photo with a plain, uncluttered background (a studio render or a photo already on
  a flat surface/backdrop works well). This script fades the photo's *own* edges — it doesn't
  remove a busy background first.
- If the source photo has a busy/real-world background that needs removing first, run it through
  background removal (Higgsfield's `image_background_remover` model was used for the very first
  hero shot — see `docs/brand-alignment-board.md`) before feathering.

**After running it:** open the output and check the product itself isn't clipped by the fade —
if a jar's shoulder or a candle's edge gets cut off, the source photo has the subject too close to
the frame edge; re-crop with more headroom and re-run, don't just push `--end` up to 1.0 and hope
(a subject genuinely near the edge will still look wrong even at full radius).

## Step 3 — Upload the image and create the Sanity document

1. Sanity Studio → `/studio` → the relevant document type (Honey Product or Merch Product) →
   Create.
2. Upload the **feathered** image (from Step 2) as `heroImage`, not the raw original.
3. Fill in every required field. Field-by-field notes:

**Honey Product** (`src/sanity/schemaTypes/honeyProduct.ts`):

| Field | Notes |
|---|---|
| `name` | e.g. "Bee S4" |
| `slug` | Auto-generates from name — fine to leave as-is. Drives `/shop/[slug]`. |
| `tagline` | One line, shown on cards and the product page header. |
| `shopifyHandle` | **The exact handle from Step 1**, not the title. |
| `postcodeCode` | A UK postcode **area** code (e.g. `M`) or, for Bristol/Bath specifically, a **district** code (e.g. `BS4`). Only Bristol and Bath have district-level data on the map (`src/lib/bristol-districts.ts`, `bath-districts.ts`) — a district code for anywhere else won't have a matching map location. Use an area code for anywhere outside Bristol/Bath. |
| `beekeeper` | A reference to an existing `beekeeper` document — create that first if the beekeeper isn't in Sanity yet. |
| `heroImage` | The feathered image from Step 2. |
| `weight` | e.g. "12oz / 280ml" |
| `originStory` | Portable text — the "Where it's from" tab content. |
| `subscriptionPrice` | **Leave empty** unless a real Shopify Selling Plan already exists for this product (Step 1.5) — setting a price here without a real plan just shows a subscription option that falls back to mailto, which is fine, but don't set it thinking it creates the plan. It doesn't; the plan is a Shopify-side thing. |
| `deliveryPrice` | Defaults to 4.99, override only if genuinely different. |
| `seasons` | Optional. Fine to leave empty — the data layer already handles a product with no seasons set (`coalesce(seasons, [])` in `src/lib/sanity/products.ts`). |
| `active` | **Defaults to `true`.** Turn off if you're not ready to publish yet. |

**Merch Product** (`src/sanity/schemaTypes/merchProduct.ts`):

| Field | Notes |
|---|---|
| `name` | e.g. "Beeswax Candle — Skep and Bees" |
| `slug` | Auto-generates from name. Drives `/shop/[slug]` — this is the product's own page, **not** the category page. |
| `category` | Pick from the dropdown (`candles`/`hamper`/`soap`/`lip-balm`). This is what puts the product on `/shop/{category}` — it has nothing to do with the slug. (This field exists specifically because an earlier version of this schema conflated the two and broke the first real candle — see `docs/requirements-matrix.md`'s Shop row for the story. Don't reintroduce that conflation.) |
| `tagline` | One line. |
| `shopifyHandle` | The exact handle from Step 1. |
| `heroImage` | The feathered image from Step 2. |
| `description` | Portable text, shown on the product page. |
| `deliveryPrice` | Defaults to 4.99. |
| `active` | **Defaults to `false`** for merch products — turn it on explicitly once it's genuinely ready to sell. Until then it just won't appear anywhere, which is the point. |

## Step 4 — Verify it live

Don't consider this done until checked in a running dev server, not just "looks right in Sanity":

1. `/shop` — the category tile shows this product's tagline (if it's the only one in that
   category) or an updated count.
2. `/shop/honey` (honey products) or `/shop/{category}` (merch) — the product card appears with
   live Shopify price.
3. `/shop/[slug]` — the product's own page: image renders (not broken/missing), price and stock
   are live and correct, "Add to basket" works, the "Back to X" link at the top goes to the right
   place.
4. Honey products only: `/postcode-honey` — the postcode/district shows this product instead of
   the waiting-list state.
5. Check the browser console and dev server logs for errors while doing all of the above — a
   silently-swallowed Shopify lookup failure (wrong handle, product not on the Headless channel)
   shows up as "Pricing is temporarily unavailable" on the product page rather than a crash, so it's
   easy to miss if you don't actually look.

## Known gotchas (from real bugs hit building this site)

- **Handle, not title.** Shopify lookups are always by exact `shopifyHandle` string. A typo in the
  handle (or pasting the title instead) fails silently — the product page just shows "pricing
  temporarily unavailable," not an error naming the mismatch.
- **Not on the Headless channel = invisible to the Storefront API**, even if the product is
  published and live on the normal Online Store.
- **Merch category ≠ merch slug.** The category dropdown decides which listing page a product
  appears on; the slug decides its own URL. Don't derive one from the other.
- **`active` defaults differ by type** — `true` for honey products, `false` for merch products.
  This is deliberate (merch products need an explicit "yes, sell this" step) but easy to forget
  when copy-pasting between the two schemas.
- **District codes only work for Bristol/Bath.** A district-style code for anywhere else won't
  match anything on the map.
- Adding `cdn.sanity.io` to `next.config.ts`'s `images.remotePatterns` is a **one-time** project
  setup step, already done — not something to redo per product. If a new Sanity image ever 404s
  with a "hostname not configured" error, that's a sign this config broke, not something wrong
  with the product.
