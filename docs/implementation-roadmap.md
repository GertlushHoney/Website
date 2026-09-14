# Implementation roadmap

Ten phases, matching `Gert Lush Honey Website Development Plan.docx`. Each is independently
testable and shippable to a preview URL. Phase 0 (this session) is the discovery/foundation
work described in `Gert Lush Honey Website Implementation.docx`.

**Correction pass, 2026-09-15:** only Phase 0 originally carried a status line — Phases 1
through 9 had none at all despite most of them being substantially built since. A `**Status:**`
line has been added to each phase below, checked against the actual code rather than assumed.
The phase descriptions and acceptance criteria are left as originally written. Two things this
roadmap's original phase list doesn't cover at all: **hampers** and **experiences** (both
Shopify products with their own booking/stock logic — see `docs/technical-architecture.md`)
were added later as real features and don't map onto any single phase above; treat their
absence here as a gap in this document's structure, not evidence they're unbuilt.

## Phase 0 — Discovery and foundation (this session)

- **Objective:** a documented, testable, empty-shell app — no invented content, no guessed
  integrations.
- **Deliverables:** Next.js/TS/Tailwind/ESLint/Prettier/Vitest/Playwright scaffold; env
  validation with graceful mocked-data mode; `/docs/requirements-matrix.md`,
  `/docs/technical-architecture.md`, `/docs/implementation-roadmap.md`,
  `/docs/brand-alignment-board.md`; global shell (header/footer/skip-link) and stub routes for
  the primary nav.
- **Dependencies:** none — deliberately buildable with zero external accounts.
- **Acceptance criteria:** `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`
  all pass; every primary-nav link resolves (no 404s).
- **Risks:** none material — this phase has no external dependencies.
- **Status: done.**

## Phase 1 — Design system and global shell

- **Objective:** the reusable component library (buttons, forms, cards, product/beekeeper/batch
  card variants, modal/drawer patterns) on top of the Phase 0 tokens.
- **Deliverables:** component library with Storybook or an internal `/dev/components` preview
  route; documented in `/docs/component-library.md`.
- **Dependencies:** Phase 0. Ideally also the real brand-alignment board sign-off (see
  `/docs/brand-alignment-board.md`) so components aren't built against provisional tokens twice.
- **Acceptance criteria:** keyboard nav, focus trapping, contrast, reduced-motion all verified
  per component.
- **Risks:** building extensively before brand sign-off risks rework.
- **Status: substantially done.** A real component set exists and is in production use across
  the site (product/beekeeper cards, basket drawer, modals, accordions, forms). No dedicated
  Storybook/`/dev/components` preview route or `/docs/component-library.md` was built — the
  library lives as the real components themselves rather than a documented, isolated catalogue.

## Phase 2 — Sanity CMS and content modelling

- **Objective:** the editorial content model live in a real Sanity project.
- **Deliverables:** schemas per `/docs/technical-architecture.md`; sample content clearly
  labelled as demonstration content; content-entry workflow doc.
- **Dependencies:** **user must create a Sanity project and hand over project ID + API token**
  (see `/docs/launch-checklist.md`).
- **Acceptance criteria:** typed GROQ queries return expected shapes; preview mode works.
- **Risks:** schema churn if the beekeeper/batch data model needs to change once real supply
  records exist — keep schemas additive where possible.
- **Status: done**, and grown beyond the original description. Real Sanity project `4l2x73vh`
  is live with `honeyProduct`, `merchProduct`, `beekeeper`, reviews, newsletter-popup config,
  shop-tile overrides, and operational bookkeeping documents (`processedWebhookEvent`,
  `webhookOperation`, `experienceBookingConflict`) that didn't exist in the original plan.
  Batch/`honeyBatch` schema specifically: not started, matches Phase 7 below.

## Phase 3 — Shopify headless integration

- **Objective:** Shopify wired in as the invisible commerce engine.
- **Deliverables:** Storefront API client, product/collection/basket queries and mutations,
  checkout handoff, TypeScript types, mocked-data fallback preserved for local dev.
- **Dependencies:** **user must create a Shopify store**, enable the Storefront API via a
  custom app, and hand over the domain + token.
- **Acceptance criteria:** basket create/add/update/remove all tested independently; no admin
  credentials reachable from the client bundle.
- **Risks:** none of the actual products/prices exist yet — this phase can be built and tested
  against one or two placeholder products created directly in the test Shopify store.
- **Status: done**, and grown beyond the original description. Real live Shopify store, real
  Storefront API basket/checkout/subscriptions, plus a narrow server-only Admin API integration
  (hamper stock deduction, newsletter/restock customer tagging) that wasn't in the original
  scope — see "Shopify integration" in `docs/requirements-matrix.md` and
  `docs/technical-architecture.md`.

## Phase 4 — Homepage

- **Objective:** the full cinematic homepage per Project Pack section 07.
- **Dependencies:** Phases 1–3, plus real or approved-placeholder hero photography (see
  photography brief in `/docs/requirements-matrix.md`).
- **Acceptance criteria:** matches the required section sequence; primary purchase route above
  the fold on common mobile sizes; Lighthouse mobile performance in the "good" band.
- **Risks:** the biggest single driver of "does this look like the £100k site" — do not rush
  this phase to hit a date; protect photography and art direction over feature count, per the
  Project Pack's own budget-protection priorities.
- **Status: done.** Real homepage live with Hero, `WhatIsGertLush`, `FeaturedProduct`,
  `GertLushStandardStrip`, `PostcodeHoney`, `TrustRow`, `SupplierCtaBanner`.

## Phase 5 — Product and collection experience

- **Deliverables:** shop/collection pages, product detail page, filters/sort, basket drawer,
  sold-out + waiting-list states.
- **Dependencies:** Phase 3 (Shopify), Phase 2 (batch/beekeeper references), real product data
  (at minimum: the actual jar sizes, prices and weights Gert Lush intends to sell at launch).
- **Acceptance criteria:** full basket→checkout journey tested end-to-end against the real
  Shopify test store.
- **Status: done**, and grown beyond the original description. Generic, fully data-driven
  product template (`/shop/[slug]`), category listing pages, basket→checkout journeys tested
  end-to-end for honey, hampers, and experiences (the latter two are newer additions not in this
  phase's original description — see the roadmap-wide note above). Filters/sort: not built, not
  needed yet at this catalogue size.

## Phase 6 — Beekeepers, apiaries and postcode honey

- **Dependencies:** Phase 2, plus **real beekeeper facts and approved biography text** — the
  brief explicitly forbids inventing these.
- **Acceptance criteria:** map works without hover, is keyboard accessible, and has a non-map
  list fallback.
- **Status: done.** Real beekeeper directory/profiles in Sanity, and a real interactive
  postcode map (`/postcode-honey`) driven by each `honeyProduct`'s `postcodeCode` field —
  outline-only resting state, keyboard accessible, `<select>` fallback, waiting-list CTA for
  any postcode without stock.

## Phase 7 — Batch Passport and QR journey

- **Dependencies:** Phase 2 (batch data), a decision on the QR redirect mechanism (e.g. a
  stable `/batches/[handle]` URL printed directly, or a short-link service that resolves to it).
- **Acceptance criteria:** tested by scanning a real QR code on a real phone, not just visiting
  the URL directly.
- **Status: not started.** Still genuinely unbuilt — no `honeyBatch` schema, no Batch Passport
  route, no QR mechanism decided.

## Phase 8 — Gifts, wholesale and lead generation

- **Dependencies:** Phases 2–3, a chosen form/CRM provider (see technical architecture doc —
  Klaviyo is the working assumption, not yet confirmed with the user).
- **Acceptance criteria:** every form fires the correct analytics event and records consent.
- **Status: partially done, differently from planned.** The standalone Gifts page from the
  original plan was deliberately removed and its content redistributed (hamper gifting now
  lives under honey/hampers per the commercial hierarchy in `CLAUDE.md`; corporate/event
  gifting moved to Stockists). Postcode waitlist and restock-alert forms are real (Sanity +
  Shopify Admin API tagging). Wholesale/corporate/beekeeper-application forms remain mailto-CTA
  only — no CRM/Klaviyo integration, no per-form analytics-event/consent tracking was built.

## Phase 9 — SEO, analytics, accessibility and performance

- **Dependencies:** all content phases substantially complete (structured data needs real
  data to describe); a chosen analytics/consent stack.
- **Acceptance criteria:** automated a11y tests pass, manual keyboard + screen-reader spot
  checks done, Core Web Vitals "good" at the 75th percentile on key templates.
- **Status: substantially done.** Sitemap, canonical URLs, and JSON-LD (Product/Organization/
  Breadcrumb/FAQPage) are live; Vercel Web Analytics is live (page-view level, not the full
  original event taxonomy); a full automated accessibility sweep (0 violations across 35
  states) plus manual keyboard/focus-order/modal-trap checks has been run — see `CLAUDE.md`.
  Core Web Vitals have not been formally measured against the 75th-percentile target.

## Phase 10 — Final QA and launch preparation

- **Deliverables:** `/docs/content-editor-guide.md`, `/docs/shopify-admin-guide.md`,
  `/docs/batch-publishing-guide.md`, `/docs/deployment-guide.md`, `/docs/launch-checklist.md`
  (already started, see below), `/docs/known-limitations.md`, and a final report.
- **Acceptance criteria:** every item on the launch-day checklist (Project Pack section 18)
  verified; food-business registration (28-day lead time — see S11 in the Project Pack) and
  legal-page review confirmed complete by the user, since neither is something this build can
  do on their behalf.

## What this roadmap deliberately does not do

It does not assume a fixed calendar timeline. Phases 2 onward are blocked on the user creating
real accounts and supplying real content — see `/docs/launch-checklist.md` for exactly what's
needed from them before each phase can start.
