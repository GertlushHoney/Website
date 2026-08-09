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
            As of now, nothing you do on this website is sent to us automatically. Every
            &quot;order&quot;, &quot;subscribe&quot; or &quot;apply&quot; button on this site opens
            an email in your own email app, addressed to us — the site itself doesn&apos;t capture
            or store what you type. We only receive whatever you choose to send us by email.
          </p>
          <p className="mt-2">
            We use that information only to fulfil your order, respond to your enquiry, or arrange a
            subscription — nothing else, and we don&apos;t sell or share it with third parties for
            marketing.
          </p>
        </section>

        <section>
          <h2 className="text-porcelain text-lg font-semibold">Cookies and browser storage</h2>
          <p className="mt-2">
            We don&apos;t currently use any analytics, advertising, or tracking cookies. The only
            thing stored in your browser is a small flag that remembers you&apos;ve seen the intro
            animation, for the length of your browsing session — it doesn&apos;t identify you or
            track you anywhere. See our{' '}
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
            own legal and accounting obligations.
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
