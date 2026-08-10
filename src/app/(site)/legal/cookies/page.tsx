import type { Metadata } from 'next'
import { DraftNotice } from '@/components/legal/draft-notice'

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'How Gert Lush Honey uses cookies and browser storage.',
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
            This site doesn&apos;t currently use any analytics, advertising or tracking cookies — so
            there&apos;s genuinely nothing to opt in or out of yet. You can still open{' '}
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
          <h2 className="text-porcelain text-lg font-semibold">Analytics (not currently used)</h2>
          <p className="mt-2">
            We don&apos;t run any analytics on this site yet. If that changes, we&apos;ll ask for
            your consent properly at the time — through the same Cookie options control — rather
            than switching anything on quietly.
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
