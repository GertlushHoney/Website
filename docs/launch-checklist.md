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

## 9. Newsletter signup after checkout (unblocks: emailing customers when new honey arrives)

**Correction (2026-08-12):** the original version of this step recommended a redirect script
pasted into Checkout → Additional scripts. That's now the wrong advice — Shopify is retiring
Additional Scripts and checkout.liquid on the Thank You/Order Status page entirely (already gone
for Plus stores since August 2025; non-Plus stores lose it 26 August 2026), and the replacement
system (Checkout Extensibility) deliberately doesn't allow redirecting off Shopify's own checkout
domain at all anymore — a trust/security change, not a gap. Below is the current, actually-
supported approach instead. Three manual steps, all in your Shopify admin.

1. **Add a Storefront API scope.** The Headless channel token was originally set up with only
   the checkout/product scopes (see point 3) — customer scopes were deliberately left unticked
   since nothing needed them at the time. Go to the Headless channel → your storefront → scopes,
   and tick `unauthenticated_write_customers` (leave the rest as they are). Without this, the
   signup form on `/thank-you` will fail with a permission error.
2. **Turn on Shopify's native marketing checkbox.** Settings → Checkout → Marketing opt-in.
   This is the simplest, zero-code way to capture "email me about new honey" consent — it shows a
   checkbox right in checkout and subscribes people to the same Shopify Email list
   `subscribeToNewsletter()` uses, with no redirect or extra page needed at all.
3. **Link to the branded Thank You page from the order confirmation email.** Settings →
   Notifications → Order confirmation → Edit code, then add this near the top of the Email body
   (HTML) — it's just one link, safe to place wherever reads naturally in the existing template:

   ```html
   <p>
     <a href="https://YOUR-DOMAIN/thank-you?order={{ name | url_encode }}&email={{ email | url_encode }}">
       Want to know when new postcode honey arrives? Sign up here.
     </a>
   </p>
   ```

   Replace `YOUR-DOMAIN` with the real live domain once deployed (e.g. `gertlushhoney.com`).
   Editing notification templates is unaffected by the Additional Scripts deprecation — this
   remains fully supported. `/thank-you` still works as a standalone page and pre-fills the
   signup form from the `email` param either way, so step 3 is optional polish on top of step 2,
   not a replacement for it.

## 10. Restock alerts on sold-out products (unblocks: "notify me when back in stock")

A sold-out product now shows a "Notify me when it's back" form instead of just a disabled
button. It tags the customer in Shopify (`restock:<product-handle>`, e.g.
`restock:bees3-honey`) rather than adding them to the general newsletter list, so you can email
just the people who asked about that specific product — not everyone.

This uses the Shopify **Admin** API, not the Storefront API everything else in this build uses
(see `docs/technical-architecture.md`, "Security boundaries" — a deliberate, narrow, server-only
exception, never reachable from the browser). Two steps, both in your Shopify admin:

1. **Create a scoped Admin API token.** Settings → Apps and sales channels → Develop apps →
   Create an app → Configure Admin API scopes. Tick **only** `read_customers` and
   `write_customers` — nothing else. Install the app, then reveal and copy the Admin API access
   token (starts `shpat_...`, unlike the Storefront token). Add it to `.env.local` as
   `SHOPIFY_ADMIN_API_TOKEN` (see `.env.example` for the exact name). Keep this token private —
   unlike the Storefront token, it grants real write access to customer records.
2. **When a product comes back in stock**, go to Shopify Email → create a campaign → target a
   segment filtered by customer tag `restock:<the product's handle>` (e.g.
   `restock:beewax-candle-skep-and-bees`) → write and send. This send is manual, on your side —
   the code only handles collecting and tagging the signups, not automatically detecting a
   restock and firing an email.

Until step 1 is done, the "Notify me" form fails gracefully with a plain "not available right
now" message rather than breaking the page — confirmed by testing it live before that token
existed.

## What's already unblocked, needing nothing from you

The current codebase (Phase 0) required none of the above — it's designed to run and be tested
entirely on mocked/placeholder data. Everything above is only needed as we move into Phases
2 onward.
