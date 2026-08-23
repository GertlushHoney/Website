# Technical architecture

## Frontend architecture

- Next.js 16 (App Router, Turbopack), React 19, TypeScript strict mode.
- React Server Components by default; `'use client'` only for interactive leaf components
  (basket drawer, forms, search overlay, map).
- Tailwind CSS v4 (CSS-first config via `@theme` in `src/app/globals.css`), no large UI
  component framework (per the "do not install a large UI component framework" instruction in
  `Gert Lush Honey Website Project.docx`).
- Path alias `@/*` → `src/*`.

## Route structure (App Router)

The original Phase-numbered plan below never fully matched what got built — here's the real
tree under `src/app/(site)/`, all of it real content (no `ComingSoon` stubs remain):

```
src/app/(site)/
  layout.tsx                 global shell: header, footer, splash, cookie prefs, cart, popup
  page.tsx                   homepage
  shop/                      /shop hub, /shop/[slug] (honey + merch), and per-category pages
                              (honey, candles, hamper, soap, lip-balm, experiences)
  postcode-honey/            postcode/region hub with the interactive UK map
  beekeepers/                directory + /beekeepers/[slug] profile
  our-story/                 brand story
  stockists/                 locator, become-a-stockist
  becoming-a-beekeeper/      supplier-facing beekeeper recruitment page
  become-a-supplier/         bulk-honey supplier enquiry page
  asian-hornets/             yellow-legged hornet awareness page
  sustainability/            hive-sourcing/equipment page
  delivery/, faqs/, information/
  contact/                   real contact form (src/components/contact/contact-form.tsx)
  thank-you/                 post-checkout newsletter signup, pre-filled from order confirmation
  legal/                     privacy, cookies, terms, accessibility
  studio/[[...tool]]/        embedded Sanity Studio (behind its own permanent password gate —
                              see "Pre-launch and permanent access control" below)
  tools/feather-image/       internal photo-prep helper — see launch-checklist.md point 8
```

## Content ownership: Sanity vs Shopify

Per the commercial model (`Revised Commercial Model.docx`), Gert Lush Honey purchases,
intakes, packs and sells the honey — beekeepers do not have seller accounts. This shapes the
data split:

| Sanity owns | Shopify owns |
|---|---|
| Homepage editorial sections | Products, variants, prices |
| Beekeeper profiles | Inventory, stock states |
| Apiary profiles | Discounts, gift cards |
| Postcode/area content | Basket, checkout, orders |
| Batch Passport content | Customer commerce data |
| Journal, recipes, FAQs | |
| Stockists, corporate/wholesale landing copy | |

**Reference, don't duplicate.** Each Shopify product carries a metafield
(`custom.sanity_batch_ref`) pointing at the Sanity `honeyBatch._id` it was packed from. Sanity's
`honeyBatch` and `product` (a thin pointer document) carry the matching Shopify `productId`/
`handle`. Neither system is the single source of truth for the other's data — Shopify never
stores beekeeper bios; Sanity never stores stock counts.

## Sanity content model

The real schema in `src/sanity/schemaTypes/` (superseding the original Project Pack entity list,
which was never fully built out — this is what actually exists):

- `beekeeper` — name, slug, portrait, bio, quote, general area, active status.
- `honeyProduct` — name, slug, tagline, Shopify handle, postcode code (area or Bristol/Bath
  district), beekeeper reference, hero image, weight, origin story, optional subscription price,
  delivery price, optional season-by-season photos, active flag. Drives `/shop/[slug]` and the
  postcode map.
- `merchProduct` — name, slug, category (candles/hamper/soap/lip-balm/experiences), tagline,
  Shopify handle, hero image, description, delivery price, active flag. Shares the `/shop/[slug]`
  URL space with `honeyProduct`.
- `shopTile` — optional per-category image/label/fit override for the `/shop` home page tiles;
  falls back to a code-level default image when no document exists for a category (see
  `src/lib/sanity/shop-tiles.ts`).
- `newsletterPopup` — heading, body, discount code/label, button label, delay, enabled flag for
  the once-per-session popup.
- `productReview` — productSlug, reviewerName, rating (1-5), body, submittedAt, approved
  (default `false`). Public submission via `src/lib/sanity/submit-review.ts`; only
  `approved == true` reviews are ever queried for display (`src/lib/sanity/reviews.ts`) — see
  "Product reviews" below.

Exact hive coordinates are never stored in a field exposed to the public GROQ queries — only
`honeyProduct.postcodeCode`/`beekeeper` general area are public; any precise coordinate field (if
ever added) must be access-controlled separately.

## Product reviews

Every product page (`/shop/[slug]`, both `honeyProduct` and `merchProduct`) shows a
`ReviewsSection` (`src/components/product/reviews-section.tsx`): an average-rating summary, the
list of approved reviews, and a submission form (`review-form.tsx`). Submissions never appear
publicly on their own — every new `productReview` document is created with `approved: false`
(`src/lib/sanity/submit-review.ts`) and only shows once someone flips that to `true` in Studio.
No seeded/fake reviews; a product with none shows an honest "No reviews yet" state.

Writing a review requires create access to Sanity, which the read-only
`SANITY_API_READ_TOKEN` everything else uses doesn't have — see "Security boundaries" below for
`SANITY_API_WRITE_TOKEN`.

## Data-fetching pattern

- Server Components fetch directly (Shopify Storefront API via `fetch` with tagged caching;
  Sanity via `next-sanity`'s client or a thin GROQ wrapper) — no client-side data fetching for
  content that can be rendered on the server.
- Caching: Shopify product/collection reads tagged and revalidated via `revalidateTag` on
  webhook (Phase 3); Sanity reads use `perspective: 'published'` in production and
  `previewDrafts` behind a signed preview token (editor preview, Phase 2).
- No `dynamicIO`/`cacheComponents` opt-in yet (Next.js 16 stable-but-still-early feature) —
  revisit once real traffic patterns exist.

## Basket architecture

- Shopify Cart API (`cartCreate`, `cartLinesAdd/Update/Remove`) is the only basket state.
- Cart ID persisted in an HTTP-only-adjacent cookie (readable client-side is fine — it's not a
  secret, just an ID) so the basket survives a session.
- Basket UI is a client component (drawer) that calls a thin Server Action wrapper around the
  Shopify mutations — the Storefront token never reaches the browser.

## Checkout handoff

- "Proceed to checkout" sends the customer to the Shopify-hosted `cart.checkoutUrl`, styled via
  Shopify's standard checkout branding (logo/colours/fonts). Advanced checkout customisation
  (checkout extensibility, custom checkout UI) requires Shopify Plus and is explicitly out of
  scope for launch, per the headless Project Pack.

## Subscriptions

The user has asked for a monthly-subscription purchase option on product pages (2026-08-08) —
this **supersedes** the Project Pack's "complex subscription management explicitly deferred from
launch" guidance for the front-end presentation. `src/components/product/purchase-options.tsx`
presents the real choice (one-time vs. monthly) today; one-time purchases go through the real
Shopify basket (see "Basket / cart" above).

**No minimum term (decided 2026-08-10, dropped the original 6-month term):** cancel any time,
with at least 7 days' notice before the next charge. This was a deliberate trade against
building/paying for a subscriptions app with commitment-term enforcement — see below.

**Billing date is per-subscriber, not a shared fixed date (changed 2026-08-22):** the original
copy described everyone billing on "the 1st of the month," which meant a customer subscribing
late in the month could be charged again just days later. Billing now anniversaries off each
subscriber's own signup date instead — this is Shopify Subscriptions' own default behaviour, so
no extra configuration was needed, just correcting the site copy (Terms, Refund Policy, Purchase
Options) to describe it accurately.

**Selling Plan provider decision:** researched during the 2026-08-10 session, confirmed directly
against Shopify's own docs (not assumed):

- The free, native **Shopify Subscriptions** app only lets a merchant configure a title, an
  optional discount, and a delivery/billing interval — there's no setting for a minimum number of
  billing cycles or restricting cancellation. That's exactly why the 6-month minimum term was
  dropped: enforcing it would have required a paid third-party app (Recharge, Skio, Bold — all
  priced for far higher subscription volume than a two-product catalogue needs). Since the real
  policy is now "cancel any time, 7 days' notice," **the free app is sufficient** and is the
  chosen provider — no paid subscriptions app needed.

**Real subscriptions are live (2026-08-10).** The user installed the free Shopify Subscriptions
app and created a real Selling Plan in Shopify admin (an admin-only step this codebase has never
had credentials to do itself). Verified end-to-end for Bee S3: choosing "Subscribe monthly" now
adds a real recurring line to the same Shopify basket as one-time purchases, going through the
same live checkout.

- `PRODUCT_BY_HANDLE_QUERY` (`src/lib/shopify/queries.ts`) fetches the product's
  `sellingPlanGroups` → `sellingPlans`, so `getProductByHandle`
  (`src/lib/shopify/product.ts`) returns a real `subscriptionSellingPlanId` (`null` for any
  product with no plan attached yet — never invented).
- `addToCart` (`src/lib/shopify/cart.ts`) takes an optional `sellingPlanId` third argument,
  passed into the `cartCreate`/`cartLinesAdd` line item alongside `merchandiseId`/`quantity` — the
  Storefront API's real subscription mechanism (not the old checkout mutation, which Shopify
  deprecated for subscriptions).
- `PurchaseOptions` takes a `subscriptionSellingPlanId` prop: when set, "Subscribe monthly" +
  "Add to basket" creates a real recurring cart line; when `null`, the subscription option still
  shows (if `subscriptionUnitPrice` is set in Sanity) but falls back to the same honest mailto
  used everywhere else — verified this fallback still works correctly for any product without a
  plan attached.
- **Real bug found and fixed during verification:** the cart line's displayed price initially came
  from the plain `merchandise.price` (the variant's base price, £8.00), not the price the selling
  plan actually charges — so a subscription line showed "£8.00/month" while the cart's own
  subtotal correctly totalled £7.00. Also hit a wrong field-name guess
  (`SellingPlanAllocation.perDeliveryPrice` doesn't exist in this API version) — confirmed the
  real field name via a live introspection query against the store rather than guessing twice:
  `checkoutChargeAmount`. `CartLine.price` now reads
  `sellingPlanAllocation.checkoutChargeAmount` when present, falling back to the variant price for
  ordinary one-time lines. `CartLine.sellingPlanName` labels a line "monthly" in the basket
  drawer.
- Requires the `unauthenticated_read_selling_plans` Storefront API scope on the Headless channel —
  confirmed working, no scope changes were needed.

Any future honey product needs its own Selling Plan attached in Shopify admin before its
subscription option goes live — until then it correctly falls back to the mailto flow, same as
Bee S4 does today (no `subscriptionPrice` set in Sanity yet, so its subscription option doesn't
show at all).

**Re-verified live end-to-end (2026-08-22)**, after the billing-date copy changes above:
subscribing to Bee S3 still adds a real `£7.00/month` recurring line to the Shopify basket,
distinct from a one-time line, ready for genuine checkout — confirms the Selling Plan detection
and cart wiring weren't affected by the copy-only changes.

## Form submission architecture

The real forms — newsletter signup (`subscribeToNewsletter`), restock alerts
(`src/lib/shopify/restock.ts`), product reviews (`src/lib/sanity/submit-review.ts`), and the
contact form (client-side only, see below) — follow the same shape (this replaces an earlier,
never-actually-built plan that assumed Zod and a CRM provider):

1. Client component (`'use client'`) with native HTML validation (`required`, `type="email"`,
   `minLength`/`maxLength`) plus ARIA error text (`role="alert"`) for anything the server
   rejects.
2. A plain async Server Action re-validates manually (e.g. `!email.includes('@')`,
   `body.length < 10`) — no Zod dependency; the project never actually adopted it despite an
   earlier plan to.
3. Spam protection via a honeypot field (a visually hidden input real visitors never fill in;
   a filled one reports success without writing anything, so a bot doesn't learn it was
   rejected) — used on the restock, review, and contact forms. No visible CAPTCHA, deliberately
   avoided for the accessibility cost; the contact form additionally has a simple arithmetic
   "what's X + Y?" human check, since it has no server round-trip to rate-limit.
4. Where there's somewhere real to write to (Shopify customer tags, a Sanity document), the
   action writes there. The **contact form** is the exception: it has no backend at all — it
   assembles a `mailto:` link entirely in the browser at submit time and hands off to the
   visitor's own mail client, specifically so the address never appears as literal text in this
   page's server-rendered HTML (a bot scraping the page source has nothing to harvest).

No CRM/email-marketing provider has been added — Shopify Email (via the Shopify account already
in use) is what actually sends the newsletter and marketing emails; no separate service like
Klaviyo was ever needed or added.

**Email routing (changed 2026-08-22):** every mailto address across the site moved from a single
personal Outlook address to role-based addresses on the real `gertlushhoney.co.uk` domain, split
by what the enquiry is about rather than one shared inbox:

- `gdpr@` — Privacy Notice (data rights, data protection complaints)
- `complaints@` — Delivery page, Accessibility Statement, Refund Policy (order problems, damaged/
  missing parcels, refund/cancellation requests)
- `sales@` — Stockists, product waitlists, "email to order/subscribe" fallbacks, subscription
  management
- `suppliers@` — Become a Supplier (split out 2026-08-22, previously shared `sales@`: a beekeeper
  offering to supply honey is a different kind of contact from someone wanting to buy something)
- `hello@` — the Contact form and Terms page's general legal contact line

All five currently land in one shared inbox via Microsoft 365 aliases (not separate mailboxes) —
the "To" address is what lets a human triage by eye.

## Legal pages

- **Refund Policy** (`/legal/refund-policy`, added 2026-08-22) — previously just a vague,
  unconfirmed cancellation-rights mention on the Terms page. Covers the 14-day UK distance-selling
  cancellation right (and its unresolved food-product caveat), damaged/faulty item handling, and
  subscription cancellation — routed to `complaints@`. Linked from the footer's Legal section and
  the "Returns" link (previously pointed at Delivery).
- **Privacy Notice discloses Shopify Network Intelligence** (added 2026-08-22) — this Shopify
  platform feature (Settings → Customer privacy) uses aggregated merchant-network data for fraud
  protection and its own product features, described by Shopify as improving "ad targeting."
  Disabling it was considered and rejected: the confirmation dialog revealed it's bundled with
  abandoned-checkout emails, Shopify Email campaigns, and Shop app functionality, all of which
  would stop. Kept enabled; the Privacy Notice was updated instead to honestly disclose it and
  clarify no Facebook/Google/TikTok ad integrations are connected, so it doesn't result in
  cross-site ad retargeting.
- Shopify's own Settings → Policies fields (Privacy policy, Terms of service, Shipping policy,
  Refund policy) are kept as condensed copies of the equivalent real page, with a link back to the
  full version — not Shopify's auto-generated templates, which describe capabilities (targeted
  advertising, pre-orders, try-before-you-buy, self-service subscription management before it was
  real) this store doesn't have.

## Image management

- Real product/lifestyle photography now exists (`public/images/source/`,
  `public/images/shop-tiles/`, plus Sanity-hosted images for editorial content) — the "no
  photography yet" placeholder era is over. `next.config.ts` `remotePatterns` covers
  `cdn.sanity.io` and `cdn.shopify.com`.
- No stock photography as final content, per brand instructions — placeholders (where content
  genuinely doesn't exist yet, e.g. an unphotographed product) stay visually inert rather than a
  fake "product" image.
- One AI-generated graphic exists on the homepage (the Postcode Honey section's hexagon-cluster
  illustration, `public/images/source/postcode-hexagon-cluster.png`) — an original brand-coloured
  illustration, not photography and not traced from any third-party map data (an earlier
  generation attempt accidentally drew a real country's outline; regenerated with that explicitly
  ruled out before use).
- `/images/*` is deliberately excluded from the pre-launch password-gate middleware (see
  "Pre-launch and permanent access control" below) — `next/image`'s local image optimizer fetches
  files from this path directly and uncredentialed, so gating it breaks every local `<Image>`
  with a confusing "isn't a valid image" error.

## Search

Real, built (`src/lib/search.ts`, `src/components/layout/search-overlay.tsx`) — not the
originally-planned Shopify predictive search or Algolia. The whole product catalogue (honey +
merch, from Sanity) is fetched once server-side and flattened into a simple list, then filtered
client-side as the visitor types in the header's search overlay. No separate search index/API —
deliberately trivial at this catalogue size; revisit only once the catalogue is large enough
that fetch-and-filter stops being cheap.

## Analytics

**Vercel Web Analytics is live** (`@vercel/analytics`, `<Analytics />` in
`src/app/(site)/layout.tsx`, added 2026-08-16) — chosen over Google Analytics specifically
because it collects no cookies and nothing that identifies a visitor: sessions are hashed from
the incoming request and discarded after 24 hours, with only anonymous/aggregate data recorded
(page URL, referrer, rough geolocation, device type). Confirmed against Vercel's own privacy
documentation before shipping, not assumed. Because it sets no cookies, UK PECR's
cookie-consent requirement doesn't apply to it, so it loads unconditionally rather than behind
the cookie-preferences toggle (`src/components/legal/cookie-preferences.tsx`) — see
`/legal/cookies` and `/legal/privacy` for the visitor-facing explanation, which must stay in
sync with whatever analytics does or doesn't run.

Shopify's own dashboard (Admin → Analytics) separately tracks every sale/conversion at checkout
already, with zero extra setup, since checkout happens on Shopify's own domain regardless of
this headless frontend.

The original Project Pack section 15 event taxonomy (`view_product`, `add_to_cart`,
`begin_checkout`, `purchase`, etc.) was never implemented — Vercel Web Analytics only tracks
page views, not custom commerce events. Revisit if funnel-level detail is ever needed; would
require either Vercel's custom-events API or a different tool, and — unlike page-view analytics
— would very likely need consent-gating depending on what it captures.

## Error handling

- Route-level `error.tsx` boundaries per top-level segment (Phase 1 follow-up).
- Shopify/Sanity fetch failures degrade to a clear "temporarily unavailable" state, never a
  silent empty page — commerce failures must never look like "sold out" or "not found".

## Deployment

- Target: Vercel (matches the docs' "Vercel-compatible deployment" requirement).
- Environments: local (mocked data, no credentials required) → preview (per-PR, Vercel preview
  deployments) → production.
- Secrets live in Vercel project environment variables, never committed. `.env.example`
  documents required names with no values.

## Security boundaries

- `SHOPIFY_STOREFRONT_ACCESS_TOKEN`, `SANITY_API_READ_TOKEN`, `SANITY_API_WRITE_TOKEN`,
  `SITE_PASSWORD`/`SITE_PASSWORD_USER`, and `STUDIO_PASSWORD`/`STUDIO_PASSWORD_USER` are all
  server-only env vars (no `NEXT_PUBLIC_` prefix) — never sent to the client.
- The Storefront API token is scoped to storefront read/cart-write only. The Shopify Admin API
  is used for exactly one thing (2026-08-12): tagging a customer with which sold-out product
  they want a restock alert for (`src/lib/shopify/admin-client.ts`,
  `src/lib/shopify/restock.ts`), scoped to `read_customers`/`write_customers` only — separate
  credentials (`SHOPIFY_ADMIN_CLIENT_ID`/`SHOPIFY_ADMIN_CLIENT_SECRET`, exchanged server-side for
  a short-lived token via OAuth client_credentials, never a long-lived static token), server-only,
  never referenced from any client-reachable code path. Nothing else in this codebase touches the
  Admin API.
- `SANITY_API_WRITE_TOKEN` (2026-08-16) is kept separate from the read-only `SANITY_API_READ_TOKEN`
  for the same reason — narrow, purpose-specific credentials rather than one token doing
  everything. It has Editor (create) permission and is used only by
  `src/lib/sanity/submit-review.ts` to create unapproved `productReview` drafts.
- All external input (forms) validated server-side manually (see "Form submission architecture"
  — no Zod, despite an earlier plan to use it) regardless of client-side validation.

## Pre-launch and permanent access control

Two independent HTTP Basic Auth gates in `src/middleware.ts`, checked by request path:

- **Site-wide gate** (`SITE_PASSWORD_USER`/`SITE_PASSWORD`, added 2026-08-14) — every route
  except the Studio-gated paths below and the exclusions further down. Temporary: meant to be
  removed (unset both env vars) once the site is ready for real visitors. Exists because the
  site went live on Vercel with a real Shopify checkout and real Sanity content before it was
  ready to be found.
- **Studio gate** (`STUDIO_PASSWORD_USER`/`STUDIO_PASSWORD`, added 2026-08-16) — independent of
  the gate above, and stays in place even after that one's removed at public launch. Covers
  `/studio` (Sanity Studio already has its own real login too — a genuine Sanity account must be
  a project member to do anything there, so this is a second, permanent layer, not a replacement
  for Sanity's own auth) **and** `/tools/feather-image` plus its `/api/feather-image` backend
  (added 2026-08-19 — that internal photo helper has no auth of its own, so it needed to sit
  behind something that outlives the temporary site-wide gate).
- `/_next/static`, `/_next/image`, `/images/*`, and `/favicon.ico` are excluded from both gates
  — see "Image management" above for why `/images` specifically has to be.
- Either gate no-ops (lets every request through) if its own env vars aren't set, so removing a
  gate is just deleting its two env vars, not editing code.
