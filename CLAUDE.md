@AGENTS.md

# Gert Lush Honey — project guide for Claude

Read this before `docs/*.md` — several of those documents describe an early planning phase and
have not all been kept current. **Where any doc disagrees with the actual code, the code wins.**
When you update a doc, say so in your summary so drift like this doesn't recur silently.

## What this is

A Next.js 16 (App Router, Turbopack) storefront for Gert Lush Honey — small-batch, named-postcode
British honey, plus hampers, candles/soap/lip balm, and beekeeping "Experiences". Commerce runs
through a real, live Shopify store; editorial content and a handful of operational records run
through a real Sanity project. This is **not** a prototype — checkout, subscriptions, reviews,
webhooks and the test suites are all real and already working end-to-end. It is still sitting
behind a temporary site-wide Basic Auth gate (`SITE_PASSWORD_USER`/`SITE_PASSWORD` in
`src/middleware.ts`) — that's the actual "not launched yet" signal, not missing functionality.

## Source of truth, in order

1. **The code itself.**
2. `docs/technical-architecture.md` — kept current through this project's life; the right place
   to add a new dated section when you make an architectural decision, not just a code comment.
3. `docs/requirements-matrix.md` and `docs/implementation-roadmap.md` — useful for the *history*
   of decisions and the original phased plan, but their status columns lag behind reality unless
   someone has just gone through and corrected them. Treat "Not started" in either as suspect;
   check the code before repeating that claim to the user.
4. `docs/launch-checklist.md` — external account setup steps (Shopify, Sanity, Vercel, domain,
   legal review, food-business registration). Most of the numbered items are already done; each
   says so where it's known.
5. `docs/product-creation-sop.md`, `docs/third-party-assets.md`, `docs/brand-alignment-board.md`,
   `docs/competitive-design-review.md` — narrower reference docs (how to add a product, asset
   licensing, brand-direction history, competitor research). These stay accurate on their own
   terms and don't need "is this still true" scrutiny the way a status doc does.

## Commercial hierarchy — apply this when touching products, nav, or copy

1. **Honey** is the primary product and the reason the site exists.
2. **Provenance and the beekeeper** behind each postcode honey is core to the model, not a nice-to-have.
3. **The Gert Lush Standard** (a supplier/batch quality claim) supports honey's credibility.
4. **Hampers / gifting** are built around honey — never given equal top billing with honey itself.
5. **Hive products** (candles, soap, lip balm) are real, permanent, but secondary.
6. **Experiences** extend the beekeeping story (education), last in the hierarchy.

Decision test: *if honey disappeared tomorrow, would the site still make sense? It shouldn't.*
Don't remove candles/soap/lip-balm/hampers/experiences — keep them orbiting honey, not level with it.

## Current architecture, in brief (see technical-architecture.md for detail)

- **Commerce — Shopify.** Storefront API for products/price/stock/cart/checkout/subscriptions
  (real Selling Plans). Admin API is also used, narrowly and server-only: inventory adjustment
  for hamper honey deductions (`src/lib/shopify/admin-inventory.ts`), and customer
  creation/tagging for the newsletter and restock-alert forms. Never exposed to the client bundle.
- **CMS/data — Sanity.** Product content, beekeepers, reviews, newsletter-popup config, shop-tile
  overrides, plus operational bookkeeping documents: `processedWebhookEvent` (webhook-level
  dedup), `webhookOperation` (per-operation dedup — see below), `experienceBookingConflict`.
- **Hampers.** A hamper is its own Shopify product with inventory tracking off — buying one
  doesn't touch honey stock automatically. The `orders/paid` webhook resolves which honey (or
  honeys, for a mixed pick) the hamper draws from and deducts it via the Admin API. Stock
  sufficiency is checked client-side *and* re-checked server-side before any deduction; never
  assumes the client-side check was enough.
- **Experiences.** Booking a session goes through the same real Shopify basket as any product;
  capacity lives in Sanity (`sessions[].placesTotal`/`placesBooked`), incremented by the webhook
  with optimistic concurrency (fresh read + `ifRevisionId`) so two customers can never both book
  the same last place — see "Experience booking concurrency" in technical-architecture.md.
- **Webhook idempotency.** Two layers: a whole-delivery marker (`processedWebhookEvent`, fast
  path for an exact duplicate) and a per-operation marker (`webhookOperation`, deterministic id
  per honey-deduction or per-booking) so a webhook that partially failed and gets redelivered
  only retries the part that actually failed — never repeats a deduction or booking that already
  succeeded. See "Per-operation webhook idempotency" in technical-architecture.md.
- **The Gert Lush Standard** has a single central draft/live flag
  (`src/lib/gert-lush-standard.ts`, `GERT_LUSH_STANDARD_STATUS`). While draft: no product shows
  the certification badge, and all copy must use future/conditional language
  (`standardCopy(draftText, liveText)` is the shared helper — use it, don't hand-roll a new
  ternary). Going live never auto-certifies any product — `honeyProduct.meetsGertLushStandard`
  stays a per-product, per-batch decision made by hand in Sanity Studio, defaulting to false.
- **Provenance/postcode** is core, not decorative: every honey is tied to a real postcode, a
  named beekeeper, and an interactive UK map (`/postcode-honey`) — this is the product's actual
  differentiator, treat it as load-bearing when touching honey-related pages.

## Testing and launch readiness

- `npx tsc --noEmit`, `npx eslint .`, `npx vitest run`, `npx playwright test`, and
  `node scripts/a11y-audit.mjs` (needs `SITE_PASSWORD_USER`/`SITE_PASSWORD` exported into the
  shell first, or it silently audits the site's own 401 page) are all real, all currently
  passing, and all expected to stay that way — run them after a change that could plausibly
  affect them, not just when asked.
- Mobile and accessibility testing are part of what "ready to launch" means here, not an
  afterthought — this project's own history includes fixing real overflow/keyboard/focus-trap
  bugs that automated axe checks alone didn't catch. Manually check keyboard nav, focus order,
  and overlay/modal behaviour, not just automated tools, when touching interactive components.

## Secrets

`.env.local` holds real live credentials (Shopify Storefront/Admin, Sanity read/write, the
site-wide and Studio Basic Auth passwords) and must **never** be committed, added to a backup
zip, or pasted into a doc, log, or chat response. Only `.env.example` (empty placeholder values)
is tracked in git. If you write a backup or export script, explicitly exclude `.env*` (except
`.env.example`) the same way `node_modules` and `.next` are excluded.
