import type { Metadata } from 'next'
import { DraftNotice } from '@/components/legal/draft-notice'

export const metadata: Metadata = {
  title: 'Privacy Notice',
  description: 'How Gert Lush Honey handles your personal data.',
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
            enquiry, or arrange a subscription — nothing else, and we don&apos;t sell or share it
            with third parties for marketing.
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
            <strong className="text-porcelain">Sanity</strong> is the content management system we
            use to publish and edit the honey, beekeeper and product information you see on this
            site. It doesn&apos;t collect any personal data from you as a visitor — it only stores
            the editorial content we&apos;ve written and published ourselves.
          </p>
        </section>

        <section>
          <h2 className="text-porcelain text-lg font-semibold">Cookies and browser storage</h2>
          <p className="mt-2">
            We don&apos;t currently use any analytics or advertising cookies. Two things are stored
            in your browser: a small flag that remembers you&apos;ve seen the intro animation, for
            the length of your browsing session; and, if you&apos;ve added something to your basket,
            a cookie holding a reference to your Shopify cart (kept for up to 30 days so your basket
            persists between visits). Neither identifies you personally or tracks you elsewhere. See
            our{' '}
            <a href="/legal/cookies" className="text-comb-gold underline underline-offset-2">
              Cookie Policy
            </a>{' '}
            for detail.
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
              href="mailto:gertlushhoney@outlook.com"
              className="text-comb-gold underline underline-offset-2"
            >
              gertlushhoney@outlook.com
            </a>{' '}
            and we&apos;ll deal with it directly. You can also complain to the{' '}
            <a
              href="https://ico.org.uk"
              target="_blank"
              rel="noopener noreferrer"
              className="text-comb-gold underline underline-offset-2"
            >
              Information Commissioner&apos;s Office
            </a>{' '}
            if you&apos;re unhappy with how we&apos;ve handled your data.
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
