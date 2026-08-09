# Implementation roadmap

Ten phases, matching `Gert Lush Honey Website Development Plan.docx`. Each is independently
testable and shippable to a preview URL. Phase 0 (this session) is the discovery/foundation
work described in `Gert Lush Honey Website Implementation.docx`.

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

## Phase 2 — Sanity CMS and content modelling

- **Objective:** the editorial content model live in a real Sanity project.
- **Deliverables:** schemas per `/docs/technical-architecture.md`; sample content clearly
  labelled as demonstration content; content-entry workflow doc.
- **Dependencies:** **user must create a Sanity project and hand over project ID + API token**
  (see `/docs/launch-checklist.md`).
- **Acceptance criteria:** typed GROQ queries return expected shapes; preview mode works.
- **Risks:** schema churn if the beekeeper/batch data model needs to change once real supply
  records exist — keep schemas additive where possible.

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

## Phase 4 — Homepage

- **Objective:** the full cinematic homepage per Project Pack section 07.
- **Dependencies:** Phases 1–3, plus real or approved-placeholder hero photography (see
  photography brief in `/docs/requirements-matrix.md`).
- **Acceptance criteria:** matches the required section sequence; primary purchase route above
  the fold on common mobile sizes; Lighthouse mobile performance in the "good" band.
- **Risks:** the biggest single driver of "does this look like the £100k site" — do not rush
  this phase to hit a date; protect photography and art direction over feature count, per the
  Project Pack's own budget-protection priorities.

## Phase 5 — Product and collection experience

- **Deliverables:** shop/collection pages, product detail page, filters/sort, basket drawer,
  sold-out + waiting-list states.
- **Dependencies:** Phase 3 (Shopify), Phase 2 (batch/beekeeper references), real product data
  (at minimum: the actual jar sizes, prices and weights Gert Lush intends to sell at launch).
- **Acceptance criteria:** full basket→checkout journey tested end-to-end against the real
  Shopify test store.

## Phase 6 — Beekeepers, apiaries and postcode honey

- **Dependencies:** Phase 2, plus **real beekeeper facts and approved biography text** — the
  brief explicitly forbids inventing these.
- **Acceptance criteria:** map works without hover, is keyboard accessible, and has a non-map
  list fallback.

## Phase 7 — Batch Passport and QR journey

- **Dependencies:** Phase 2 (batch data), a decision on the QR redirect mechanism (e.g. a
  stable `/batches/[handle]` URL printed directly, or a short-link service that resolves to it).
- **Acceptance criteria:** tested by scanning a real QR code on a real phone, not just visiting
  the URL directly.

## Phase 8 — Gifts, wholesale and lead generation

- **Dependencies:** Phases 2–3, a chosen form/CRM provider (see technical architecture doc —
  Klaviyo is the working assumption, not yet confirmed with the user).
- **Acceptance criteria:** every form fires the correct analytics event and records consent.

## Phase 9 — SEO, analytics, accessibility and performance

- **Dependencies:** all content phases substantially complete (structured data needs real
  data to describe); a chosen analytics/consent stack.
- **Acceptance criteria:** automated a11y tests pass, manual keyboard + screen-reader spot
  checks done, Core Web Vitals "good" at the 75th percentile on key templates.

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
