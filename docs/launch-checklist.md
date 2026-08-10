# Account setup checklist

Nothing in this list can be done on your behalf — account creation and payment details must go
through you directly, in your own browser. This is what unblocks each roadmap phase.

## 1. GitHub (unblocks: safe collaboration, PR review, Vercel deploys)

1. Create a free GitHub account if you don't have one.
2. Create a new **private** repository, e.g. `gert-lush-honey`.
3. Tell me the repo URL — I'll push this codebase to it (you'll need to approve that push).

## 2. Vercel (unblocks: a live preview URL)

1. Create a Vercel account (can sign up with the GitHub account above — free tier is fine to
   start).
2. Import the GitHub repo as a new Vercel project.
3. That alone gives you a live `*.vercel.app` preview URL of exactly what exists today — the
   foundation shell, nothing more yet.

## 3. Domain (unblocks: your real URL, e.g. gertlushhoney.co.uk)

1. Register the domain through any UK registrar (123-reg, Namecheap, Google Domains successor,
   etc.) — this is a purchase, so it's one you make yourself.
2. Once registered, tell me the domain name and I'll give you the exact DNS records to point it
   at Vercel.

## 4. Shopify (unblocks: Phase 3 — real products, basket, checkout) — DONE 2026-08-09

Status: live and working for Bee S3 (real price/stock lookup, real one-time checkout). Kept
below for reference/future products, corrected after actually going through this in practice.

1. Start a Shopify store (free trial to begin with — no need to pick a paid plan or a public
   theme, since this build bypasses Shopify's theme entirely and only uses it as a commerce
   engine).
2. Add products in **Products** in Shopify admin as normal (title, price, inventory quantity,
   status Active). The product's exact title doesn't need to match the site's copy — this
   codebase looks products up by a title fragment (`getProductByTitle`), not a hardcoded handle.
3. **For the Storefront API token, the old "Develop apps" custom-app flow is deprecated** —
   Shopify no longer shows a direct "Storefront API access token" there. Instead: install the
   **Headless** channel from the Shopify App Store, create a storefront inside it, and tick
   these scopes: `unauthenticated_read_product_listings`, `unauthenticated_read_product_inventory`,
   `unauthenticated_read_checkouts`, `unauthenticated_write_checkouts`,
   `unauthenticated_read_selling_plans`. Leave everything else (customers, content, tags, bulk
   operations, bundles, Shop Pay, metaobjects, pickup locations) unticked — unused by this build.
4. The Headless channel shows the token as a plain 32-character hex string with **no prefix
   shown** (unlike the old `shpss_...`-prefixed tokens) — don't be thrown by that; it's still the
   right value. A `shpat_...`-prefixed value anywhere in this flow is an **Admin API** token,
   never the right one for `SHOPIFY_STOREFRONT_ACCESS_TOKEN` — this build never uses Admin API
   access at all.
5. Copy the storefront's token and the store domain (`your-store.myshopify.com`) into
   `.env.local` as `SHOPIFY_STOREFRONT_ACCESS_TOKEN` and `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN`.
6. **Turn off the storefront password** before expecting real customers to reach checkout:
   Online Store → Preferences → "Restrict store access" — new/trial stores have this on by
   default, and it silently redirects `checkoutUrl` to a `/password` page otherwise.

## 5. Sanity (unblocks: Phase 2 — beekeeper/batch/postcode content)

1. Create a free Sanity account at sanity.io.
2. Create a new project (any name, e.g. "Gert Lush Honey").
3. Note the **Project ID** and **dataset name** (default `production` is fine).
4. Generate an API token with **read** access (write access only if you want to edit content
   directly from Sanity Studio later, which you will — but a read token unblocks Phase 2
   development first).
5. Send me the project ID and dataset name (again, the token itself can go straight into
   `.env.local` without passing through me).

## 6. Food-business registration (legal requirement, not a website task)

Per the Food Standards Agency, a food business must register with the local authority **at
least 28 days before trading**. This is unrelated to the website build but is a real launch
blocker per the project pack (source S11) — flagging it now so it isn't discovered late.

## 7. Legal content review

Privacy notice, cookie policy, terms, and food-information wording all need review by someone
qualified to confirm they meet UK requirements (Honey (England) Regulations 2015, UK GDPR,
etc.). I can draft first passes once real business details exist, but cannot substitute for
that review.

## 8. Before going live: remove or protect `/tools`

`/tools/feather-image` (added 2026-08-10) is an internal helper for preparing product photos —
see `docs/product-creation-sop.md`. It has **no authentication** and isn't meant to be public:
anyone who found the URL could upload and process arbitrary images through it. Fine for local/dev
use, but before this site is ever deployed live, either delete `src/app/tools/` and
`src/app/api/feather-image/` entirely, or put real auth in front of them. Don't let this slip
through unnoticed just because nothing about it looks broken.

## What's already unblocked, needing nothing from you

The current codebase (Phase 0) required none of the above — it's designed to run and be tested
entirely on mocked/placeholder data. Everything above is only needed as we move into Phases
2 onward.
