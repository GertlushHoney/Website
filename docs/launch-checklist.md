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

Privacy notice, cookie policy, terms, refund policy, and food-information wording all need review
by someone qualified to confirm they meet UK requirements (Honey (England) Regulations 2015, UK
GDPR, Consumer Contracts Regulations 2013, etc.). I can draft first passes once real business
details exist, but cannot substitute for that review. The Refund Policy (`/legal/refund-policy`,
added 2026-08-22) explicitly flags one open legal question itself: whether honey qualifies for any
of the Consumer Contracts Regulations' exemptions to the 14-day cancellation right — needs a
definite answer from whoever does this review, not just the current honest "hasn't been confirmed"
hedge.

## 8. `/tools` protection — DONE 2026-08-19

`/tools/feather-image` (added 2026-08-10) is an internal helper for preparing product photos —
see `docs/product-creation-sop.md`. It has no authentication of its own, so it now shares the
permanent Studio password gate (`src/middleware.ts` — both the page and its
`/api/feather-image` backend), rather than relying only on the temporary site-wide gate. Stays
protected even after `SITE_PASSWORD` is removed at public launch — verified both the page and
the API route 401 without the Studio credentials and 200 with them.

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
exception, never reachable from the browser). Two steps.

1. **Create a scoped custom app via the Dev Dashboard** (`dev.shopify.com/dashboard` — Settings →
   Apps and sales channels → Develop apps now hands off here; Shopify retired the old direct
   in-admin custom-app flow on 2026-01-01). Create an app, scope its Admin API access to
   **only** `read_customers` and `write_customers`, release it, then install it on this store
   from your regular Shopify admin.

   Dev Dashboard apps don't hand you a static copyable token — go to the app's **Settings** tab
   in the Dev Dashboard and copy its **Client ID** and **Client secret** instead. Add both to
   `.env.local` as `SHOPIFY_ADMIN_CLIENT_ID` and `SHOPIFY_ADMIN_CLIENT_SECRET` (see
   `.env.example`). This codebase exchanges them for a short-lived access token itself
   (`src/lib/shopify/admin-client.ts`, the OAuth client_credentials grant) — there's no token to
   paste in directly. Keep the Client secret private, same as any password: it grants real write
   access to customer records.
2. **When a product comes back in stock**, go to Shopify Email → create a campaign → target a
   segment filtered by customer tag `restock:<the product's handle>` (e.g.
   `restock:beewax-candle-skep-and-bees`) → write and send. This send is manual, on your side —
   the code only handles collecting and tagging the signups, not automatically detecting a
   restock and firing an email.

Until step 1 is done, the "Notify me" form fails gracefully with a plain "not available right
now" message rather than breaking the page — confirmed by testing it live before that token
existed.

## 11. Product reviews (unblocks: reviews actually saving when submitted)

Every product page (honey and merch) now has a "Reviews" section with a real submission form —
star rating, name, review text. Nothing submitted through it appears on the site until you
approve it: it's saved to Sanity as a draft (`approved: false`), and only shows up once you
flip that to true in Studio (Product Review → find it → tick Approved). No fake/seeded reviews
anywhere — it'll show "No reviews yet" honestly until real ones exist.

This needs its own Sanity API token — separate from the read-only one everything else uses, for
the same reason the Shopify Admin token is kept separate from the Storefront one (narrow,
purpose-specific credentials).

1. Go to **manage.sanity.io** → your project → **API** → **Tokens** → **Add API token**.
2. Name it something like "Review submissions", set permission to **Editor** (needs create
   access, not just read).
3. Copy the token and add it to `.env.local` (and, once deployed, Vercel's environment
   variables) as `SANITY_API_WRITE_TOKEN` — see `.env.example`.

Until this is set, the review form fails gracefully with "not available right now" rather than
breaking the page — confirmed by testing it before the token existed, same as the restock alert
form above.

## 12. Password gates (site-wide + Studio) — DONE 2026-08-19

Two separate HTTP Basic Auth gates live in `src/middleware.ts` — a browser login prompt, no
Shopify/Sanity account involved. Both need their env vars added in **two** places to actually
work: `.env.local` for your own machine, and Vercel's Environment Variables for the live site
(Settings → Environment Variables → apply to Production and Preview) — each redeploy only picks
up whatever's set in Vercel at build time.

1. **Site-wide gate** (`SITE_PASSWORD_USER` / `SITE_PASSWORD`) — currently protects the entire
   site while it's live but not ready for real visitors. **Remove both env vars (from Vercel,
   then redeploy) when ready to launch publicly** — that's the actual "go live" switch, not a
   code change.
2. **Studio gate** (`STUDIO_PASSWORD_USER` / `STUDIO_PASSWORD`) — protects `/studio` and
   `/tools/feather-image` (plus its `/api/feather-image` backend), independent of the gate
   above, and is meant to **stay in place permanently**, even after the site-wide gate is
   removed. This is on top of Sanity Studio's own real login (a genuine Sanity account has to be
   a project member to do anything there) — it just stops those URLs from being openly
   reachable.

To change either password: update the value in both `.env.local` and Vercel, then redeploy. When
redeploying in Vercel, double-check you're redeploying the **latest** build and not an older row
further down the Deployments list — clicking "Redeploy" on the wrong one silently re-publishes
old code instead of picking up the change.

## 13. Professional email domain (Microsoft 365) — in progress 2026-08-22

Moved every contact address on the site from a personal Outlook address to role-based addresses
on `gertlushhoney.co.uk` (`gdpr@`, `complaints@`, `sales@`, `hello@` — see
`docs/technical-architecture.md`, "Form submission architecture" for which page uses which). The
domain itself shows Healthy in Microsoft 365 admin, but adding the first alias failed with "not an
accepted domain for your organization" — likely just Exchange Online's Accepted Domains list
lagging behind the domain's own verification. **Needs confirming:** check
admin.exchange.microsoft.com → Mail flow → Accepted domains lists `gertlushhoney.co.uk`, then
retry adding all four aliases to the working mailbox.

## 14. Company registration and VAT — not yet done

Gert Lush Honey intends to incorporate as a limited company but hasn't yet (confirmed
2026-08-22) — currently trades as a sole trader regardless of that intention. Not VAT registered,
and turnover should be checked against the current threshold before assuming either way. This
blocks writing a real Legal Notice / Impressum page (Shopify has a field for this) — a placeholder
or invented company number must never be used. Register at gov.uk/set-up-a-limited-company (£50,
usually approved within 24 hours) when ready, then come back with the real company number (and
VAT number if applicable) to get the Legal Notice drafted.

## 15. Shopify subscriptions — DONE 2026-08-22

Real, live, verified end-to-end — see `docs/technical-architecture.md`, "Subscriptions". Shopify's
free native Subscriptions app is installed with a real Selling Plan attached to Bee S3; the
codebase's existing `subscriptionSellingPlanId` detection picked it up with zero code changes.
Remaining setup-guide steps in the Shopify Subscriptions app itself (allow customers to manage
subscriptions, allow account access post-purchase, customize notifications) should be finished so
the self-service "manage/cancel from your order confirmation email" link actually works.

## 16. Shopify's own Settings → Policies pages — DONE 2026-08-22

Shopify auto-suggests generic templates for Privacy policy, Terms of service, Shipping policy and
Refund policy that describe capabilities this store doesn't have (targeted advertising,
pre-orders, try-before-you-buy, manual subscription invoicing). Condensed, accurate replacement
text for all four was drafted in conversation, each linking back to the equivalent real page —
confirmed pasted into Shopify. **Shopify Network Intelligence** (Settings → Customer privacy) was
kept enabled rather than disabled, since disabling it also stops abandoned-checkout emails and
Shop app campaigns — the Privacy Notice was updated to disclose it honestly instead of turning it
off.

## What's already unblocked, needing nothing from you

The current codebase (Phase 0) required none of the above — it's designed to run and be tested
entirely on mocked/placeholder data. Everything above is only needed as we move into Phases
2 onward.
