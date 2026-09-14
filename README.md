# Gert Lush Honey

Small-batch, named-postcode British honey — plus gift hampers, beeswax candles/soap/lip balm, and
beekeeping "Experiences". Next.js storefront, real Shopify checkout, real Sanity content.

**Status:** live commerce, live content, sitting behind a temporary site-wide password gate ahead
of public launch — see `docs/technical-architecture.md` for what "live" actually covers, and
`CLAUDE.md` for a fuller current-state summary if you're an AI assistant picking this project up.

## Stack

- Next.js 16 (App Router, Turbopack), React 19, TypeScript strict mode, Tailwind CSS v4
- Shopify Storefront API (commerce: products, price/stock, cart, checkout, subscriptions) +
  narrow, server-only Shopify Admin API use (hamper inventory adjustment, restock/newsletter
  customer tagging)
- Sanity (editorial content, reviews, beekeepers, and a few operational bookkeeping documents —
  webhook idempotency, experience booking capacity)
- Vitest + Testing Library (unit/component tests), Playwright (end-to-end tests),
  `@axe-core/playwright` (accessibility audit script)
- Vercel (hosting) + Vercel Web Analytics

## Getting started

```bash
npm install
npm run dev
```

Opens at [http://localhost:3000](http://localhost:3000). The whole site sits behind an HTTP Basic
Auth prompt while pre-launch — see `SITE_PASSWORD_USER`/`SITE_PASSWORD` in `.env.local`
(`src/middleware.ts` is the gate; unset both to disable it once ready to go public).

Copy `.env.example` to `.env.local` and fill in real values to run against live Shopify/Sanity
data. Missing credentials degrade gracefully (static fallback content, honest "email us instead"
messaging) rather than crashing — see `docs/technical-architecture.md`.

## Scripts

```bash
npm run dev          # start the dev server (Turbopack)
npm run build         # production build
npm run typecheck     # tsc --noEmit
npm run lint           # eslint
npm run test            # vitest (unit/component)
npm run test:watch       # vitest, watch mode
npm run test:e2e          # playwright (needs the dev server running — see playwright.config.ts)
```

Accessibility: `node scripts/a11y-audit.mjs` (needs `SITE_PASSWORD_USER`/`SITE_PASSWORD` exported
into the shell first — otherwise it silently audits the site's own login page, not real content).

## Where things live

- `src/app/(site)/` — every real route (see `docs/technical-architecture.md` for the full tree)
- `src/lib/shopify/`, `src/lib/sanity/` — the two data sources, kept deliberately separate
- `src/sanity/schemaTypes/` — Sanity content model
- `e2e/` — Playwright journeys (honey purchase, navigation, hamper building, experience booking,
  keyboard accessibility)
- `docs/` — project documentation; start with `docs/technical-architecture.md` for how things
  actually work today, `docs/requirements-matrix.md`/`docs/implementation-roadmap.md` for the
  historical phased plan (status columns there can lag behind the code — check before trusting)

## Documentation

`CLAUDE.md` is the entry point for an AI assistant working in this repo. For everything else, see
`docs/` — `docs/technical-architecture.md` is the one kept current through the project's life;
treat it as the source of truth over any other doc if they ever disagree.
