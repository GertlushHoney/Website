import type { Metadata } from 'next'
import { DraftNotice } from '@/components/legal/draft-notice'

export const metadata: Metadata = {
  title: 'Accessibility Statement',
  description: 'Accessibility statement for the Gert Lush Honey website.',
}

export default function AccessibilityPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <p className="text-honey-amber text-sm font-semibold tracking-wide uppercase">
        Accessibility
      </p>
      <h1 className="text-porcelain mt-3 text-4xl font-bold tracking-tight text-balance">
        Accessibility statement.
      </h1>

      <div className="mt-8">
        <DraftNotice />
      </div>

      <div className="text-porcelain/80 space-y-6 text-base">
        <section>
          <h2 className="text-porcelain text-lg font-semibold">Our target</h2>
          <p className="mt-2">
            We build and test this site against WCAG 2.1/2.2 AA. Every real page has been run
            through an automated audit and a manual review, and issues found by either have been
            fixed (2026-08-11) — but that&apos;s still our own testing, not an independent
            certification. See &quot;Known gaps&quot; below for what that doesn&apos;t cover.
          </p>
        </section>

        <section>
          <h2 className="text-porcelain text-lg font-semibold">How we test</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              Automated: every real page is crawled with axe-core against the WCAG 2.0/2.1/2.2 A
              and AA rule sets — currently 0 automated violations across all 26 pages.
            </li>
            <li>
              Manual: colour contrast is checked by hand for anything automated tools can&apos;t
              resolve on their own — in our case, most body text sits over a dark gradient
              background, which contrast checkers can&apos;t compute automatically. We calculate
              the actual rendered contrast for every text style and button border used on the
              site, against both ends of that gradient.
            </li>
            <li>
              Interactive components: the cookie preferences popover and basket drawer are opened
              for real and tested for keyboard operation — focus moves into the dialog when it
              opens, Escape closes it, and focus returns to where you were.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-porcelain text-lg font-semibold">What&apos;s in place today</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Skip-to-content link and visible keyboard focus states throughout</li>
            <li>The postcode map works fully by keyboard, with a non-map dropdown alternative</li>
            <li>Reduced-motion preferences are respected (the intro animation, map zoom)</li>
            <li>Semantic headings and landmark structure on every page</li>
            <li>All text and button-border colours meet WCAG AA contrast minimums (4.5:1 for
              normal text, 3:1 for large text and UI component boundaries)</li>
            <li>
              The cookie preferences popover and basket drawer are keyboard-operable dialogs:
              focus moves in on open, Escape closes them, and focus returns to the triggering
              button afterwards
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-porcelain text-lg font-semibold">Known gaps</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              No independent third-party accessibility audit — everything above is our own
              automated and manual testing, not external certification
            </li>
            <li>No testing with real assistive technology (screen readers, switch devices) or disabled users, beyond spot checks during development</li>
            <li>
              Checkout happens on Shopify&apos;s own hosted checkout page, outside this site&apos;s
              codebase — its accessibility is Shopify&apos;s responsibility, not something we can
              audit or fix here
            </li>
            <li>Account areas don&apos;t exist yet to test</li>
            <li>Mobile touch-target sizing hasn&apos;t been specifically measured against WCAG 2.5.8</li>
          </ul>
        </section>

        <section>
          <h2 className="text-porcelain text-lg font-semibold">Tell us about a problem</h2>
          <p className="mt-2">
            If something on this site is difficult to use, email{' '}
            <a
              href="mailto:gertlushhoney@outlook.com"
              className="text-comb-gold underline underline-offset-2"
            >
              gertlushhoney@outlook.com
            </a>{' '}
            and we&apos;ll do our best to fix it.
          </p>
        </section>
      </div>
    </div>
  )
}
