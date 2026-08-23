import type { Metadata } from 'next'
import { DraftNotice } from '@/components/legal/draft-notice'

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'How Gert Lush Honey uses cookies and browser storage.',
  alternates: { canonical: '/legal/cookies' },
}

export default function CookiesPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <p className="text-honey-amber text-sm font-semibold tracking-wide uppercase">
        Cookie Policy
      </p>
      <h1 className="text-porcelain mt-3 text-4xl font-bold tracking-tight text-balance">
        Cookies, honestly.
      </h1>

      <div className="mt-8">
        <DraftNotice />
      </div>

      <div className="text-porcelain/80 space-y-6 text-base">
        <section>
          <h2 className="text-porcelain text-lg font-semibold">The short version</h2>
          <p className="mt-2">
            This site doesn&apos;t set any advertising or tracking cookies. We do use an analytics
            service (Vercel Web Analytics, see below) to see roughly how many people visit and
            which pages they land on — but it doesn&apos;t use cookies either, so there&apos;s
            genuinely nothing to opt in or out of. You can still open{' '}
            <span className="text-porcelain font-medium">Cookie options</span> (bottom-right of any
            page) to see exactly what&apos;s stored.
          </p>
        </section>

        <section>
          <h2 className="text-porcelain text-lg font-semibold">Essential (always on)</h2>
          <p className="mt-2">
            A single flag, stored in your browser&apos;s session storage, that remembers you&apos;ve
            already seen the intro logo animation so it doesn&apos;t replay on every page. It clears
            automatically when you close the tab, isn&apos;t sent to us or anyone else, and
            doesn&apos;t identify you.
          </p>
          <p className="mt-2">
            If you add something to your basket, we also set a cookie (<code>gl_cart_id</code>)
            holding a reference to your Shopify cart, kept for up to 30 days so your basket
            persists between visits. It&apos;s strictly necessary for the basket to work, and
            doesn&apos;t identify you or track you anywhere else.
          </p>
        </section>

        <section>
          <h2 className="text-porcelain text-lg font-semibold">Analytics</h2>
          <p className="mt-2">
            We use <strong className="text-porcelain">Vercel Web Analytics</strong>, run by Vercel
            (who also host this site), to see roughly how many people visit and which pages are
            popular. It works without cookies: visitors are identified only by a hash generated
            from that individual request, which isn&apos;t stored permanently and is automatically
            discarded after 24 hours — there&apos;s no persistent identifier that could recognise
            you on a return visit or be linked back to you personally. What it records per page
            view is anonymous and aggregate only: the page URL, referring site, approximate
            location (country/region, not your IP address), and device/browser type.
          </p>
          <p className="mt-2">
            Because it doesn&apos;t use cookies or collect anything that identifies you, UK
            PECR&apos;s cookie-consent rules don&apos;t apply to it, which is why it&apos;s on by
            default rather than behind a toggle above. See{' '}
            <a
              href="https://vercel.com/docs/analytics/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-comb-gold underline underline-offset-2"
            >
              Vercel&apos;s Web Analytics privacy documentation
            </a>{' '}
            for the full technical detail.
          </p>
        </section>

        <section>
          <h2 className="text-porcelain text-lg font-semibold">Third parties</h2>
          <p className="mt-2">
            Nothing on this site itself loads third-party cookies. If you go to checkout, you leave
            this site for Shopify&apos;s own hosted checkout page, where Shopify sets its own
            cookies to process your order — that&apos;s covered by{' '}
            <a
              href="https://www.shopify.com/legal/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-comb-gold underline underline-offset-2"
            >
              Shopify&apos;s own privacy policy
            </a>
            , not this one.
          </p>
        </section>
      </div>
    </div>
  )
}
