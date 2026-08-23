import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { Manrope, Fraunces } from 'next/font/google'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { SkipLink } from '@/components/layout/skip-link'
import { Splash } from '@/components/layout/splash'
import { DisableContextMenu } from '@/components/layout/disable-context-menu'
import { CookiePreferences } from '@/components/legal/cookie-preferences'
import { CartProvider } from '@/components/cart/cart-context'
import { BasketDrawer } from '@/components/cart/basket-drawer'
import { NewsletterPopup } from '@/components/marketing/newsletter-popup'
import { getCart } from '@/lib/shopify/cart'
import { getNewsletterPopup } from '@/lib/sanity/newsletter-popup'
import { SITE_URL, SITE_NAME } from '@/lib/site-config'
import '../globals.css'

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
})

// Provisional display face standing in for the packaging logotype until the
// real label font is confirmed as licensed for web use — see
// /docs/brand-alignment-board.md, section "Typography".
const fraunces = Fraunces({
  variable: '--font-fraunces',
  subsets: ['latin'],
})

const description =
  'Small-batch honey from Bristol hives. Every jar has a postcode, a season and a story.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Gert Lush Honey — Bristol honey. Proper lush.',
    template: '%s — Gert Lush Honey',
  },
  description,
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: 'Gert Lush Honey — Bristol honey. Proper lush.',
    description,
    url: '/',
    images: [{ url: '/images/brand/primary-logo.png', width: 1448, height: 1086 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gert Lush Honey — Bristol honey. Proper lush.',
    description,
    images: ['/images/brand/primary-logo.png'],
  },
}

// Same address already published in plain text on the Terms and Privacy
// pages — this just makes it machine-readable for search engines, not a new
// disclosure. No `sameAs` social profiles: none exist yet (see
// docs/technical-architecture.md, "Email routing" — no Facebook/Instagram
// integration is connected), so none are invented here.
const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/images/brand/primary-logo.png`,
  address: {
    '@type': 'PostalAddress',
    streetAddress: '14 Beckington Road',
    addressLocality: 'Bristol',
    postalCode: 'BS3 5EB',
    addressCountry: 'GB',
  },
}

export default async function RootLayout({ children }: LayoutProps<'/'>) {
  const initialCart = await getCart()
  const newsletterPopup = await getNewsletterPopup()

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${manrope.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="bg-ink text-porcelain flex min-h-full flex-col font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <CartProvider initialCart={initialCart}>
          <DisableContextMenu />
          <Splash />
          <SkipLink />
          <SiteHeader />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <SiteFooter />
          <CookiePreferences />
          <BasketDrawer />
          <NewsletterPopup content={newsletterPopup} />
        </CartProvider>
        <Analytics />
      </body>
    </html>
  )
}
