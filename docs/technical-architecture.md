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

```
src/app/
  layout.tsx                 global shell: header, footer, skip link, fonts, metadata
  page.tsx                   homepage
  shop/                      collection + product pages (Phase 5)
  postcode-honey/            postcode hub + [postcode] pages (Phase 6)
  beekeepers/                directory + [beekeeper] profile (Phase 6)
  gifts/                     gifts hub, corporate, weddings (Phase 8)
  our-story/                 brand story, journal, recipes, FAQs (Phase 8)
  stockists/                 locator, become-a-stockist (Phase 8)
  batches/[batch]/           Batch Passport (Phase 7)
  legal/                     privacy, cookies, terms, accessibility (Phase 9)
```

Every route above `page.tsx` currently renders a shared `ComingSoon` stub
(`src/components/ui/coming-soon.tsx`) rather than a 404, so the information architecture is
navigable and testable before content exists.

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

## Sanity content model (Phase 2)

Entities, matching Project Pack section 11:

- `beekeeper` — name, slug, portrait, bio, quote, general area, active status.
- `apiary` — internal code, general area/postcode, forage notes, map precision, belongs to a
  beekeeper.
- `supplierIntake` — supplier ref, apiary ref, harvest/extraction/received dates, weight,
  containers, checks, accept/quarantine/reject status. Internal-only, never queried
  client-side.
- `honeyBatch` — GL batch reference, source intake ref(s), packing date, jar size/count, status,
  tasting notes, colour, texture, likely forage, images. This is what the public Batch Passport
  renders.
- `postcodeArea` — name, slug, map polygon/coordinates, intro copy, waiting-list status
  (available / coming-soon).
- `stockist` — name, address, coordinates, active status.
- `journalArticle`, `recipe`, `faq`, `corporateGiftingPage`, `wholesalePage`,
  `promotionalAnnouncement`, `siteSettings`, `navigation`, `homepage`.

Exact hive coordinates are never stored in a field exposed to the public GROQ queries — only
`apiary.generalArea`/`postcodeArea` are public; any precise coordinate field (if ever added)
must be access-controlled separately.

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
launch" guidance for the front-end presentation, though the *automated billing* side is still a
Phase 3+ concern. `src/components/product/purchase-options.tsx` presents the real choice
(one-time vs. monthly) today and routes both into an honest mailto, since:

- No Shopify store exists yet, so there's no cart/checkout to attach a subscription to.
- Recurring billing requires **Shopify Selling Plans** (native) or a subscriptions app (e.g.
  Recharge) — a deliberate integration decision for Phase 3, not something to wire up ad hoc.

Until that's built, subscriptions are fulfilled manually (the customer emails, Gert Lush arranges
recurring dispatch by hand). When Shopify is connected, replace the mailto branch for
subscriptions with a `sellingPlanId` passed to `cartLinesAdd`, keeping the one-time branch as a
plain product variant add.

## Form submission architecture

Harvest-list, postcode-waitlist, wholesale, corporate-gifting and beekeeper-application forms
all follow the same shape:

1. Client component with accessible validation (native HTML validation + ARIA error text).
2. Server Action validates with a Zod schema mirroring the client schema (never trust the
   client).
3. Server Action writes to the email/CRM provider (provider not yet chosen — candidates:
   Klaviyo, since it integrates natively with Shopify) and records consent (checkbox state,
   timestamp, IP-free — no unnecessary PII).
4. Spam protection via a honeypot field + rate limiting at the Server Action; a visible CAPTCHA
   is deliberately avoided unless abuse is observed (accessibility cost).

## Image management

- Product/lifestyle photography does not exist yet. `next/image` with `remotePatterns`
  configured for the eventual Sanity CDN (`cdn.sanity.io`) and Shopify CDN
  (`cdn.shopify.com`) once those hosts are known.
- No stock photography as final content, per brand instructions — placeholders must be
  visually inert (flat colour, not a fake "product" image) until real photography lands.

## Search

Not yet implemented. Candidate: Shopify's predictive search (`predictiveSearch` Storefront API
query) for product search, since it requires no extra service. Content search (journal,
beekeepers) would need a separate index (e.g. Algolia or a simple client-side Fuse.js index)
only if the content volume justifies it — deferred until Phase 5.

## Analytics event model

Full taxonomy specified in Project Pack section 15 (`view_product`, `add_to_cart`,
`begin_checkout`, `purchase`, `harvest_signup`, `batch_passport_view`, `reorder_click`,
`trade_submit`, `gifting_submit`, `beekeeper_apply`). Implementation deferred to Phase 9 — no
analytics or advertising script loads before a consent-management platform is wired in.

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

- `SHOPIFY_STOREFRONT_ACCESS_TOKEN` and `SANITY_API_READ_TOKEN` are server-only env vars (no
  `NEXT_PUBLIC_` prefix) — never sent to the client.
- The Storefront API token is scoped to storefront read/cart-write only; the Shopify Admin API
  token (needed for webhook processing, if used) is a separate credential, server-only, never
  referenced from any client-reachable code path.
- All external input (forms) validated server-side with Zod regardless of client-side
  validation.
