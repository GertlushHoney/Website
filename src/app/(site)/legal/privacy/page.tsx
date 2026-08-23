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
            Most &quot;order&quot;, &quot;subscribe&quot; or &quot;apply&quot; buttons on this site
            still just open an email in your own email app, addressed to us — the site itself
            doesn&apos;t capture or store what you type there. We only receive whatever you choose
            to send us by email.
          </p>
          <p className="mt-2">
            The exception is the basket: adding a honey jar or other product to your basket and
            checking out is handled directly by Shopify, our e-commerce provider — see &quot;Third
            parties we use&quot; below for what that means in practice.
          </p>
          <p className="mt-2">
            We use whatever information we do receive only to fulfil your order, respond to your
            enquiry, or arrange a subscription. We don&apos;t sell your data, and we don&apos;t
            share it with third parties for their own separate marketing — the one exception,
            Shopify&apos;s own platform-wide data use, is explained under &quot;Third parties we
            use&quot; below.
          </p>
        </section>

        <section>
          <h2 className="text-porcelain text-lg font-semibold">Marketing emails</h2>
          <p className="mt-2">
            If you tick &quot;Email me with news and offers&quot; at checkout, or sign up on our
            order confirmation page, we&apos;ll email you when a new postcode honey arrives — and
            nothing else. We only ever add you if you actively opt in; nobody is signed up
            automatically just for placing an order.
          </p>
          <p className="mt-2">
            These emails are sent through Shopify Email, using the same Shopify account that
            handles our basket and checkout (see &quot;Third parties we use&quot; below) — your
            email address isn&apos;t passed to any separate marketing or advertising service.
            Every marketing email includes an unsubscribe link, or you can email us at{' '}
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
            review text and submission date are stored there. Reviews aren&apos;t shown until we
            approve them — once approved, your name and review text are displayed publicly on that
            product&apos;s page.
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
            We don&apos;t use any advertising or tracking cookies. Two things are stored in your
            browser: a small flag that remembers you&apos;ve seen the intro animation, for the
            length of your browsing session; and, if you&apos;ve added something to your basket, a
            cookie holding a reference to your Shopify cart (kept for up to 30 days so your basket
            persists between visits). Neither identifies you personally or tracks you elsewhere.
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
            As online ordering, accounts and analytics get added to the site, this notice will be
            updated to reflect exactly what&apos;s collected and why.
          </p>
        </section>
      </div>
    </div>
  )
}
