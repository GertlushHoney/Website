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
            We&apos;re building this site to meet WCAG 2.2 AA. It&apos;s a genuine target we design
            and test against, not a claim of full compliance yet — a proper audit hasn&apos;t been
            done.
          </p>
        </section>

        <section>
          <h2 className="text-porcelain text-lg font-semibold">What&apos;s in place today</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Skip-to-content link and visible keyboard focus states throughout</li>
            <li>The postcode map works fully by keyboard, with a non-map dropdown alternative</li>
            <li>Reduced-motion preferences are respected (the intro animation, map zoom)</li>
            <li>Semantic headings and landmark structure on every page</li>
          </ul>
        </section>

        <section>
          <h2 className="text-porcelain text-lg font-semibold">Known gaps</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>No formal third-party accessibility audit yet</li>
            <li>No screen-reader testing beyond spot checks during development</li>
            <li>Checkout and account areas don&apos;t exist yet to test</li>
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
