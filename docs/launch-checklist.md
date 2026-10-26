# Account setup checklist

Nothing in this list can be done on your behalf — account creation and payment details must go
through you directly, in your own browser. This is what unblocks each roadmap phase.

## 1. GitHub (unblocks: safe collaboration, PR review, Vercel deploys) — DONE

*(Corrected 2026-09-15 — this was still phrased as a pending ask; the repo has been created and
pushed to for weeks, with regular commits since.)* The codebase is pushed to a private GitHub
repo (`origin/master`). Keep committing and pushing as work lands, per the project's normal
git workflow.

## 2. Vercel (unblocks: a live preview URL) — DONE

*(Corrected 2026-09-15 — this described only "the foundation shell, nothing more yet"; the
project is long past that.)* The GitHub repo is imported as a Vercel project and deploying the
real, current site — not a foundation shell — on every push.

## 3. Domain (unblocks: your real URL, e.g. gertlushhoney.co.uk) — DONE

*(Corrected 2026-09-15.)* gertlushhoney.co.uk is registered and pointed at the live Vercel
deployment. The site is reachable there now, still sitting behind the temporary site-wide
password gate (item 12 below) ahead of public launch.

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
   never the right one for `SHOPIFY_STOREFRONT_ACCESS_TOKEN`. *(Corrected 2026-09-15 — this
   step used to go on to say "this build never uses Admin API access at all," which is no
   longer true and contradicted item 10 below even at the time: a separate, narrow, server-only
   Admin API integration exists for hamper stock deduction and restock/newsletter customer
   tagging, via its own separate `SHOPIFY_ADMIN_CLIENT_ID`/`SHOPIFY_ADMIN_CLIENT_SECRET`
   credentials — never the Storefront token, and never reachable from the browser. See item 10
   and `docs/technical-architecture.md`, "Security boundaries.")*
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

## 7. Legal content review — DONE (all pages, confirmed 2026-10-26)

Confirmed by the user 2026-09-24 for the Privacy Notice, Cookie Policy, Terms and Refund Policy,
and on 2026-10-26 for **every legal and policy page** (that also covers the Delivery page and the
Accessibility Statement): a professional has reviewed them. All "Draft — not yet legally reviewed"
banners are gone and `src/components/legal/draft-notice.tsx` has been deleted.

On 2026-10-26 the Refund Policy sentence saying the honey/cancellation-exemption question "hasn't
been confirmed by a qualified adviser yet" was removed, since it described a review status that is
no longer true. The page still says the Regulations carry exemptions for some goods and invites
anyone unsure to get in touch; it deliberately does **not** state whether honey is or isn't
exempt, because that is a legal answer this build was never given.

**Re-review whenever the wording changes.** The Privacy Notice has changed since the original
review (Royal Mail / Click & Drop, the postcode waiting-list box and its tick box, the contact form
now sending through Microsoft 365, the review-alert email, and a new "Preventing misuse of our
forms" section describing the hashed, auto-deleted IP/email counters) — so the reviewer should see
the current version. The /fake-honey page is not a legal page but makes claims about the law.

**Ask the reviewer this specific question (raised by an external review, 2026-10-26):** "We store
a persistent localStorage flag only to remember that a visitor has closed or signed up through
the newsletter popup. It is written only when they do one of those things, and it is described in
the Cookie Policy ("Preferences you choose") and the Cookie options panel. Does our current Cookie
Policy and Cookie options implementation satisfy PECR under the ICO's 2026 storage-and-access
guidance, or do we need a consent control or different wording?" The site's other storage is a
session-only splash flag and the basket cookie, both already disclosed.

Food-information wording (Honey (England) Regulations 2015 — net quantity, ingredients, storage,
batch, best-before, infant-honey warning on each product page) is product-page content, not one of
the legal pages, and was not mentioned in the review; check it was covered.

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
2. **When a product comes back in stock**, go to Shopify Admin → **Customers**, search
   `tag:restock:<the product's handle>` (e.g. `tag:restock:beewax-candle-skep-and-bees`) to find
   everyone waiting, then email them yourself directly (e.g. BCC from your own mail client) rather
   than through Shopify Email's campaign tool.

   **Not Shopify Email** (changed 2026-08-23, independent review) — these customers are created
   with `emailMarketingConsent: NOT_SUBSCRIBED` on purpose: signing up for one product's restock
   alert isn't the same as consenting to general marketing, and recording it as `SUBSCRIBED` would
   misrepresent that. Shopify Email's own campaign tool refuses to send to non-subscribed
   contacts, which is exactly why a direct email is the right approach here, not a workaround to
   route around. This send is manual either way — the code only handles collecting and tagging
   signups, not automatically detecting a restock and firing an email.

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

**Important (2026-10-26):** the Studio gate now fails *closed* in production. If
`STUDIO_PASSWORD_USER` / `STUDIO_PASSWORD` are ever missing from Vercel, Studio and the internal
tools show "Internal tools are unavailable" (503) instead of opening up. So: **keep both Studio
variables set in Vercel for Production and Preview — even after you remove `SITE_PASSWORD_USER` /
`SITE_PASSWORD` at launch.** Only the two `SITE_PASSWORD*` variables are meant to be deleted.

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

## 13. Professional email domain (Microsoft 365) — DONE 2026-08-22

Moved every contact address on the site from a personal Outlook address to role-based addresses
on `gertlushhoney.co.uk` (`gdpr@`, `complaints@`, `sales@`, `suppliers@`, `hello@` — see
`docs/technical-architecture.md`, "Form submission architecture" for which page uses which). Hit
"not an accepted domain for your organization" on the first alias attempt — resolved itself once
Exchange Online's Accepted Domains list caught up with the domain's own verification. All five
aliases confirmed created on the working mailbox.

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

## 17. Enable Dependabot alerts on the GitHub repo — DONE (confirmed 2026-10-22)

*GitHub now reports its open-alert count on every push and real Dependabot PRs exist, so this is
switched on. 16 alerts were open at that date, mostly in the Sanity tooling chain, which is being
monitored rather than force-upgraded. The original instructions are kept below.*

The one piece of "ADD AUTOMATED DEPENDENCY MONITORING" (2026-09-15) that genuinely can't be done
from inside this codebase — it's a per-repository setting, not a file. On github.com: the repo →
**Settings → Code security** → turn on **Dependabot alerts** and **Dependabot security updates**.
Everything else (weekly version-update PRs, `npm audit` in CI, a separate scheduled weekly audit)
is already committed and working without this — see `docs/technical-architecture.md`, "Dependency
monitoring" — but without this toggle, a newly-published advisory for something already pinned in
the lockfile (exactly the shape of the Next.js RCE this project shipped with until 2026-09-15)
won't generate a real-time GitHub alert; it'll only surface at the next scheduled Monday run.

## 18. Add real product handles to the review-nudge link (unblocks: a per-product "leave a review" prompt)

`/thank-you` already shows a generic "Enjoyed your order? We'd love a review" prompt with no setup
needed — this step makes it name the actual product ("Leave a review for Bee S3"), linking straight
to that product's real page. Extends the **same** link added in point 9 above (Settings →
Notifications → Order confirmation → Edit code) — don't add a second link, just append one more
query param to the existing one:

```html
{% capture product_handles %}{% for line_item in line_items %}{{ line_item.product.handle }}{% unless forloop.last %},{% endunless %}{% endfor %}{% endcapture %}
<a href="https://YOUR-DOMAIN/thank-you?order={{ name | url_encode }}&email={{ email | url_encode }}&products={{ product_handles | url_encode }}">
  Want to know when new postcode honey arrives? Sign up here.
</a>
```

`products` is a comma-separated list of the real Shopify handles from that order's line items —
`/thank-you` resolves each one against Sanity itself (never trusts the URL blindly) and only shows
a "leave a review" button for the ones that actually match a real, active product; anything that
doesn't resolve (or the whole param being absent) falls back to the generic prompt, so this is
optional polish on top of point 9, same as the newsletter link was.

**Note:** a Shopify product's `handle` and this site's own `/shop/{slug}` URL aren't always the
same string — Bee S3 is a confirmed example (`shopifyHandle: "bees3-honey"`, but `/shop/bee-s3`).
That's exactly why the resolution happens server-side against Sanity's own `shopifyHandle` field
rather than assuming the Shopify handle can be used as the URL directly.

## 19. Website-sent invite emails via Microsoft 365 (unblocks: the "send me the form" boxes)

Added 2026-10-21. The Become a Supplier page and the "Already one of our beekeepers?" box on Our
Beekeepers now take an email address and send the matching invite email (each links to its
Microsoft Form), plus a heads-up to `suppliers@` or `admin@`. Mail goes out through Microsoft Graph
from the business's own Microsoft 365 mailbox — see `docs/technical-architecture.md`, "Invite
emails (Microsoft 365)". Until all four env vars below are set, both boxes show "This isn't
available right now — please email us instead" rather than breaking.

1. **Register an app.** entra.microsoft.com → **Identity → Applications → App registrations → New
   registration**. Name it e.g. "Gert Lush website mail", single tenant, no redirect URI. From its
   Overview page copy the **Application (client) ID** and **Directory (tenant) ID**.
2. **Give it permission to send mail.** The app → **API permissions → Add a permission → Microsoft
   Graph → Application permissions → Mail.Send** → Add, then **Grant admin consent** for the
   organisation. (Application permission, not Delegated — the website sends without anyone signed
   in.)
3. **Create a client secret.** The app → **Certificates & secrets → New client secret**. Copy the
   **Value** straight away (it's only shown once). Note its expiry date — when it expires, emails
   stop sending until a new one is created and swapped in.
4. **Restrict it to the one mailbox.** By default Mail.Send lets the app send as *any* mailbox in the
   organisation. Lock it down in Exchange Online PowerShell:
   ```powershell
   Connect-ExchangeOnline
   New-DistributionGroup -Name "Website mail senders" -Type Security -Members <mailbox address>
   New-ApplicationAccessPolicy -AppId <client ID> -PolicyScopeGroupId "Website mail senders" -AccessRight RestrictAccess -Description "Website invite emails only"
   Test-ApplicationAccessPolicy -AppId <client ID> -Identity <mailbox address>   # should say Granted
   ```
5. **Set the env vars** in `.env.local` and Vercel (Production + Preview), then redeploy:
   `MS_GRAPH_TENANT_ID`, `MS_GRAPH_CLIENT_ID`, `MS_GRAPH_CLIENT_SECRET`, and
   `MS_GRAPH_SENDER_MAILBOX` — the real mailbox address that `suppliers@`/`admin@` are aliases of
   (not an alias itself). The aliases go on each email as Reply-To, so replies still land there.
**Since 2026-10-26 more of the site depends on this setup** — the postcode waiting-list box, the
Contact form, and the owner alert emails for new reviews and experience overbookings all send
through it too. So the client secret's **expiry date** matters: put it in your calendar a couple of
weeks ahead, because once it expires all of these stop silently until a new secret is created
(step 3) and set in Vercel (step 5). Also test the Contact form and submit a review once after
setup.

6. **Test it** by entering your own address in each box: you should get the invite (honeycomb
   background, gold logo, amber button opening the right form) and the heads-up in the shared inbox.

## 20. Royal Mail Click & Drop (postage labels) — connected 2026-10, follow-ups open

Click & Drop is connected to Shopify (set up by the owner). Still to do or check:

1. **Check and finish the weights.** Shopify already holds weights for most products (candles,
   soap, lip balm, hampers — entered directly there, possibly estimates; honeys are a real 613 g),
   but six are still 0: Skep candle (small), beeswax bars, pillar candle, ghost candle and both
   plates. Weigh those (packed, as posted) and replace any estimate that is wrong. Checkout
   postage and Click & Drop's suggested service rely on these.
2. **Place a small test order** (e.g. a 100% discount code) and confirm it appears in Click & Drop
   within about 10 minutes, then cancel it.
3. **Experiences:** make sure the Bee Day Experience is not marked "This is a physical product" in
   Shopify, or it may appear in Click & Drop as a parcel.
4. The Privacy Notice now names Royal Mail (Click & Drop) as a recipient of delivery details —
   include that paragraph in the next legal review.

## 21. Being found by search engines and AI assistants (do these at launch)

The site side is built (see `docs/technical-architecture.md`, "Being found by AI assistants"). These
parts are yours, and matter most:

1. **Remove the public password** (only the two `SITE_PASSWORD*` variables — keep the Studio ones,
   point 12). While it's on, no search engine or AI tool can see anything.
2. **Register the site** with **Google Search Console** and **Bing Webmaster Tools** (both free)
   and submit `https://www.gertlushhoney.co.uk/sitemap.xml`. Bing matters because several AI
   assistants use its index.
3. **Create a Google Business Profile** (and keep name, address and details identical everywhere).
4. **Build outside mentions:** reviews, stockist pages, local press, beekeeping associations, your
   social profiles. Tell me the profile URLs and I'll add them to the site's `sameAs` data.
5. **A month after launch**, ask ChatGPT, Gemini and Perplexity things like "where can I buy
   single-postcode honey in Bristol" and note what comes back.

## What's already unblocked, needing nothing from you

*(Corrected 2026-09-15 — this section originally said "the current codebase (Phase 0) required
none of the above... designed to run entirely on mocked/placeholder data," which described an
early state the project has long since moved past.)* Most items above are marked **DONE** and
are in active use with real credentials — real Shopify store, real Sanity project, real domain,
real email. What genuinely still needs action from you: item 6 (food-business registration),
item 7's follow-up (show the reviewer the current Privacy Notice, and check the food-information
wording on product pages was covered), item 11's ongoing review habit (approving submitted reviews in Sanity Studio), item 14
(company registration/VAT), and item 20 (weigh the remaining products, a Click & Drop test order,
and legal review of the new Royal Mail privacy paragraph and the new fake-honey and waiting-list
wording). Item 17 (Dependabot alerts) is done. Item 18 is optional, not blocking anything
— the generic review prompt already works with zero setup; it's only there for whoever wants the
sharper per-product version.
The codebase still degrades gracefully to mocked/static content if a credential is ever missing
or misconfigured — that fallback behaviour is a resilience feature now, not the project's
actual day-to-day state.
