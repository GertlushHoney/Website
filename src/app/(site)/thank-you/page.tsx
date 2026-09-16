import type { Metadata } from 'next'
import Link from 'next/link'
import { NewsletterSignupForm } from '@/components/marketing/newsletter-signup-form'
import { getActiveProductsByShopifyHandles } from '@/lib/sanity/active-product-lookup'

export const metadata: Metadata = {
  title: 'Thank You',
  robots: { index: false, follow: false },
}

// Checkout itself happens entirely on Shopify's hosted domain, not in this
// codebase, and Shopify no longer allows redirecting off its own Thank You
// page (Additional Scripts/checkout.liquid is being retired — see
// docs/launch-checklist.md point 9). So this page is reached via a link in
// the order confirmation email instead, not an automatic redirect.
// `order` and `email` are optional — this page must still work fine for
// anyone who lands here directly, or before that email link is set up.
//
// `products` (added 2026-09-16, "GET REVIEWS GOING") is the same idea,
// extended: a comma-separated list of the real Shopify handles from that
// order's line items, put there by the order-confirmation email template
// — see docs/launch-checklist.md for the exact Liquid snippet. Optional
// for the same reason `order`/`email` are: this page must still degrade
// gracefully (a generic prompt instead of a per-product one) for anyone
// who lands here directly, or before the email template is updated.
export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; email?: string; products?: string }>
}) {
  const { order, email, products: productsParam } = await searchParams
  const reviewableProducts = productsParam
    ? await getActiveProductsByShopifyHandles(productsParam.split(','))
    : []

  return (
    <div className="mx-auto max-w-xl px-6 py-20 text-center">
      <p className="text-honey-amber text-sm font-semibold tracking-wide uppercase">
        Order confirmed
      </p>
      <h1 className="text-porcelain mt-3 text-4xl font-bold tracking-tight text-balance">
        {order ? `Thank you — order ${order}` : 'Thank you for your order'}
      </h1>
      <p className="text-porcelain/70 mt-4 text-base">
        We&apos;re preparing your honey now. Orders normally dispatch within 3–5 working days, and
        you&apos;ll get a Royal Mail tracking email as soon as it&apos;s on its way. See our{' '}
        <Link href="/delivery" className="text-comb-gold underline underline-offset-2">
          delivery policy
        </Link>{' '}
        for the details.
      </p>

      <div className="border-ink-line bg-honeycomb-surface mt-10 rounded-2xl border p-6 sm:p-8">
        {reviewableProducts.length > 0 ? (
          <>
            <p className="text-porcelain text-lg font-semibold text-balance">
              How was it? We&apos;d love to know.
            </p>
            <p className="text-porcelain/70 mt-2 text-sm">
              A couple of honest lines helps other people trust what they&apos;re buying.
            </p>
            <div className="mt-5 flex flex-col items-center gap-2">
              {reviewableProducts.map((product) => (
                <Link
                  key={product.slug}
                  href={`/shop/${product.slug}`}
                  className="bg-honey-amber text-ink focus-visible:outline-porcelain inline-block rounded-full px-6 py-2.5 text-sm font-semibold focus-visible:outline focus-visible:outline-offset-4"
                >
                  Leave a review for {product.name}
                </Link>
              ))}
            </div>
          </>
        ) : (
          <>
            <p className="text-porcelain text-lg font-semibold text-balance">
              Enjoyed your order? We&apos;d love a review.
            </p>
            <p className="text-porcelain/70 mt-2 text-sm">
              A couple of honest lines on the product page helps other people trust what
              they&apos;re buying.
            </p>
            <div className="mt-5 flex justify-center">
              <Link
                href="/shop"
                className="bg-honey-amber text-ink focus-visible:outline-porcelain inline-block rounded-full px-6 py-2.5 text-sm font-semibold focus-visible:outline focus-visible:outline-offset-4"
              >
                Find what you ordered
              </Link>
            </div>
          </>
        )}
      </div>

      <div className="border-ink-line bg-honeycomb-surface mt-6 rounded-2xl border p-6 sm:p-8">
        <p className="text-porcelain text-lg font-semibold text-balance">
          Want to know when new postcode honey arrives?
        </p>
        <p className="text-porcelain/70 mt-2 text-sm">
          We&apos;ll only email you when a new honey lands — nothing else.
        </p>
        <div className="mt-5 flex justify-center">
          <NewsletterSignupForm defaultEmail={email} />
        </div>
      </div>

      <Link
        href="/shop"
        className="border-porcelain/40 bg-porcelain/10 text-porcelain hover:bg-porcelain/20 hover:border-porcelain focus-visible:outline-honey-amber mt-10 inline-block rounded-full border px-6 py-2.5 text-sm font-semibold focus-visible:outline focus-visible:outline-offset-4"
      >
        Continue shopping
      </Link>
    </div>
  )
}
