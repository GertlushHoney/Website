# Competitive design review

Screenshotted live 2026-08-07 (not from memory) for a direct visual comparison, alongside
apple.com as the stated simplicity benchmark.

## What the honey competitors actually do

| Site | Platform tell | Pattern |
|---|---|---|
| Manchester Honey Co | Wix | Centred logo lockup, blurred stock-photo hero, serif italic headline as if it were a blog post title, not a product |
| Simply Raw Honey | Generic WooCommerce-ish | Dark header, dot-separated all-caps nav (`HOME • SHOP HONEY • ...`), full-bleed macro photo with a bold italic headline slapped on top |
| Bristol Beekeepers | WordPress default | Honeycomb-yellow banner with a decorative grass-illustration divider — literally the "generic yellow-and-black honeycomb aesthetic" the brand guidelines name as something to avoid. Not a commerce site, so lowest relevance anyway. |
| Llangattock Apiaries | Shopify (stock theme) | Orange utility bar, sticky nav with **8 top-level items**, hero over macro honeycomb photo, a row of 6 emoji trust badges, then a row of 4 icon badges — badge soup before any product is shown |
| The Bee Shop | Shopify (stock theme) | Black promo bar, **11 nav items with dropdowns** (jewellery, ceramics, candles, courses...), hero is a busy gift-basket photo collage, cookie-consent modal covers a third of the first screen |

Common failure mode: they all lead with *decoration* (badges, banners, blurred backgrounds,
category sprawl) before they lead with the *product*. None of them would survive an "Apple
test" — remove everything that isn't the product, the proposition, and one clear action, and
see what's left.

## What apple.com actually does

- Thin, dismissible utility bar (region selector) — separate from the real nav, never repeated.
- Nav: one logo mark, ~10 short text links, tiny type (13px), no icon clutter beyond
  search/bag, translucent on scroll.
- Hero: huge bold headline (the product name itself, not a sentence), one six-word subhead,
  **two pill buttons side by side** — a filled dark "Learn more" and an outlined "Shop [product]"
  — then the product photograph, large, isolated, on a flat neutral background.
- No badges, no icon rows, no carousels, no cookie modal blocking the fold.
- Repeats this single-product-per-panel rhythm down the page — it's not that Apple has one
  section, it's that every section behaves like its own tiny, disciplined homepage.

## What this means for Gert Lush Honey

The existing homepage build (hero / featured-product / location-story, each full-bleed,
one idea per panel) already follows Apple's stacking pattern rather than the competitors'
badge-and-carousel pattern — kept as-is. Changes made in this pass, directly reacting to the
comparison above:

1. **Twin-pill CTA pattern** replacing the filled-button + underlined-text-link pairing, to
   match Apple's "Learn more / Shop X" button pair exactly (`src/components/homepage/hero.tsx`).
2. **Bold sans headline for site-wide moments** (Manrope, not the softer Fraunces serif) — closer
   to Apple's typographic confidence. The serif is kept, deliberately narrowed to "Bee S3"
   product-name badge moments only, echoing the label's own logotype rather than competing with
   it for every headline on the site.
3. Tighter nav, more vertical breathing room in each panel, no badge rows, no promo bars, no
   cookie modal on load (cookie consent still needs implementing before launch, but as a
   dismissible, non-blocking control per the Brief's privacy section — not a Bee-Shop-style
   modal covering the hero).

## What to deliberately keep avoiding

- Any nav with more than ~6 top-level items or dropdown mega-menus (Llangattock, Bee Shop).
- Emoji/icon trust-badge rows (Llangattock).
- Honeycomb-yellow-dominant backgrounds or decorative hexagon/grass illustration bands (Bristol
  Beekeepers) — the brand guidelines already flag this, and seeing it live on a competitor makes
  the reasoning concrete.
- A cookie-consent modal that blocks the first screen (Bee Shop) — implement as a slim banner or
  corner control instead, when consent tooling is built (Phase 9).
