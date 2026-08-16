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

export const metadata: Metadata = {
  title: {
    default: 'Gert Lush Honey — Bristol honey. Proper lush.',
    template: '%s — Gert Lush Honey',
  },
  description:
    'Small-batch honey from Bristol hives. Every jar has a postcode, a season and a story.',
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
