import type { Metadata } from 'next'
import { DraftNotice } from '@/components/legal/draft-notice'

export const metadata: Metadata = {
  title: 'Privacy Notice',
  description: 'How Gert Lush Honey handles your personal data.',
  alternates: { canonical: '/legal/privacy' },
}

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <p className="text-honey-amber text-sm font-semibold tracking-wide uppercase">
        Privacy Notice
      </p>
      <h1 className="text-porcelain mt-3 text-4xl font-bold tracking-tight text-balance">
        Your privacy.
      </h1>

      <div className="mt-8">
        <DraftNotice />
      </div>

      <div className="text-porcelain/80 space-y-6 text-base">
        <section>
          <h2 className="text-porcelain text-lg font-semibold">Who we are</h2>
          <p className="mt-2">
            Gert Lush Honey, 14 Beckington Road, Bristol, BS3 5EB. We&apos;re the data controller
            for any personal information you give us.
          </p>
        </section>

        <section>
          <h2 className="text-porcelain text-lg font-semibold">What this site actually collects</h2>
          <p className="mt-2">
            Most products on this site can be bought directly: adding something to your basket and
            checking out is handled by Shopify, our e-commerce provider — see &quot;Third parties we
            use&quot; below for what that means in practice. Where a product has a real Shopify
            variant and (for a monthly subscription) a configured subscription plan, &quot;Add to
            basket&quot; adds it to a real, live basket rather than doing anything else.
          </p>
          <p className="mt-2">
            A few things on this site still just open an email in your own email app, addressed to
            us, rather than submitting anything to this site — the contact form, and the &quot;Apply
            to become a supplier&quot; button. The site itself doesn&apos;t capture or store what you
            type into either; we only receive whatever you choose to send. The same &quot;email
            instead&quot; fallback also appears on an individual product page if that specific
            product or subscription hasn&apos;t been fully set up for online checkout yet.
          </p>
          <p className="mt-2">
            Separately, this site also has a product review form, a restock-notification signup, and
            a newsletter signup (including a popup) — each described in its own section below,
            since each collects different information for a different purpose.
          </p>
          <p className="mt-2">
            We use whatever information we do receive only to fulfil your order, respond to your
            enquiry, arrange a subscription, or provide the specific feature you used (a review, a
            restock alert, a newsletter signup, or an Experience booking). We don&apos;t sell your
            data, and we don&apos;t share it with third parties for their own separate marketing —
            the one exception, Shopify&apos;s own platform-wide data use, is explained under
            &quot;Third parties we use&quot; below.
          </p>
        </section>

        <section>
          <h2 className="text-porcelain text-lg font-semibold">Marketing emails</h2>
          <p className="mt-2">
            If you tick &quot;Email me with news and offers&quot; at checkout, sign up on our order
            confirmation page, or use the newsletter signup popup that can appear while browsing the
            site, we&apos;ll email you when a new postcode honey arrives — and nothing else. We only
            ever add you if you actively opt in; nobody is signed up automatically just for placing
            an order, and the popup only ever appears once per browser (see &quot;Cookies and browser
            storage&quot; below).
          </p>
          <p className="mt-2">
            However you sign up, it&apos;s the same mechanism behind the scenes: it adds your email
            address as a Shopify customer with marketing consent switched on. These emails are then
            sent through Shopify Email, using the same Shopify account that handles our basket and
            checkout (see &quot;Third parties we use&quot; below) — your email address isn&apos;t
            passed to any separate mailing-list or advertising service. Every marketing email
            includes an unsubscribe link, or you can email us at{' '}
            <a
              href="mailto:gdpr@gertlushhoney.co.uk"
              className="text-comb-gold underline underline-offset-2"
            >
              gdpr@gertlushhoney.co.uk
            </a>{' '}
            and we&apos;ll remove you.
          </p>
          <p className="mt-2">
            If you ask to be notified when a sold-out product is back in stock, that&apos;s
            handled entirely separately from marketing emails: we tag your email against that
            specific product only, and you&apos;re not recorded as a marketing subscriber for
            asking. We&apos;ll email you directly and individually when that product is back — not
            through a general marketing send — and you can ask us to remove you at any time by
            emailing us.
          </p>
        </section>

        <section>
          <h2 className="text-porcelain text-lg font-semibold">Third parties we use</h2>
          <p className="mt-2">
            <strong className="text-porcelain">Shopify</strong> powers our basket and checkout. When
            you add something to your basket, Shopify creates and stores a cart on its own servers —
            your browser only holds a cookie referencing it (see &quot;Cookies and browser
            storage&quot; below). If you check out, Shopify collects your delivery address and
            payment details directly on its own hosted checkout page; we never see or store your
            card details ourselves. Shopify acts as a data processor for this information — see{' '}
            <a
              href="https://www.shopify.com/legal/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-comb-gold underline underline-offset-2"
            >
              Shopify&apos;s own privacy policy
            </a>{' '}
            for how it handles data.
          </p>
          <p className="mt-2">
            If you opt in to marketing emails (see &quot;Marketing emails&quot; above), Shopify
            also stores your email address as a subscriber and sends those emails on our behalf
            through Shopify Email — this is separate from, and only happens in addition to, its
            role in handling your basket and checkout.
          </p>
          <p className="mt-2">
            Shopify also uses aggregated data from across its whole merchant network — including
            some of ours — to improve fraud protection, checkout, and its own product features, as
            part of its platform-wide service (a feature Shopify calls &quot;Network
            Intelligence&quot;). This isn&apos;t the same as us running targeted adverts about you
            elsewhere: we don&apos;t use Facebook, Google or TikTok advertising integrations on this
            store, so this doesn&apos;t result in you being followed around with ads from us.
          </p>
          <p className="mt-2">
            <strong className="text-porcelain">Sanity</strong> is the content management system we
            use to publish and edit the honey, beekeeper and product information you see on this
            site. It also stores product reviews: if you submit one, your name, star rating,
            review text and submission date are stored there — we don&apos;t ask for or store an
            email address as part of a review. Reviews aren&apos;t shown until we approve them —
            once approved, your name and review text are displayed publicly on that product&apos;s
            page.
          </p>
          <p className="mt-2">
            If you book an Experience (e.g. a beekeeping visit), Sanity also keeps a record of that
            booking against the relevant date/session and your Shopify order number, so we can
            track how many places are left and flag it if two orders ever conflict over the same
            place. That record holds order numbers and booking details, not your name, email or
            address — those stay in Shopify, as part of the order itself.
          </p>
          <p className="mt-2">
            <strong className="text-porcelain">Vercel</strong> hosts this website and provides
            Vercel Web Analytics, our visit-counting tool (see &quot;Cookies and browser
            storage&quot; below) — it doesn&apos;t collect anything that identifies you
            personally.
          </p>
        </section>

        <section>
          <h2 className="text-porcelain text-lg font-semibold">Cookies and browser storage</h2>
          <p className="mt-2">
            We don&apos;t use any advertising or tracking cookies. A few things are stored in your
            browser: a small flag that remembers you&apos;ve seen the intro animation, for the
            length of your browsing session; a separate flag that remembers you&apos;ve seen the
            newsletter signup popup, so it doesn&apos;t show again on that browser; and, if
            you&apos;ve added something to your basket, a cookie holding a reference to your Shopify
            cart (kept for up to 30 days so your basket persists between visits). None of these
            identify you personally or track you elsewhere.
          </p>
          <p className="mt-2">
            We do use <strong className="text-porcelain">Vercel Web Analytics</strong> to see
            roughly how many people visit and which pages are popular — but it doesn&apos;t use
            cookies or store anything that identifies you; visitors are only ever counted
            anonymously, via a hash that&apos;s discarded after 24 hours. See our{' '}
            <a href="/legal/cookies" className="text-comb-gold underline underline-offset-2">
              Cookie Policy
            </a>{' '}
            for the full detail on both.
          </p>
        </section>

        <section>
          <h2 className="text-porcelain text-lg font-semibold">How long we keep it</h2>
          <p className="mt-2">
            Only as long as reasonably needed to deal with your order or enquiry, and to meet our
            own legal and accounting obligations. Basket data held by Shopify follows Shopify&apos;s
            own retention rules, not ours.
          </p>
        </section>

        <section>
          <h2 className="text-porcelain text-lg font-semibold">Your rights</h2>
          <p className="mt-2">
            Under UK GDPR you can ask us what personal data we hold about you, ask us to correct or
            delete it, or object to how we use it. Email{' '}
            <a
              href="mailto:gdpr@gertlushhoney.co.uk"
              className="text-comb-gold underline underline-offset-2"
            >
              gdpr@gertlushhoney.co.uk
            </a>{' '}
            — we&apos;ll respond within one month.
          </p>
        </section>

        <section>
          <h2 className="text-porcelain text-lg font-semibold">Data protection complaints</h2>
          <p className="mt-2">
            If you&apos;re unhappy with how we&apos;ve handled your personal data — including how
            we&apos;ve dealt with a rights request above — that&apos;s a data protection complaint,
            whether or not you call it that or use the email address above. We&apos;ll acknowledge
            it within 30 days, investigate properly, keep you updated, and tell you the outcome
            without unnecessary delay. If your message also raises something unrelated (like an
            order issue), we&apos;ll still progress the data protection part on its own timescale
            rather than waiting for everything else to be resolved.
          </p>
          <p className="mt-2">
            You can complain to the{' '}
            <a
              href="https://ico.org.uk"
              target="_blank"
              rel="noopener noreferrer"
              className="text-comb-gold underline underline-offset-2"
            >
              Information Commissioner&apos;s Office
            </a>{' '}
            at any time, including if you&apos;re unhappy with how we&apos;ve handled your
            complaint.
          </p>
        </section>

        <section>
          <h2 className="text-porcelain text-lg font-semibold">This will change</h2>
          <p className="mt-2">
            This site doesn&apos;t have customer accounts — there&apos;s no login and no order
            history stored on this site itself (your order history lives with Shopify, tied to
            your order confirmation email). As features on this site change — including if that
            changes — this notice will be updated to reflect exactly what&apos;s collected and why.
          </p>
        </section>
      </div>
    </div>
  )
}
